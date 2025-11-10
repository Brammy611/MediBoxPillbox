import {
  HelpCircle,
  Home,
  LayoutDashboard,
  LogOut,
  Pill,
  Users
} from "lucide-react";

const primaryLinks = [
  { label: "Tentang MediBox", icon: Home, href: "/" },
  { label: "Dashboard Utama", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Family Dashboard", icon: Users, href: "/family" },
  { label: "Apotheker Dashboard", icon: Pill, href: "/apotheker" }
];

export default function Sidebar() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-brand-500" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">MEDIBOX</div>
            <div className="text-xs text-black/60">CONTROL CENTER</div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="text-xs uppercase tracking-wide text-black/50 mb-2">
          Navigation
        </div>
        <nav className="space-y-1">
          {primaryLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="group flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white hover:shadow-soft transition"
            >
              <item.icon className="h-4 w-4 text-brand-600" />
              <span className="text-sm">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="mt-6 text-xs uppercase tracking-wide text-black/50 mb-2">
          Snapshot
        </div>
        <div className="rounded-md bg-white p-3 shadow-soft text-sm text-black/70">
          <div>Customer Service</div>
          <div className="mt-2 flex items-center gap-2 text-brand-600">
            <HelpCircle className="h-4 w-4" /> Syarat dan Perbaikan
          </div>
          <div className="mt-1 text-brand-600">Media Sosial MediBox</div>
        </div>
      </div>

      <div className="mt-auto p-4">
        <a className="flex items-center gap-2 text-sm text-black/70" href="/logout">
          <LogOut className="h-4 w-4" /> Logout
        </a>
      </div>
    </div>
  );
}
