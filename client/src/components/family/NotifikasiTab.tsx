import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Clock, AlertCircle, Filter } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

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

const NotifikasiTab: React.FC = () => {
  const { notifications, loading } = useNotifications();
  const [filterType, setFilterType] = React.useState<'all' | 'critical' | 'high' | 'warning' | 'info'>('all');

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (filterType === 'all') return notifications;
    
    if (filterType === 'critical') {
      return notifications.filter(n => n.priority === 'critical');
    }
    if (filterType === 'high') {
      return notifications.filter(n => n.priority === 'high');
    }
    if (filterType === 'warning') {
      return notifications.filter(n => n.type === 'warning');
    }
    if (filterType === 'info') {
      return notifications.filter(n => n.type === 'info');
    }
    
    return notifications;
  }, [notifications, filterType]);

  // Get icon berdasarkan type
  const getIcon = (type: string, priority: string) => {
    if (priority === 'critical' || type === 'danger') {
      return <AlertCircle className="w-6 h-6 text-red-600" />;
    }
    if (type === 'warning') {
      return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    }
    if (type === 'success') {
      return <CheckCircle2 className="w-6 h-6 text-green-600" />;
    }
    return <Clock className="w-6 h-6 text-blue-600" />;
  };

  // Get background color berdasarkan type
  const getBgColor = (type: string, priority: string) => {
    if (priority === 'critical' || type === 'danger') {
      return 'bg-red-50 border-red-500';
    }
    if (type === 'warning') {
      return 'bg-yellow-50 border-yellow-500';
    }
    if (type === 'success') {
      return 'bg-green-50 border-green-500';
    }
    return 'bg-blue-50 border-blue-500';
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
      month: 'long',
      year: 'numeric'
    });
  };

  // Format full date time
  const getFullDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="notifikasi-container bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-4">Memuat notifikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifikasi-container bg-white rounded-lg shadow-sm">
      {/* Header dengan Filter */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-ink">📬 Riwayat Notifikasi</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filter:</span>
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType('critical')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'critical'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🚨 Kritis ({notifications.filter(n => n.priority === 'critical').length})
          </button>
          <button
            onClick={() => setFilterType('high')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'high'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⚠️ Penting ({notifications.filter(n => n.priority === 'high').length})
          </button>
          <button
            onClick={() => setFilterType('warning')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'warning'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⏰ Peringatan ({notifications.filter(n => n.type === 'warning').length})
          </button>
          <button
            onClick={() => setFilterType('info')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'info'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ℹ️ Info ({notifications.filter(n => n.type === 'info').length})
          </button>
        </div>
      </div>
      
      {/* Notifications List */}
      <div className="p-6">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-1">Tidak ada notifikasi</p>
            <p className="text-sm text-gray-500">
              {filterType === 'all' 
                ? 'Semua notifikasi akan muncul di sini' 
                : 'Tidak ada notifikasi dengan filter ini'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item flex items-start gap-4 p-5 rounded-xl border-l-4 transition-all hover:shadow-md ${getBgColor(
                  notification.type,
                  notification.priority
                )}`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  <div className={`p-2.5 rounded-full ${
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

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title with Priority Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className={`text-lg font-bold ${
                      notification.priority === 'critical' || notification.type === 'danger'
                        ? 'text-red-900'
                        : notification.type === 'warning'
                        ? 'text-yellow-900'
                        : notification.type === 'success'
                        ? 'text-green-900'
                        : 'text-blue-900'
                    }`}>
                      {notification.title}
                    </h3>
                    <div className="flex-shrink-0 flex gap-2">
                      {notification.priority === 'critical' && (
                        <span className="text-xs bg-red-200 text-red-800 px-2.5 py-1 rounded-full font-bold">
                          KRITIS
                        </span>
                      )}
                      {notification.priority === 'high' && (
                        <span className="text-xs bg-orange-200 text-orange-800 px-2.5 py-1 rounded-full font-bold">
                          PENTING
                        </span>
                      )}
                      {!notification.isRead && (
                        <span className="flex items-center justify-center h-2 w-2 bg-brand-500 rounded-full"></span>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <p className={`text-sm leading-relaxed mb-3 ${
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

                  {/* Details */}
                  {notification.details && (
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      {notification.details.servo_active && notification.details.servo_active.length > 0 && (
                        <div className="bg-white/60 px-3 py-1.5 rounded">
                          <span className="font-medium">Obat:</span> {notification.details.servo_active.length} kotak
                        </div>
                      )}
                      {notification.details.temperature && (
                        <div className="bg-white/60 px-3 py-1.5 rounded">
                          <span className="font-medium">Suhu:</span> {notification.details.temperature}°C
                        </div>
                      )}
                      {notification.details.humidity && (
                        <div className="bg-white/60 px-3 py-1.5 rounded">
                          <span className="font-medium">Kelembaban:</span> {notification.details.humidity}%
                        </div>
                      )}
                      {notification.details.delay_seconds && notification.details.delay_seconds > 0 && (
                        <div className="bg-white/60 px-3 py-1.5 rounded">
                          <span className="font-medium">Keterlambatan:</span>{' '}
                          {Math.floor(notification.details.delay_seconds / 60)} menit
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="font-medium">{getRelativeTime(notification.timestamp)}</span>
                    <span className="text-gray-400">•</span>
                    <span title={getFullDateTime(notification.timestamp)}>
                      {new Date(notification.timestamp).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotifikasiTab;
