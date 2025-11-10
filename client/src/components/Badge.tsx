import { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
};

export default function Badge({ children }: BadgeProps) {
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-200 text-brand-700">
      {children}
    </span>
  );
}
