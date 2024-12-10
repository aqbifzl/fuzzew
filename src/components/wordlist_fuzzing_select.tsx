import { useState } from "react";
import { Checkbox } from "./checkbox";
import { ExtesionStorageT } from "../lib/types/fuzzer";

type Props = {
  storage: ExtesionStorageT;
  elem_id: string;
  on_select: (v: string) => void;
};

export default function WordlistFuzzingSelect({
  storage,
  elem_id,
  on_select,
}: Props) {
  const [fuzzing, set_fuzzing] = useState(false);

  return (
    <div className="pt-4">
      <Checkbox
        name="Use fuzzing"
        checked={fuzzing}
        on_change={(c) => set_fuzzing(c)}
      />

      {fuzzing && (
        <select
          onChange={(e) => {
            if (!e) return;
            on_select(e.target.value);
            const el = document.querySelector(`#${elem_id}`);
            if (el) (el as HTMLElement).focus();
          }}
          className="w-full p-2 rounded-md border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300 ease-in-out appearance-none bg-white custom-select"
        >
          <option value={""}>Select</option>
          {storage.wordlists.map((e) => (
            <option value={`${e.name}`}>{e.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}
