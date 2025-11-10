import { ReactNode } from "react";

type StepCardProps = {
  index: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function StepCard({ index, title, subtitle, children }: StepCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-soft p-5 border border-black/5">
      <div className="flex items-baseline gap-3 mb-3">
        <div className="h-8 w-8 rounded-lg bg-brand-500 text-white grid place-items-center text-sm font-semibold">
          {index}
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          {subtitle && <div className="text-sm text-black/60">{subtitle}</div>}
        </div>
      </div>
      <div className="text-sm leading-6 text-black/80">{children}</div>
    </div>
  );
}
