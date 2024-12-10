import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function Base({ children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {children}
      </div>
    </div>
  );
}
