import { Dispatch, SetStateAction, useState } from "react";
import {
  ActionT,
  DelayEventEvT,
  Direc,
  DispatchEventEvT,
  DomProperty,
  ExtesionStorageT,
  ModifyDomEvT,
  NewEventT,
  NewEventTypeT,
  RunActionDataT,
} from "../../lib/types/fuzzer";
import {
  add_event_to_action,
  change_position,
  delete_event,
  remove_action,
  update_action,
} from "../../lib/storage_helper";
import browser from "webextension-polyfill";
import { BgFunc, ReqT, ReqTarget } from "../../lib/types/msg";
import ExpandableCard from "../../components/expandable_card";
import Button from "../../components/button";
import { AnimatePresence, motion } from "framer-motion";
import EventItem from "./event_item";
import CheckboxExpandableContent from "../../components/checkbox_expandable_content";
import Input from "../../components/input";
import Label from "../../components/label";
import {
  event_to_properties,
  event_type_to_event,
  get_event_types,
} from "../../lib/dom";
import ElementPropertyValue from "../../components/element_property_value";
import SelectWithLabel from "../../components/select";
import { FaPlus, FaTrash } from "react-icons/fa";
import { MS } from "../../lib/types/general";
import { KeyValuesInput } from "../../components/key_values_input";
import { Checkbox } from "../../components/checkbox";

type ActionItemProps = {
  action: ActionT;
  storage: ExtesionStorageT;
  set_state: Dispatch<SetStateAction<ExtesionStorageT | null>>;
  tab_id: number;
  running: boolean;
};

function AddDelay({
  new_event,
  set_new_event,
}: {
  new_event: DelayEventEvT;
  set_new_event: MS<NewEventT>;
}) {
  return (
    <>
      <Input
        type="number"
        value={new_event.amount}
        on_change={(v) => {
          set_new_event((p) => ({ ...p, amount: parseInt(v) }));
        }}
        label="Delay (ms)"
        min={1}
        required={true}
      />
    </>
  );
}

function ElementSelect({
  storage,
  new_event,
  set_new_event,
}: {
  storage: ExtesionStorageT;
  new_event: NewEventT;
  set_new_event: MS<NewEventT>;
}) {
  if (
    new_event.type !== "change_property" &&
    new_event.type !== "event_dispatch"
  )
    throw new Error("invalid type passed to element select component");

  return (
    <>
      <Label label="Element" required={true} />
      <select
        value={new_event.elem_id}
        onChange={(e) => {
          if (!e) return;
          set_new_event((p) => ({
            ...p,
            elem_id: e.target.value,
          }));
        }}
        className="w-full p-2 rounded-md border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300 ease-in-out appearance-none bg-white custom-select"
      >
        <option value={""}>Select element</option>
        {storage.elems.map((e) => (
          <option value={e.id}>{e.name}</option>
        ))}
      </select>
    </>
  );
}

