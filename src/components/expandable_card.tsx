import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { FaCog, FaTrash } from "react-icons/fa";
import Button from "./button";

type Props = {
  title: string;
  on_delete?: () => void;
  children: ReactNode;
  header?: ReactNode;
};

export default function ExpandableCard({
  title,
  on_delete,
  children,
  header,
}: Props) {
  const [expanded, set_expanded] = useState(false);

  return (
    <motion.div
      className="bg-pink-50 rounded-lg p-4 mb-4 shadow-md"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-pink-800">{title}</h3>
        <div>
          <Button
            className="mr-2"
            on_click={() => set_expanded(!expanded)}
            style="light"
          >
            <FaCog />
          </Button>
          {on_delete !== undefined && (
            <Button on_click={() => on_delete()} style="light">
              <FaTrash />
            </Button>
          )}
        </div>
      </div>
      {header}
      <AnimatePresence>{expanded && children}</AnimatePresence>
    </motion.div>
  );
}
