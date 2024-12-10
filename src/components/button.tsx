import { ReactNode } from "react";

type Props = {
  on_click?: () => void;
  children: ReactNode | string;
  className?: string;
  type?: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >["type"];
  style?: "light" | "full";
  disabled?: boolean;
};

export default function Button({
  on_click,
  children,
  className,
  type,
  style = "full",
  disabled = false,
}: Props) {
  return (
    <button
      disabled={disabled}
      type={type}
      onClick={on_click ? () => on_click() : undefined}
      className={`disabled:opacity-50 disabled:cursor-not-allowed ${style === "full" ? "w-full mt-2 bg-pink-500 text-white py-2 rounded-md hover:bg-pink-600 transition-all duration-300 ease-in-out transform hover:scale-105" : "text-pink-600 hover:text-pink-800 mb-1 transition-colors duration-200"}  ${className}`}
    >
      {children}
    </button>
  );
}
