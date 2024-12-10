import { AcceptedType } from "./general";

// element

export type DomProperty = {
  name: string;
  type: AcceptedType;
};

export type ElementT = {
  id: string;
  name: string;
  xpath: string;
  properties: DomProperty[];
};

export type LastElementT = Omit<ElementT, "id"> | null;

export interface ModifiedProperty extends DomProperty {
  value: string;
}

export type ModifyDomDispatchEventCommonT = {
  elem_id: string;
};

// event

export type NewEventTypeT =
  | "delay"
  | "event_dispatch"
  | "change_property"
  | "none";

export type DelayEventEvT = {
  type: "delay";
  amount: number;
};

export type DispatchEventEvT = {
  type: "event_dispatch";
  event_name: string;
  modified_event_properties: ModifiedProperty[];
} & ModifyDomDispatchEventCommonT;

export type ModifyDomEvT = {
  type: "change_property";
  selected_prop: DomProperty | null;
  input_val: string;
} & ModifyDomDispatchEventCommonT;

export type NoneEvT = {
  type: "none";
};

export type NewEventT =
  | ModifyDomEvT
  | DispatchEventEvT
  | DelayEventEvT
  | NoneEvT;

export type ParsedDispatchEventEvT = {
  type: "event_dispatch";
  node: Node;
  ev: Event;
};

export type ParsedModifyEvT = {
  type: "change_property";
  node: Node;
  prop_name: string;
  parsed_val: AcceptedType;
};

export type ParsedMetadataT = {
  comb: string[];
};

export type ParsedEventT =
  | (DelayEventEvT & ParsedMetadataT)
  | (ParsedDispatchEventEvT & ParsedMetadataT)
  | (ParsedModifyEvT & ParsedMetadataT);

export type ActionT = {
  id: string;
  name: string;
  instructions: NewEventT[];
  rep: number; // 0 means once
  rep_interval: number;
  rep_conc: number;
};

// wordlist

export type WordlistT = {
  id: string;
  name: string;
  content: string;
};

// storage

export type ExtesionStorageT = {
  actions: ActionT[];
  elems: ElementT[];
  wordlists: WordlistT[];
};

export enum Direc {
  UP,
  DOWN,
}

export type RunActionDataT = {
  tab_id: number;
  action_id: string;
  log_alerts: boolean;
};
