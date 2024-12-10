import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { ExtesionStorageT } from "../lib/types/fuzzer";
import { get_storage } from "../lib/storage_helper";
import browser from "webextension-polyfill";
import { BgFunc, ReqT, ReqTarget, ResT } from "../lib/types/msg";
import Loading from "../components/loading";
import ActionItem from "./actions/action_item";
import ActionForm from "./actions/action_form";
import { get_current_tab_id } from "../lib/dom";

export default function Actions() {
  const [state, set_state] = useState<ExtesionStorageT | null>(null);
  const [tab_id, set_tab_id] = useState<number | null>(null);
  const [running, set_running] = useState<boolean | null>(null);
  const [err, set_err] = useState<Error | null>(null);

  async function refresh_state() {
    try {
      const s = await get_storage();
      set_state(s);

      const curr_tab_id = await get_current_tab_id();
      set_tab_id(curr_tab_id);

      const res: ResT<boolean> = await browser.tabs.sendMessage(curr_tab_id, {
        func: BgFunc.IS_RUNNING,
        target: ReqTarget.CS,
      } as ReqT);

      if (!res.success || res.data === undefined)
        throw new Error("checking running state failed");

      set_running(res.data);
    } catch (e) {
      set_err(new Error(`error initializing state in actions: ${e}`));
    }
  }

  useEffect(() => {
    refresh_state();
  }, []);

  if (err !== null) {
    throw err;
  }

  if (!state || tab_id === null || running === null) {
    return <Loading />;
  }

  return (
    <div className="max-w-md mx-auto">
      <ActionForm set_state={set_state} />
      <AnimatePresence>
        {state.actions.map((a) => (
          <ActionItem
            running={running}
            tab_id={tab_id}
            key={a.id}
            action={a}
            storage={state}
            set_state={set_state}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
