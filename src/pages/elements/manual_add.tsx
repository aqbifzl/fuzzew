import { useState } from "react";
import Input from "../../components/input";
import Button from "../../components/button";
import { FaPlus } from "react-icons/fa";
import { add_element } from "../../lib/storage_helper";
import { ValidationError } from "../../lib/error";
import ErrorBox from "../../components/error_box";
import { AnimatePresence, motion } from "framer-motion";
import { MS } from "../../lib/types/general";
import { DomProperty, ExtesionStorageT } from "../../lib/types/fuzzer";
import { BgFunc, ReqT, ReqTarget, ResT } from "../../lib/types/msg";
import { get_current_tab_id } from "../../lib/dom";
import browser from "webextension-polyfill";

export default function ManualAdd({
  set_state,
}: {
  set_state: MS<ExtesionStorageT | null>;
}) {
  const [xpath, set_xpath] = useState("");
  const [name, set_name] = useState("");
  const [open, set_open] = useState(false);
  const [err, set_err] = useState<Error | ValidationError | null>(null);

  async function handle_add() {
    if (!name.length) {
      set_err(new ValidationError("name is null"));
      return;
    }
    if (!xpath.length) {
      set_err(new ValidationError("xpath is null"));
      return;
    }

    const curr_tab_id = await get_current_tab_id();

    const props_res: ResT<DomProperty[]> = await browser.tabs.sendMessage(
      curr_tab_id,
      {
        func: BgFunc.GET_PROPS_BY_XPATH,
        target: ReqTarget.CS,
        data: xpath,
      } as ReqT,
    );

    if (!props_res.success || !props_res.data) {
      set_err(new ValidationError("couldn't get element properties"));
      return;
    }

    set_state(await add_element(name, xpath, props_res.data));
    set_name("");
    set_xpath("");
    set_open(false);
    set_err(null);
  }

  return (
    <>
      <Button
        className="flex items-center justify-center mb-4"
        on_click={() => set_open((p) => !p)}
      >
        <FaPlus className="mr-2" />
        {open ? "Close" : "Add manually"}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ErrorBox err={err} />
            <Input
              value={name}
              type="text"
              on_change={(nv) => set_name(nv)}
              label={"Name"}
              required={true}
            />
            <Input
              value={xpath}
              type="text"
              on_change={(nv) => set_xpath(nv)}
              label={"Xpath"}
              required={true}
            />
            <Button
              className="flex items-center justify-center"
              on_click={() => handle_add()}
            >
              <FaPlus className="mr-2" />
              Add
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
