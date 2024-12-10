import { AnimatePresence, motion } from "framer-motion";
import { FaExclamationCircle } from "react-icons/fa";
import { ValidationError } from "../lib/error";

type Props = {
  err: Error | null;
};

export default function ErrorBox({ err }: Props) {
  return (
    <AnimatePresence>
      {err !== null && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded"
          role="alert"
        >
          <div className="flex items-center">
            <FaExclamationCircle className="flex-shrink-0 mr-2" />
            <p>{(err as ValidationError).message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
