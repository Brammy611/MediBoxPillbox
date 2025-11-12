import { ReactNode } from "react";

type StepCardProps = {
  index: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function StepCard({ index, title, subtitle, children }: StepCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-soft p-6 md:p-7 border border-black/5 hover:shadow-md transition-shadow">
      <div className="flex items-baseline gap-4 mb-4">
        <div className="h-10 w-10 rounded-lg bg-brand-500 text-white grid place-items-center text-lg font-semibold flex-shrink-0">
          {index}
        </div>
        <div>
          <div className="text-lg font-semibold text-ink">{title}</div>
          {subtitle && <div className="text-sm text-black/60 mt-1">{subtitle}</div>}
        </div>
      </div>
      <div className="text-base leading-7 text-black/80 ms-14">{children}</div>
    </div>
  );
}
