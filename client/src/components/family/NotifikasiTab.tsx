import React from 'react';
import { AlertTriangle, Phone } from 'lucide-react';

interface Notification {
  id: string;
  tipe: 'warning' | 'info';
  pesan: string;
}

interface NotifikasiTabProps {
  notifications?: Notification[];
}

const NotifikasiTab: React.FC<NotifikasiTabProps> = ({ notifications = [] }) => {
  // Fallback dummy data jika tidak ada data dari backend
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

  const displayData = notifications.length > 0 ? notifications : dummyNotifications;

  return (
    <div className="notifikasi-container bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-ink mb-4">Notifikasi</h2>
      
      {displayData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-black/60">Tidak ada notifikasi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayData.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item flex items-start gap-3 p-4 rounded-lg border-l-4 ${
                notification.tipe === 'warning'
                  ? 'bg-red-50 border-red-500'
                  : 'bg-blue-50 border-blue-500'
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {notification.tipe === 'warning' ? (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                ) : (
                  <Phone className="w-6 h-6 text-blue-600" />
                )}
              </div>

              {/* Message */}
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    notification.tipe === 'warning'
                      ? 'text-red-800'
                      : 'text-blue-800'
                  }`}
                >
                  {notification.pesan}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotifikasiTab;
