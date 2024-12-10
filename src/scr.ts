import { BgFunc, ReqT, ReqTarget, ResT } from "./lib/types/msg";
import { err, send_msg_wrapper, succ } from "./lib/msg";
import {
  elem_to_xpath,
  event_type_to_event_name,
  get_dom_properties,
  get_element_by_xpath,
} from "./lib/dom";
import browser from "webextension-polyfill";
import {
  ActionT,
  DomProperty,
  ExtesionStorageT,
  LastElementT,
  ModifiedProperty,
  NewEventT,
  ParsedEventT,
  RunActionDataT,
} from "./lib/types/fuzzer";
import { elem_id_to_elem, get_storage } from "./lib/storage_helper";
import { PLACEHOLDER_BRACKET_C, PLACEHOLDER_BRACKET_O } from "./lib/constants";
import { AcceptedType, Indexable } from "./lib/types/general";

let ac: AbortController | null = null;

const PLACEHOLDER_REGEX = /\{(.*?)\}/g;

let last_comb: string[] | null = null;

async function run_with_limit(
  tasks: (() => Promise<void>)[],
  limit: number,
  sig: AbortSignal,
): Promise<void> {
  const tasks_len = tasks.length;
  let i = 0;

  while (i < tasks_len) {
    check_abort(sig);
    const current_tasks = tasks.slice(i, i + limit);

    await Promise.all(current_tasks.map((t) => t()));

    i += limit;
  }
}

function get_wordlist_entries_by_name(
  s: ExtesionStorageT,
  name: string,
): string[] {
  const wl = s.wordlists.find((w) => w.name === name);
  if (!wl) throw new Error(`invalid wordlist name: ${name}`);

  return [...wl.content.split("\n")];
}

async function parse_placeholders(
  instructions: NewEventT[],
  s: ExtesionStorageT,
): Promise<string[][]> {
  const placeholders: string[][] = new Array();
  let counter = 0;

  const update_placeholders = (str: string): string => {
    return str.replace(PLACEHOLDER_REGEX, (_, wname: string) => {
      const wl = get_wordlist_entries_by_name(s, wname);
      placeholders[counter] = wl;
      return `${PLACEHOLDER_BRACKET_O}${counter++}${PLACEHOLDER_BRACKET_C}`;
    });
  };

  for (let i = 0; i < instructions.length; ++i) {
    const ins: NewEventT = instructions[i];

    if (ins.type === "change_property") {
      ins.input_val = update_placeholders(ins.input_val);
    } else if (ins.type === "event_dispatch" && ins.modified_event_properties) {
      for (let j = 0; j < ins.modified_event_properties.length; ++j) {
        const p = ins.modified_event_properties[j];
        if (p.value && p.type === "string" && typeof p.value === "string")
          ins.modified_event_properties[j].value = update_placeholders(p.value);
      }
    }
  }

  return placeholders;
}

function get_combinations(placeholders: string[][]): string[][] {
  const get_cartesian_prod = (arr: string[][]): string[][] =>
    arr.reduce<string[][]>(
      (a, b) => a.flatMap((x) => b.map((y) => [...x, y])),
      [[]],
    );

  return get_cartesian_prod(placeholders);
}

function parse_dom_prop(p: DomProperty, v: string): AcceptedType {
  if (p.type === "string") return v;
  else if (p.type === "number") return parseInt(v as string);
  else if (p.type === "boolean") return v === "1";
  else throw new Error("dom prop type is unexpected, bug in a code");
}

function prepare_event(ev_type: string, props: ModifiedProperty[]): Event {
  const ev_name = event_type_to_event_name(ev_type);
  if (!ev_name) throw new Error(`${ev_type} couldn't be mapped to ev`);

  const parsed_props = props.reduce((prev, curr) => {
    const parsed_val = parse_dom_prop(curr, curr.value);
    Object.assign(prev, { [curr.name]: parsed_val });
    return prev;
  }, {});

  return new (window as Indexable)[ev_name](ev_type, parsed_props);
}

const check_abort = (sig: AbortSignal) => {
  if (sig.aborted) throw new Error("Operation aborted");
};

function get_node_or_throw(s: ExtesionStorageT, elem_id: string): Node {
  let node: Node | null = null;

  const el = elem_id_to_elem(s, elem_id);
  if (!el) throw new Error(`no element with id ${elem_id}, skipping`);

  node = get_element_by_xpath(el.xpath);
  if (!node) throw new Error(`no node with xpath ${el.xpath}, skipping`);

  return node;
}

type TaskT = () => Promise<void>;

function event_function_constructor(a: ParsedEventT): () => Promise<void> {
  switch (a.type) {
    case "delay":
      return async () => {
        await new Promise((r) => setTimeout(r, a.amount));
      };
    case "event_dispatch":
      return async () => {
        last_comb = a.comb;
        a.node.dispatchEvent(a.ev);
      };
    case "change_property":
      return async () => {
        last_comb = a.comb;
        (a.node as Indexable)[a.prop_name] = a.parsed_val;
      };
  }
}

