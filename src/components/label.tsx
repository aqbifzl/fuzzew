type Props = {
  label: string;
  required: boolean;
};

export default function Label({ label, required }: Props) {
  return (
    <label className="block text-sm font-medium text-pink-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
