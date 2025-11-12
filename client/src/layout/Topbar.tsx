import { Bell, User2, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationDropdown from "../components/NotificationDropdown";

export default function Topbar() {
  const { user, logout, initialLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  // Jangan tampilkan topbar di halaman login/register
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <div className="h-16 flex items-center justify-between px-8 border-b border-black/10 bg-white shadow-sm sticky top-0 z-10">
      {/* Left side - User info or page title */}
      <div className="flex items-center gap-3"></div>

      {/* Right side - Notifications and Profile */}
      <div className="flex items-center gap-6 min-h-[48px]">
        {initialLoading ? (
          // Loading skeleton - hanya saat initial load
          <div className="flex items-center gap-3 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
              <div className="h-2 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : user ? (
          <>
            {/* Notification Bell with Dropdown */}
            <NotificationDropdown />

            {/* User Profile */}
            <div className="flex items-center gap-3 px-3 py-2 pointer-events-none">
              <div className="text-right">
                <div className="text-sm font-medium text-ink">{user.name}</div>
                <div className="text-xs text-black/60">{user.email}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-brand-400 grid place-items-center text-white font-medium">
                <User2 className="h-5 w-5" />
              </div>
            </div>
          </>
        ) : (
          <button 
            onClick={handleLogin}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
          >
            Masuk
          </button>
        )}
      </div>
    </div>
  );
}
