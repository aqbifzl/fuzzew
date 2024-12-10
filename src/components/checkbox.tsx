type Props = {
  name: string;
  checked: boolean;
  on_change: (v: boolean) => void;
};

export function Checkbox({ name, checked, on_change }: Props) {
  return (
    <div className="flex items-center mb-2">
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => on_change(e.target.checked)}
          className="sr-only peer"
        />
        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
        <span className="ml-3 text-sm font-medium text-pink-800">{name}</span>
      </label>
    </div>
  );
}
