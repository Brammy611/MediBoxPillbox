import { Bell, User2 } from "lucide-react";

export default function Topbar() {
  return (
    <div className="h-16 flex items-center justify-between px-8 border-b border-black/10 bg-white shadow-sm sticky top-0 z-10">
      {/* Left side - User info or page title */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-black/60">NoMEDI-01</span>
      </div>

      {/* Right side - Notifications and Profile */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button className="relative p-2.5 rounded-lg hover:bg-brand-50 transition-colors">
          <Bell className="h-5 w-5 text-black/70" />
          {/* Notification badge (opsional) */}
          {/* <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span> */}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-brand-50 px-3 py-2 rounded-lg transition-colors">
          <div className="h-10 w-10 rounded-full bg-brand-400 grid place-items-center text-white font-medium">
            <User2 className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-ink">Family User</div>
            <div className="text-xs text-black/60">family@medibox.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
