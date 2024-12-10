import browser from "webextension-polyfill";
import {
  ActionT,
  Direc,
  DomProperty,
  ElementT,
  ExtesionStorageT,
  NewEventT,
  WordlistT,
} from "./types/fuzzer";
import { v4 } from "uuid";
import { ValidationError } from "./error";

export const STORAGE_NAME = "storage";

const default_state: ExtesionStorageT = {
  actions: [],
  elems: [],
  wordlists: [],
};

export async function reset_storage() {
  await browser.storage.local.clear();
}

export async function get_storage(): Promise<ExtesionStorageT> {
  const s = (await browser.storage.local.get(STORAGE_NAME))[STORAGE_NAME];
  if (!s) return set_storage(default_state);

  return s;
}

export async function set_storage(
  s: ExtesionStorageT,
): Promise<ExtesionStorageT> {
  await browser.storage.local.set({ [STORAGE_NAME]: s });
  return s;
}

export async function add_element(
  name: string,
  xpath: string,
  properties: DomProperty[],
): Promise<ExtesionStorageT> {
  const s = await get_storage();
  s.elems.push({
    id: v4(),
    name,
    xpath,
    properties,
  });
  return await set_storage(s);
}

export async function remove_element(
  elem_id: string,
): Promise<ExtesionStorageT> {
  const s = await get_storage();

  if (
    s.actions.some((a) =>
      a.instructions.some(
        (i) =>
          (i.type === "change_property" || i.type === "event_dispatch") &&
          i.elem_id === elem_id,
      ),
    )
  )
    throw new ValidationError("element is used by some action");

  return await set_storage({
    ...s,
    elems: s.elems.filter((e) => e.id !== elem_id),
  });
}

export async function update_element_name(
  id: string,
  name: string,
): Promise<ExtesionStorageT> {
  const s = await get_storage();

  return set_storage({
    ...s,
    elems: s.elems.map((e) => (e.id === id ? { ...e, name } : e)),
  });
}

export async function remove_action(id: string) {
  const s = await get_storage();
  return await set_storage({
    ...s,
    actions: s.actions.filter((e) => e.id !== id),
  });
}

export async function add_action(
  _name: string,
  rep: number,
  int: number,
): Promise<ExtesionStorageT> {
  const name = _name.trim();
  if (!name) throw new ValidationError("name is null");
  if (rep < 0) throw new ValidationError("repetition must be at least 0");
  if (rep !== 0 && int < 1)
    throw new ValidationError("interavl must be at least 1");

  const s = await get_storage();

  s.actions.push({
    id: v4(),
    name,
    instructions: [],
    rep: rep,
    rep_interval: rep === 0 ? 0 : int,
    rep_conc: 0,
  });

  return await set_storage(s);
}

function is_element_id_valid(s: ExtesionStorageT, id: string) {
  return s.elems.find((e) => e.id === id) !== undefined;
}

export async function add_event_to_action(
  action_id: string,
  ne: NewEventT,
): Promise<ExtesionStorageT> {
  const s = await get_storage();

  if (ne.type === "none") throw new ValidationError("tried to add none event");
  if (ne.type === "delay" && ne.amount < 1)
    throw new ValidationError("invalid delay amount");
  if (ne.type === "event_dispatch") {
    if (!is_element_id_valid(s, ne.elem_id))
      throw new ValidationError("event references invalid elem_id");
    if (!ne.event_name)
      throw new ValidationError("no event name in event dispatch");
    for (let i = 0; i < ne.modified_event_properties.length; ++i) {
      const p = ne.modified_event_properties[i];
      if (!p.name || !p.value)
        throw new ValidationError("event prop name or value is null");
    }
  }
  if (ne.type === "change_property") {
    if (!ne.selected_prop || !ne.input_val)
      throw new ValidationError("selected prop or input value is invalid");
    if (!is_element_id_valid(s, ne.elem_id))
      throw new ValidationError("property change references invalid elem_id");
  }

  const oa = s.actions.find((a) => a.id === action_id);
  if (!oa) return s;

  oa.instructions.push(ne);

  return set_storage({
    ...s,
    actions: s.actions.map((a) => (a.id === oa.id ? oa : a)),
  });
}

export async function change_position(
  a_id: string,
  i: number,
  d: Direc,
): Promise<ExtesionStorageT> {
  const s = await get_storage();

  const a = s.actions.find((ac) => ac.id === a_id);
  if (!a) return s;

  const ev_len = a.instructions.length;
  const ni = i + (d === Direc.UP ? -1 : 1);
  if (i < 0 || i >= ev_len || ni < 0 || ni >= ev_len) return s;

  const tmp = a.instructions[ni];
  a.instructions[ni] = a.instructions[i];
  a.instructions[i] = tmp;

  const ns = s.actions.map((ac) => (ac.id === a.id ? a : ac));

  return await set_storage({
    ...s,
    actions: ns,
  });
}

export async function delete_event(
  a_id: string,
  i: number,
): Promise<ExtesionStorageT> {
  const s = await get_storage();

  return await set_storage({
    ...s,
    actions: s.actions.map((ac) =>
      ac.id === a_id
        ? {
            ...ac,
            instructions: ac.instructions.filter((_, ins_i) => ins_i !== i),
          }
        : ac,
    ),
  });
}

export function validate_content(
  content: string,
  ignore_prefix: string,
  rem_dup: boolean,
): string {
  let content_arr = content.trim().split("\n");

  if (!!ignore_prefix)
    content_arr = content_arr.filter((l) => !l.startsWith(ignore_prefix));

  if (rem_dup)
    content_arr = content_arr.filter((v, i, s) => s.indexOf(v) === i);

  const result = content_arr.join("\n");

  // empty line is desired
  // if (!content) throw new ValidationError("content is null");

  return result;
}

export async function add_wordlist(
  _name: string,
  _content: string,
  ignore_prefix: string,
  rem_dup: boolean,
): Promise<ExtesionStorageT> {
  const name = _name.trim();
  if (!name) throw new ValidationError("name is null");

  const s = await get_storage();

  if (s.wordlists.find((w) => w.name === name) !== undefined)
    throw new ValidationError("wordlist with this name already exists");

  const content = validate_content(_content, ignore_prefix, rem_dup);

  s.wordlists.push({
    id: v4(),
    name,
    content,
  });

  return await set_storage(s);
}

export async function remove_wordlist(id: string): Promise<ExtesionStorageT> {
  const s = await get_storage();
  return await set_storage({
    ...s,
    wordlists: s.wordlists.filter((w) => w.id !== id),
  });
}

export async function update_wordlist(
  id: string,
  content: string,
): Promise<ExtesionStorageT> {
  const s = await get_storage();

  return await set_storage({
    ...s,
    wordlists: s.wordlists.map((w) => (w.id === id ? { ...w, content } : w)),
  });
}

export async function get_wordlist_by_id(
  id: string,
): Promise<WordlistT | null> {
  const w = (await get_storage()).wordlists;
  for (let i = 0; i < w.length; ++i) {
    if (w[i].id === id) return w[i];
  }

  return null;
}

export async function update_action(new_action: ActionT) {
  const s = await get_storage();

  return set_storage({
    ...s,
    actions: s.actions.map((a) => (a.id === new_action.id ? new_action : a)),
  });
}

export function elem_id_to_elem(
  s: ExtesionStorageT,
  id: string,
): ElementT | null {
  return s.elems.find((e) => e.id === id) ?? null;
}