function EventDispatchForm({
  storage,
  ev,
  set_ev,
}: {
  storage: ExtesionStorageT;
  ev: DispatchEventEvT;
  set_ev: MS<NewEventT>;
}) {
  const evs = get_event_types();
  const event = event_type_to_event(ev.event_name);
  const event_props = event === null ? null : event_to_properties(event);

  const [selected_prop, set_selected_prop] = useState<DomProperty | null>(null);
  const [input_value, set_input_value] = useState<string>("");

  const is_prop_selected =
    !!ev.elem_id && !!ev.event_name && event_props !== null;

  const handle_add_property = () => {
    if (selected_prop && !!input_value) {
      set_ev((_pe) => {
        const pe = _pe as DispatchEventEvT;

        return {
          ...pe,
          modified_event_properties: [
            ...pe.modified_event_properties,
            {
              ...selected_prop,
              value: input_value,
            },
          ],
        };
      });
    } else {
      console.error(
        "selected prop or input val is null, can't add new property",
      );
    }
  };

  const handle_remove_prop = (name: string) => {
    set_ev((_p) => {
      const p = _p as DispatchEventEvT;
      return {
        ...p,
        modified_event_properties: p.modified_event_properties.filter(
          (p) => p.name !== name,
        ),
      };
    });
  };

  return (
    <>
      <ElementSelect storage={storage} new_event={ev} set_new_event={set_ev} />

      <SelectWithLabel
        label="Event"
        options={evs}
        value={ev.event_name}
        on_change={(v) => set_ev((p) => ({ ...p, event_name: v }))}
        option_label={(o) => o}
        option_value={(o) => o}
      />

      {is_prop_selected && (
        <div>
          <KeyValuesInput
            label="Property"
            props_suggestion={event_props}
            on_new_value={(v) => {
              set_selected_prop(v);
              set_input_value("");
            }}
          />

          <AnimatePresence>
            {selected_prop && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <ElementPropertyValue
                  storage={storage}
                  value={input_value}
                  on_change={(v) => set_input_value(v)}
                  property={selected_prop}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handle_add_property}
            disabled={!selected_prop || !input_value}
            className="w-full bg-pink-500 text-white py-2 rounded-md hover:bg-pink-600 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus className="inline mr-2" />
            Add Property
          </button>

          <AnimatePresence>
            {ev.modified_event_properties.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <h3 className="text-xl font-semibold text-pink-800 mb-2">
                  Modified Properties
                </h3>
                <ul className="space-y-2">
                  {ev.modified_event_properties.map((m) => (
                    <motion.li
                      key={m.name}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm"
                    >
                      <span className="text-pink-700">
                        {m.name}: <strong>{String(m.value)}</strong>
                      </span>
                      <button
                        onClick={() => handle_remove_prop(m.name)}
                        className="text-pink-600 hover:text-pink-800 transition-colors duration-200"
                      >
                        <FaTrash />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}

function ModifyDomProperty({
  storage,
  ev,
  set_ev,
}: {
  storage: ExtesionStorageT;
  ev: ModifyDomEvT;
  set_ev: MS<NewEventT>;
}) {
  const curr_elem_dom_props =
    storage.elems.find((e) => e.id === ev.elem_id)?.properties || [];

  return (
    <>
      <ElementSelect storage={storage} new_event={ev} set_new_event={set_ev} />

      {curr_elem_dom_props.length > 0 && (
        <div>
          <KeyValuesInput
            label="Property"
            props_suggestion={curr_elem_dom_props}
            on_new_value={(v) => {
              set_ev((p) => ({ ...p, selected_prop: v, input_val: "" }));
            }}
          />

          {ev.selected_prop && (
            <ElementPropertyValue
              storage={storage}
              value={ev.input_val}
              on_change={(v) => set_ev((p) => ({ ...p, input_val: v }))}
              property={ev.selected_prop}
            />
          )}
        </div>
      )}
    </>
  );
}

function is_new_event_submitable(ev: NewEventT): boolean {
  switch (ev.type) {
    case "change_property":
      return !!ev.elem_id && ev.selected_prop !== null && !!ev.input_val;
    case "event_dispatch":
      return !!ev.elem_id && !!ev.event_name;
    case "delay":
      return ev.amount !== 0;
    case "none":
      return false;
  }
}

function NewEvent({
  storage,
  add,
}: {
  storage: ExtesionStorageT;
  add: (ne: NewEventT) => void;
}) {
  const [new_event, set_new_event] = useState<NewEventT>({ type: "none" });

  let res: JSX.Element;

  switch (new_event.type) {
    case "change_property":
      res = (
        <ModifyDomProperty
          ev={new_event}
          set_ev={set_new_event}
          storage={storage}
        />
      );
      break;
    case "event_dispatch":
      res = (
        <EventDispatchForm
          ev={new_event}
          set_ev={set_new_event}
          storage={storage}
        />
      );
      break;
    case "delay":
      res = <AddDelay new_event={new_event} set_new_event={set_new_event} />;
      break;
    default:
      res = <></>;
  }

  function init_new_ev(v: NewEventTypeT) {
    switch (v) {
      case "delay":
        set_new_event({ type: "delay", amount: 0 });
        break;
      case "event_dispatch":
        set_new_event({
          type: "event_dispatch",
          event_name: "",
          elem_id: "",
          modified_event_properties: [],
        });
        break;
      case "change_property":
        set_new_event({
          type: "change_property",
          elem_id: "",
          selected_prop: null,
          input_val: "",
        });
        break;
      case "none":
        set_new_event({ type: "none" });
        break;
    }
  }

  return (
    <>
      <select
        onChange={(e) => init_new_ev(e.target.value as NewEventTypeT)}
        value={new_event?.type || ""}
        className="w-full p-2 rounded-md border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300 ease-in-out appearance-none bg-white custom-select"
      >
        <option value="none">Add event</option>
        <option value="change_property">Change DOM property</option>
        <option value="event_dispatch">Dispatch event</option>
        <option value="delay">Delay</option>
      </select>
      {res}

      <Button
        disabled={!is_new_event_submitable(new_event)}
        on_click={() => {
          add(new_event);
          init_new_ev("none");
        }}
      >
        Add event
      </Button>
    </>
  );
}

export default function ActionItem({
  action,
  storage,
  set_state,
  tab_id,
  running: init_running,
}: ActionItemProps) {
  const [running, set_running] = useState<boolean>(init_running);
  const [log_alerts, set_log_alerts] = useState<boolean>(false);

  async function local_update_action(na: ActionT) {
    set_state(await update_action(na));
  }

  browser.runtime.onMessage.addListener((req: ReqT) => {
    if (req.target === ReqTarget.REACT) {
      set_running(false);
    }
  });

  return (
    <ExpandableCard
      header={
        <div className="text-sm text-pink-700">
          <span>
            Repetitions: {action.rep === 0 ? "Once" : action.rep}
            {action.rep !== 0 && `, Interval: ${action.rep_interval}ms`}
          </span>
          <Button
            disabled={!action.instructions.length}
            on_click={async () => {
              try {
                if (!running) set_running(true);
                await browser.tabs.sendMessage(tab_id, {
                  func: running ? BgFunc.CANCEL_ACTION : BgFunc.RUN_ACTION,
                  data: running
                    ? undefined
                    : ({
                        tab_id,
                        action_id: action.id,
                        log_alerts,
                      } as RunActionDataT),
                  target: ReqTarget.CS,
                } as ReqT);
                if (!running) set_running(false);
              } catch (e) {
                console.error(`error occurred in run action btn: ${e}`);
              }
            }}
          >
            {running ? "Cancel" : "Run"}
          </Button>
          <Checkbox
            name="log comb causing alerts"
            checked={log_alerts}
            on_change={(v) => set_log_alerts(v)}
          />
        </div>
      }
      title={action.name}
      on_delete={async () => set_state(await remove_action(action.id))}
    >
      <motion.div
        className="mt-4"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CheckboxExpandableContent
          name="Repeat"
          opened={action.rep !== 0}
          open={() => local_update_action({ ...action, rep: 1 })}
          close={() => local_update_action({ ...action, rep: 0 })}
        >
          <Input
            type="number"
            value={action.rep_conc}
            on_change={(v) => {
              local_update_action({ ...action, rep_conc: parseInt(v) });
            }}
            label="Concurrent"
            min={1}
            required={true}
          />
          <Input
            type="number"
            value={action.rep}
            on_change={(v) => {
              local_update_action({ ...action, rep: parseInt(v) });
            }}
            label="Repetitions"
            min={0}
            required={true}
          />
          <Input
            min={1}
            type="number"
            value={action.rep_interval}
            on_change={(v) => {
              if (typeof v !== "number")
                throw new Error("interval is not a number");
              local_update_action({ ...action, rep_interval: v });
            }}
            label="Interval (ms)"
            required={true}
          />
        </CheckboxExpandableContent>

        <h4 className="text-md font-semibold text-pink-800 mb-2">Events</h4>
        <AnimatePresence>
          {action.instructions.map((ins, i) => (
            <EventItem
              ev_count={action.instructions.length}
              key={i}
              index={i}
              ins={ins}
              on_move={async (d: Direc) => {
                set_state(await change_position(action.id, i, d));
              }}
              on_delete={async () => {
                set_state(await delete_event(action.id, i));
              }}
            />
          ))}
        </AnimatePresence>
        <div className="mt-2">
          <NewEvent
            storage={storage}
            add={async (ne) => {
              console.log(ne);
              set_state(await add_event_to_action(action.id, ne));
            }}
          />
        </div>
      </motion.div>
    </ExpandableCard>
  );
}
