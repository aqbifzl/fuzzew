import { DomProperty, ExtesionStorageT } from "../lib/types/fuzzer";
import Label from "./label";
import Input from "./input";
import WordlistFuzzingSelect from "./wordlist_fuzzing_select";
import { motion } from "framer-motion";
import { PLACEHOLDER_BRACKET_C, PLACEHOLDER_BRACKET_O } from "../lib/constants";

type Props = {
  property: DomProperty;
  value: string;
  on_change: (v: string) => void;
  storage: ExtesionStorageT;
};

export default function ElementPropertyValue({
  property,
  on_change,
  value,
  storage,
}: Props) {
  const { name, type } = property;

  if (type === "string") {
    return (
      <>
        <WordlistFuzzingSelect
          on_select={(v) =>
            on_change(
              value + `${PLACEHOLDER_BRACKET_O}${v}${PLACEHOLDER_BRACKET_C}`,
            )
          }
          elem_id="text_to_type_textarea"
          storage={storage}
        />

        <motion.textarea
          id="text_to_type_textarea"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          value={value}
          onChange={(e) => on_change(e.target.value)}
          className="w-full mt-2 p-2 rounded-md border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none custom-scrollbar transition-all duration-300 ease-in-out"
          rows={3}
          placeholder="Enter text to type"
        ></motion.textarea>
      </>
    );
  } else if (type === "number") {
    return (
      <Input
        value={value}
        type="number"
        on_change={on_change}
        label={name}
        min={1}
        required={true}
      />
    );
  } else {
    return (
      <>
        <Label label={name} required={true} />
        <select
          value={value}
          onChange={(e) => on_change(e.target.value)}
          className="w-full p-2 rounded-md border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300 ease-in-out appearance-none bg-white custom-select"
        >
          <option value={""}>Select</option>
          <option value={"0"}>False</option>
          <option value={"1"}>True</option>
        </select>
      </>
    );
  }
}
