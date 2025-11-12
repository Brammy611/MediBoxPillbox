import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, Phone, X } from 'lucide-react';
import axios from 'axios';

interface Notification {
  id: string;
  tipe: 'warning' | 'info';
  pesan: string;
  timestamp?: string;
}

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dummy notifications - nanti akan diganti dengan data dari API
  const dummyNotifications: Notification[] = [
    {
      id: 'n1',
      tipe: 'warning',
      pesan: 'Terdeteksi Guncangan keras pada MediBox pukul 02:15. Segera hubungi Kakek!'
    },
    {
      id: 'n2',
      tipe: 'info',
      pesan: 'Obat sudah diminum pada pukul 07:02, status telat'
    }
  ];

  // Fetch notifications dari API
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

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

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Ambil patientId dari user yang login
      // Untuk sementara gunakan dummy data
      // Nanti akan diganti dengan:
      // const response = await axios.get(`http://localhost:5000/api/family-dashboard/${patientId}`);
      // setNotifications(response.data.data.notifikasi || []);
      
      // Simulasi delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setNotifications(dummyNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications(dummyNotifications);
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk membuka dropdown dan menandai notifikasi sebagai sudah dibaca
  const handleToggleDropdown = () => {
    if (!isOpen) {
      // Saat dropdown dibuka, set unread count ke 0 dan simpan ke localStorage
      setUnreadCount(0);
      localStorage.setItem('notificationsRead', 'true');
    }
    setIsOpen(!isOpen);
  };

  // Set initial unread count saat pertama kali load
  useEffect(() => {
    // Cek apakah notifikasi sudah pernah dibaca dari localStorage
    const hasRead = localStorage.getItem('notificationsRead');
    
    if (hasRead === 'true') {
      // Jika sudah pernah dibaca, set count ke 0
      setUnreadCount(0);
    } else {
      // Jika belum pernah dibaca, tampilkan jumlah notifikasi
      setUnreadCount(dummyNotifications.length);
    }
  }, []);

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
          <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white font-semibold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-ink">Notifikasi</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Memuat notifikasi...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      notification.tipe === 'warning' ? 'bg-red-50/50' : 'bg-blue-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {notification.tipe === 'warning' ? (
                          <div className="p-2 bg-red-100 rounded-full">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          </div>
                        ) : (
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Phone className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                      </div>

                      {/* Message */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            notification.tipe === 'warning'
                              ? 'text-red-800'
                              : 'text-blue-800'
                          }`}
                        >
                          {notification.pesan}
                        </p>
                        {notification.timestamp && (
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.timestamp}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Optional */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">
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
