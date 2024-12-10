export enum BgFunc {
  UPDATE_LAST_CONTEXT_MENU_TARGET,
  RUN_ACTION,
  CANCEL_ACTION,
  IS_RUNNING,
  STOPPED,
  GET_PROPS_BY_XPATH,
  GET_LAST_COMB,
  ALERT_NOTIFY,
}

export enum ReqTarget {
  BG,
  CS,
  REACT,
}

export type ReqT = {
  func: BgFunc;
  data?: unknown;
  target: ReqTarget;
};

export type ResT<T> = {
  success: boolean;
  data?: T;
};
