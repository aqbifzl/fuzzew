import Label from "./label";

type SelectWithLabelProps<T> = {
  label: string;
  required?: boolean;
  options: T[];
  value: any;
  on_change: (value: string) => void;
  option_label: (option: T, i: number) => string;
  option_value: (
    option: T,
    i: number,
  ) => string | number | readonly string[] | undefined;
};

function SelectWithLabel<T>({
  label,
  required = true,
  options,
  value,
  on_change,
  option_label,
  option_value,
}: SelectWithLabelProps<T>) {
  return (
    <div className="select-container">
      <Label label={label} required={required} />
      <select
        value={value}
        onChange={(e) => {
          on_change(e.target.value);
        }}
        className="w-full p-2 rounded-md border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300 ease-in-out appearance-none bg-white custom-select"
      >
        <option value={-1}>Select {label.toLowerCase()}</option>
        {options.map((option, i) => (
          <option key={i} value={option_value(option, i)}>
            {option_label(option, i)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectWithLabel;
