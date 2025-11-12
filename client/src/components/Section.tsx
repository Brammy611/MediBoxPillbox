import { ReactNode } from "react";

type SectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

export default function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="mt-16 mb-12">
      <h2 className="text-3xl font-bold mb-6">
        <span className="border-b-4 border-brand-500/40 pb-2">{title}</span>
      </h2>
      <div className="space-y-5 text-base leading-relaxed text-black/75">
        {children}
      </div>
    </section>
  );
}
