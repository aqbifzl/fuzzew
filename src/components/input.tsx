import { HTMLInputTypeAttribute } from "react";
import Label from "./label";

type Props<T extends number | string> = {
  value?: T;
  default_value?: T;
  placeholder?: string;
  type: HTMLInputTypeAttribute;
  on_change?: (v: string) => void;
  on_blur?: (v: string) => void;
  label?: string;
  required?: boolean;
  min?: number;
  list?: string;
};

export default function Input<T extends number | string>({
  value,
  default_value,
  placeholder,
  type,
  on_change,
  on_blur,
  label,
  required = false,
  min,
  list,
}: Props<T>) {
  return (
    <div>
      {label !== undefined && <Label label={label} required={required} />}
      <input
        list={list}
        min={min}
        type={type}
        defaultValue={default_value}
        value={value}
        onChange={(e) => {
          if (on_change) on_change(e.target.value);
        }}
        onBlur={(e) => {
          if (on_blur) on_blur(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full mb-2 p-2 rounded-md border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300 ease-in-out"
      />
    </div>
  );
}
