import {
  HelpCircle,
  Home,
  LayoutDashboard,
  LogOut,
  Pill,
  Users
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoMedibox from "../assets/logo-medibox.png";

const primaryLinks = [
  { label: "Tentang MediBox", icon: Home, href: "/" },
  { label: "Dashboard Utama", icon: LayoutDashboard, href: "/dashboard-utama", protected: true },
  { label: "Family Dashboard", icon: Users, href: "/family", protected: true },
  { label: "Pharmacy Dashboard", icon: Pill, href: "/pharmacy", protected: true }
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Function to check if current path matches the link
  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Jangan tampilkan sidebar di halaman login/register
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <div className="h-screen sticky top-0 flex flex-col bg-[#FFF8F0]">
      {/* Logo/Header - Lebih besar */}
      <div className="p-6 border-b border-black/10">
        <div className="flex items-center gap-3">
          <img 
            src={logoMedibox} 
            alt="MediBox Logo" 
            className="h-12 w-12 object-contain"
          />
          <div className="leading-tight">
            <div className="text-lg font-bold text-ink">MEDIBOX</div>
            <div className="text-sm text-brand-600 font-medium">CONTROL CENTER</div>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="text-xs uppercase tracking-wider text-black/50 font-semibold mb-3 px-1">
          Navigation
        </div>
        <nav className="space-y-2">
          {primaryLinks.map((item) => {
            const active = isActive(item.href);
            const isProtected = item.protected;
            const canAccess = !isProtected || user;
            
            return (
              <a
                key={item.label}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? "bg-brand-500 text-white shadow-md"
                    : canAccess 
                      ? "text-black/70 hover:bg-white hover:shadow-sm"
                      : "text-black/30 cursor-not-allowed"
                }`}
                onClick={(e) => {
                  if (!canAccess) {
                    e.preventDefault();
                    navigate('/login');
                  }
                }}
              >
                <item.icon 
                  className={`h-5 w-5 ${
                    active ? "text-white" : canAccess ? "text-brand-600" : "text-black/30"
                  }`}
                />
                <span className={`text-sm font-medium ${
                  active ? "text-white" : canAccess ? "text-ink" : "text-black/30"
                }`}>
                  {item.label}
                </span>
                {active && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-white"></div>
                )}
              </a>
            );
          })}
        </nav>

        {/* Snapshot Section */}
        <div className="mt-8 text-xs uppercase tracking-wider text-black/50 font-semibold mb-3 px-1">
          Snapshot
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-black/5">
          <div className="text-sm font-medium text-ink mb-3">Customer Service</div>
          <div className="space-y-2">
            <a 
              href="/syarat-perbaikan" 
              className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Syarat dan Perbaikan</span>
            </a>
            <a 
              href="/media-sosial" 
              className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Media Sosial MediBox</span>
            </a>
          </div>
        </div>
      </div>

      {/* Logout Section - Sticky at bottom */}
      {user && (
        <div className="p-5 border-t border-black/10 bg-white/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
