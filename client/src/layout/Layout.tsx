import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full grid" style={{ gridTemplateColumns: "280px 1fr" }}>
      <aside className="bg-brand-100 border-r border-black/5">
        <Sidebar />
      </aside>
      <main className="min-h-full flex flex-col">
        <Topbar />
        <div className="px-8 pb-16">{children}</div>
      </main>
    </div>
  );
}
