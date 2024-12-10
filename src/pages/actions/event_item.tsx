import { motion } from "framer-motion";
import { Direc, NewEventT } from "../../lib/types/fuzzer";
import Button from "../../components/button";
import { FaArrowDown, FaArrowUp, FaTrash } from "react-icons/fa";

type EventItemT = {
  ins: NewEventT;
  on_move: (d: Direc) => void;
  on_delete: () => void;
  index: number;
  ev_count: number;
};

export default function EventItem({
  ins,
  on_move,
  on_delete,
  index,
  ev_count,
}: EventItemT) {
  if (ins.type === "none")
    throw new Error("none event in listing method, it's a bug in a code");

  let name;

  switch (ins.type) {
    case "change_property":
      name = (
        <>
          {`[CHANGE_DOM][${ins.selected_prop!.name}:${ins.selected_prop!.type}]`}
          <textarea
            disabled={true}
            value={ins.input_val}
            className="w-full mt-2 p-2 rounded-md border border-pink-300 bg-pink-50 resize-none custom-scrollbar"
            rows={3}
          />
        </>
      );
      break;
    case "event_dispatch":
      name = (
        <>
          {`[EVENT_DISPATCH][${ins.event_name}]`}
          <textarea
            disabled={true}
            value={ins.modified_event_properties
              .map((p) => `${p.name}->${p.value}:${p.type}`)
              .join(" ")}
            className="w-full mt-2 p-2 rounded-md border border-pink-300 bg-pink-50 resize-none custom-scrollbar"
            rows={3}
          />
        </>
      );
      break;
    case "delay":
      name = <>{`[DELAY][${ins.amount}ms]`}</>;
      break;
  }

  return (
    <motion.div
      className="bg-pink-100 rounded-lg p-2 mb-2 shadow-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-start">
        <span className="text-pink-800 flex-grow">{name}</span>

        <div className="flex flex-col ml-2">
          {index > 0 && (
            <Button style="light" on_click={() => on_move(Direc.UP)}>
              <FaArrowUp />
            </Button>
          )}
          {index < ev_count - 1 && (
            <Button style="light" on_click={() => on_move(Direc.DOWN)}>
              <FaArrowDown />
            </Button>
          )}
          <Button style="light" on_click={() => on_delete()}>
            <FaTrash />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
