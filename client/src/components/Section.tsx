import { ReactNode } from "react";

type SectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

export default function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="mt-10">
      <h2 className="text-xl font-semibold mb-3">
        <span className="border-b-4 border-brand-500/40 pb-1">{title}</span>
      </h2>
      <div className="space-y-4 text-sm leading-relaxed text-black/75">
        {children}
      </div>
    </section>
  );
}
