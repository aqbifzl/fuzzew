import { motion } from "framer-motion";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Loading() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ ease: "easeIn", duration: 0.6, repeat: Infinity }}
      className="text-3xl flex w-full h-full justify-center items-center"
    >
      <AiOutlineLoading3Quarters />
    </motion.div>
  );
}
