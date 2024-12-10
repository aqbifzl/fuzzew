import { useState } from "react";
import Label from "./label";
import Input from "./input";

type Props<T> = {
  label: string;
  required?: boolean;
  options: T[];
  on_change: (value: string) => void;
  option_label: (option: T, i: number) => string;
  option_value: (
    option: T,
    i: number,
  ) => string | number | readonly string[] | undefined;
};

function Datalist<T>({
  label,
  required = true,
  options,
  on_change,
  option_label,
  option_value,
}: Props<T>) {
  const [inp, set_inp] = useState("");

  return (
    <div className="select-container">
      <Label label={label} required={required} />
      <Input
        value={inp}
        type="text"
        on_change={(v) => set_inp(v)}
        on_blur={(v) => {
          set_inp(v);
          on_change(v);
        }}
        list="datalist"
      />
      {options.length > 0 && (
        <datalist
          id="datalist"
          className="w-full p-2 rounded-md border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300 ease-in-out appearance-none bg-white custom-select"
        >
          <option value={-1}>Select {label.toLowerCase()}</option>
          {options.map((option, i) => (
            <option key={i} value={option_value(option, i)}>
              {option_label(option, i)}
            </option>
          ))}
        </datalist>
      )}
    </div>
  );
}

export default Datalist;
