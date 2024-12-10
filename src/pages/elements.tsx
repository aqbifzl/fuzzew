import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { ElementT, ExtesionStorageT } from "../lib/types/fuzzer";
import {
  get_storage,
  remove_element,
  update_element_name,
} from "../lib/storage_helper";
import Button from "../components/button";
import Loading from "../components/loading";
import ManualAdd from "./elements/manual_add";

type ElemProps = {
  elem: ElementT;
  on_remove: () => void;
  on_blur: (v: string) => void;
};

const Element = ({ on_remove, on_blur, elem }: ElemProps) => {
  return (
    <motion.div
      className="bg-pink-100 rounded-lg p-4 mb-4 shadow-md hover:shadow-lg transition-shadow"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex justify-between items-center w-full">
        <input
          type="text"
          defaultValue={elem.name}
          onBlur={(v) => on_blur(v.target.value)}
          className="text-lg font-semibold text-pink-800 bg-transparent border-b border-pink-300 focus:outline-none focus:border-pink-500 transition-colors max-w-[calc(100%-2rem)] mr-2"
        />
        <Button on_click={() => on_remove()} style="light">
          <FaTrash />
        </Button>
      </div>
      <div className="mt-2 text-sm text-pink-700 break-words">{elem.xpath}</div>
    </motion.div>
  );
};

export default function Elements() {
  const [state, set_state] = useState<ExtesionStorageT | null>(null);

  useEffect(() => {
    async function init_state() {
      const s = await get_storage();
      set_state(s);
    }

    init_state();
  }, []);

  if (!state) return <Loading />;

  return (
    <div>
      {state.elems.map((e) => (
        <Element
          key={e.id}
          elem={e}
          on_remove={async () => {
            set_state(await remove_element(e.id));
          }}
          on_blur={async (v) => {
            set_state(await update_element_name(e.id, v));
          }}
        />
      ))}

      <ManualAdd set_state={set_state} />
    </div>
  );
}