async function handle_action(action_data: RunActionDataT, sig: AbortSignal) {
  const b_all = Date.now();
  const s = await get_storage();
  const _action = s.actions.find((a) => a.id === action_data.action_id);
  if (!_action) throw new Error("invalid action");

  const action: ActionT = JSON.parse(JSON.stringify(_action));

  check_abort(sig);
  const plh = await parse_placeholders(action.instructions, s);
  const combinations = get_combinations(plh);

  check_abort(sig);
  const replace_placeholders = (str: string, comb: string[]): string => {
    return str.replace(PLACEHOLDER_REGEX, (_, placeholder) => {
      const placeholder_num = parseInt(placeholder);
      return comb[placeholder_num];
    });
  };

  if (!combinations.length) combinations.push([]);

  check_abort(sig);

  console.log("parsing actions");
  const actions: ParsedEventT[] = combinations.reduce((prev, comb) => {
    const ins_clone: NewEventT[] = JSON.parse(
      JSON.stringify(action.instructions),
    );
    check_abort(sig);

    const parsed: ParsedEventT[] = ins_clone.map((ins) => {
      let parsed_ins: ParsedEventT;

      switch (ins.type) {
        case "change_property":
          ins.elem_id;
          parsed_ins = {
            type: "change_property",
            node: get_node_or_throw(s, ins.elem_id),
            prop_name: ins.selected_prop!.name,
            parsed_val: replace_placeholders(ins.input_val, comb),
            comb,
          };
          break;
        case "event_dispatch":
          for (let j = 0; j < ins.modified_event_properties.length; ++j) {
            const p = ins.modified_event_properties[j];
            if (p.value && p.type === "string" && typeof p.value === "string")
              ins.modified_event_properties[j].value = replace_placeholders(
                p.value,
                comb,
              );
          }
          parsed_ins = {
            type: "event_dispatch",
            node: get_node_or_throw(s, ins.elem_id),
            ev: prepare_event(ins.event_name, ins.modified_event_properties),
            comb,
          };
          break;
        case "delay":
          parsed_ins = { ...ins, comb };
          break;
        case "none":
          throw new Error(
            "none event in parsing function, it's a bug in a code",
          );
      }

      return parsed_ins;
    });
    prev.push(...parsed);
    return prev;
  }, [] as ParsedEventT[]);

  console.log("starting");
  check_abort(sig);

  const tasks: TaskT[] = [];

  const alert_callback = (e: MessageEvent<any>) => {
    const d: ReqT = e.data;

    if (
      d &&
      d.func === BgFunc.ALERT_NOTIFY &&
      d.target === ReqTarget.CS &&
      last_comb
    )
      console.log(last_comb);
  };

  if (action_data.log_alerts)
    window.addEventListener("message", alert_callback);

  for (let i = 0; i < Math.max(action.rep, 1); ++i) {
    for (const a of actions) {
      tasks.push(event_function_constructor(a));
    }
  }

  await run_with_limit(tasks, Math.max(action.rep_conc, 1), sig);
  if (action_data.log_alerts)
    window.removeEventListener("message", alert_callback);

  console.log(`took ${Date.now() - b_all}`);
}

document.addEventListener(
  "contextmenu",
  async (e) => {
    if (e.target === null) return;
    const el: Element = e.target as Element;

    const last_elem: LastElementT = {
      name: `new ${el.tagName.toLowerCase()}`,
      xpath: elem_to_xpath(el),
      properties: get_dom_properties(el),
    };

    await send_msg_wrapper({
      target: ReqTarget.BG,
      func: BgFunc.UPDATE_LAST_CONTEXT_MENU_TARGET,
      data: last_elem,
    });
  },
  true,
);

browser.runtime.onMessage.addListener(
  async (r: ReqT): Promise<ResT<unknown>> => {
    try {
      if (r.target !== ReqTarget.CS) return succ();

      if (!r || r.func === undefined)
        return err(
          "received invalid message, request or function is undefined",
        );

      const handlers: Partial<Record<BgFunc, () => Promise<ResT<unknown>>>> = {
        [BgFunc.GET_PROPS_BY_XPATH]: async () => {
          if (!r.data) return err("no xpath");

          const xpath = r.data as string;
          const elem = get_element_by_xpath(xpath);
          if (!elem) return err("element doesn't exist");

          return succ(get_dom_properties(elem));
        },
        [BgFunc.CANCEL_ACTION]: async () => {
          if (ac) {
            ac.abort();
            console.log(
              "operation aborted while running",
              (window as Indexable).last_comb,
            );
          }

          return succ();
        },
        [BgFunc.IS_RUNNING]: async () => succ(!!ac),
        [BgFunc.RUN_ACTION]: async () => {
          if (ac) return err("some action is already running");
          ac = new AbortController();

          const action_data = r.data as RunActionDataT;

          try {
            await (async (sig: AbortSignal) => {
              return new Promise<void>((res, rej) => {
                const on_abort = () => {
                  console.log("abort signal received");
                  rej("aborted");
                };

                sig.addEventListener("abort", on_abort);

                handle_action(action_data, sig)
                  .then(() => {
                    res();
                  })
                  .catch((e) => {
                    rej(e);
                  })
                  .finally(() => {
                    sig.removeEventListener("abort", on_abort);
                  });
              });
            })(ac.signal);
          } catch (e) {
            console.error(e);
            return err(`${e}`);
          } finally {
            ac = null;

            await send_msg_wrapper({
              func: BgFunc.STOPPED,
              target: ReqTarget.REACT,
            });
          }

          return succ();
        },
      };

      const handler = handlers[r.func];
      return handler ? await handler() : err("invalid function called");
    } catch (e) {
      return err(`error occured in scr handler: ${e}`);
    }
  },
);

// inject alert notifier
(() => {
  const s = document.createElement("script");
  s.textContent = `
    (function() {
      window.alert = function(message) {
        window.postMessage({
          func: ${BgFunc.ALERT_NOTIFY},
          target: ${ReqTarget.CS},
        });
      };
    })();
  `;
  document.documentElement.appendChild(s);
  s.remove();
})();
