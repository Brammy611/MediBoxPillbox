import { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
};

export default function Badge({ children }: BadgeProps) {
  return (
    <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-brand-200 text-brand-700">
      {children}
    </span>
  );
}
