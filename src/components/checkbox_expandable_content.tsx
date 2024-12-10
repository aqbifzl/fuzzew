import { ReactNode } from "react";
import { Checkbox } from "./checkbox";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  opened: boolean;
  open: () => void;
  close: () => void;
  children: ReactNode;
  name: string;
};

export default function CheckboxExpandableContent({
  opened,
  open,
  close,
  children,
  name,
}: Props) {
  return (
    <div>
      <Checkbox
        name={name}
        checked={opened}
        on_change={(c) => (c ? open() : close())}
      />
      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
