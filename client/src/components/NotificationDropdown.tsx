import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, CheckCircle2, Clock, AlertCircle, X, XCircle } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

interface NotificationDetails {
  compliance_status?: string;
  delay_seconds?: number;
  servo_active?: number[];
  temperature?: number;
  humidity?: number;
  notes?: string;
  aksi?: string;
}

interface Notification {
  id: string;
  logId: string;
  patientId: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  details: NotificationDetails;
}

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, loading, markAllAsRead, refreshNotifications } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Refresh notifications saat dropdown dibuka
  useEffect(() => {
    if (isOpen) {
      refreshNotifications();
    }
  }, [isOpen, refreshNotifications]);

  // Handler untuk membuka dropdown dan menandai notifikasi sebagai sudah dibaca
  const handleToggleDropdown = async () => {
    setIsOpen(!isOpen);
    
    // Jika ada unread notifications dan dropdown dibuka, tandai semua sebagai sudah dibaca
    if (!isOpen && unreadCount > 0) {
      await markAllAsRead();
    }
  };

  // Get icon berdasarkan type
  const getIcon = (type: string, priority: string) => {
    if (priority === 'critical' || type === 'danger') {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
    if (type === 'warning') {
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
    if (type === 'success') {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }
    return <Clock className="w-5 h-5 text-blue-600" />;
  };

  // Get background color berdasarkan type
  const getBgColor = (type: string, priority: string) => {
    if (priority === 'critical' || type === 'danger') {
      return 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500';
    }
    if (type === 'warning') {
      return 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-500';
    }
    if (type === 'success') {
      return 'bg-green-50 hover:bg-green-100 border-l-4 border-green-500';
    }
    return 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500';
  };

  // Format relative time
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now.getTime() - notifTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return notifTime.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggleDropdown}
        className="relative p-2.5 rounded-lg hover:bg-brand-50 transition-colors"
      >
        <Bell className="h-5 w-5 text-black/70" />
        {/* Badge with unread count */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[420px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-brand-50 to-brand-100">
            <div>
              <h3 className="font-semibold text-ink text-lg">Notifikasi</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-600">{unreadCount} notifikasi belum dibaca</p>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-3">Memuat notifikasi...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">Tidak ada notifikasi</p>
                <p className="text-xs text-gray-500 mt-1">Notifikasi akan muncul di sini</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors cursor-pointer ${getBgColor(notification.type, notification.priority)} ${
                      !notification.isRead ? 'font-medium' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        <div className={`p-2 rounded-full ${
                          notification.priority === 'critical' || notification.type === 'danger'
                            ? 'bg-red-100'
                            : notification.type === 'warning'
                            ? 'bg-yellow-100'
                            : notification.type === 'success'
                            ? 'bg-green-100'
                            : 'bg-blue-100'
                        }`}>
                          {getIcon(notification.type, notification.priority)}
                        </div>
                      </div>

                      {/* Message */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`text-sm font-semibold ${
                            notification.priority === 'critical' || notification.type === 'danger'
                              ? 'text-red-900'
                              : notification.type === 'warning'
                              ? 'text-yellow-900'
                              : notification.type === 'success'
                              ? 'text-green-900'
                              : 'text-blue-900'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="flex-shrink-0 h-2 w-2 bg-brand-500 rounded-full"></span>
                          )}
                        </div>
                        
                        <p className={`text-sm leading-relaxed ${
                          notification.priority === 'critical' || notification.type === 'danger'
                            ? 'text-red-800'
                            : notification.type === 'warning'
                            ? 'text-yellow-800'
                            : notification.type === 'success'
                            ? 'text-green-800'
                            : 'text-blue-800'
                        }`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-xs text-gray-500">
                            {getRelativeTime(notification.timestamp)}
                          </p>
                          {notification.priority === 'critical' && (
                            <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-semibold">
                              KRITIS
                            </span>
                          )}
                          {notification.priority === 'high' && (
                            <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-semibold">
                              PENTING
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-center">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  // Optional: Navigate to all notifications page
                }}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium hover:underline"
              >
                Lihat Semua Notifikasi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
