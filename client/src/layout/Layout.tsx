import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar - Fixed width, sticky */}
      <aside className="w-72 flex-shrink-0 border-r border-black/10 shadow-sm">
        <Sidebar />
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto bg-[#FFFBF5]">
          {children}
        </div>
      </main>
    </div>
  );
}
