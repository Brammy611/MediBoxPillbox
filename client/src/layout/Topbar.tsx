import { Bell, User2 } from "lucide-react";

export default function Topbar() {
  return (
    <div className="h-12 flex items-center justify-end gap-4 px-6 border-b border-black/5 bg-white/60 backdrop-blur sticky top-0 z-10">
      <button className="relative p-2 rounded-md hover:bg-brand-50">
        <Bell className="h-4 w-4" />
      </button>
      <div className="h-8 w-8 rounded-full bg-brand-300 grid place-items-center text-white">
        <User2 className="h-4 w-4" />
      </div>
    </div>
  );
}
