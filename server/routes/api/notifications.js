const express = require('express');
const router = express.Router();
const Log = require('../../models/log');
const Patient = require('../../models/patient');
const Medicine = require('../../models/medicine');
const auth = require('../../middleware/auth');

// Get notifications untuk user yang login
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Cari patient berdasarkan user
    const patient = await Patient.findOne({ user: userId });
    
    if (!patient) {
      return res.json({
        success: true,
        data: {
          notifications: [],
          unreadCount: 0
        }
      });
    }

    // Ambil logs terbaru (30 hari terakhir)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await Log.find({
      patient_id: patient._id,
      createdAt: { $gte: thirtyDaysAgo }
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('medicine_id', 'name')
    .lean();

    // Transform logs menjadi notifikasi
    const notifications = logs.map(log => {
      const notification = {
        id: log._id.toString(),
        logId: log._id,
        patientId: log.patient_id,
        type: getNotificationType(log),
        title: getNotificationTitle(log),
        message: getNotificationMessage(log),
        timestamp: log.createdAt,
        isRead: log.isRead || false,
        priority: getNotificationPriority(log),
        details: {
          compliance_status: log.compliance_status,
          delay_seconds: log.delay_seconds,
          servo_active: log.servo_active,
          temperature: log.temperature,
          humidity: log.humidity,
          notes: log.notes,
          aksi: log.aksi
        }
      };
      return notification;
    });

    // Hitung unread count
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil notifikasi',
      error: error.message
    });
  }
});

// Mark notifications as read
router.post('/mark-read', auth, async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: 'notificationIds harus berupa array'
      });
    }

    // Update isRead flag di logs
    await Log.updateMany(
      { _id: { $in: notificationIds } },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      message: 'Notifikasi ditandai sudah dibaca'
    });

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menandai notifikasi',
      error: error.message
    });
  }
});

// Mark all notifications as read
router.post('/mark-all-read', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.json({
        success: true,
        message: 'Tidak ada notifikasi'
      });
    }

    await Log.updateMany(
      { patient_id: patient._id, isRead: { $ne: true } },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      message: 'Semua notifikasi ditandai sudah dibaca'
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menandai semua notifikasi',
      error: error.message
    });
  }
});

// Helper functions
function getNotificationType(log) {
  if (log.compliance_status === 'missed') return 'danger';
  if (log.compliance_status === 'late') return 'warning';
  if (log.compliance_status === 'overdose') return 'danger';
  if (log.temperature && log.temperature > 30) return 'warning';
  if (log.humidity && log.humidity > 70) return 'warning';
  return 'info';
}

function getNotificationTitle(log) {
  switch (log.compliance_status) {
    case 'missed':
      return '⚠️ Obat Terlewat';
    case 'late':
      return '⏰ Terlambat Minum Obat';
    case 'on-time':
      return '✅ Obat Diminum Tepat Waktu';
    case 'overdose':
      return '🚨 Peringatan Overdosis';
    default:
      return '📋 Aktivitas Obat';
  }
}

function getNotificationMessage(log) {
  let message = '';
  
  // Format waktu
  const actualTime = new Date(log.timestamp_konsumsi_aktual || log.createdAt);
  const timeStr = actualTime.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const dateStr = actualTime.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Informasi obat
  const medicineInfo = log.servo_active && log.servo_active.length > 0 
    ? `${log.servo_active.length} obat` 
    : 'Obat';

  switch (log.compliance_status) {
    case 'missed':
      message = `${medicineInfo} tidak diminum pada ${timeStr}, ${dateStr}. ${log.notes || ''}`;
      break;
    
    case 'late':
      const delayMinutes = Math.floor((log.delay_seconds || 0) / 60);
      const delayHours = Math.floor(delayMinutes / 60);
      const remainingMinutes = delayMinutes % 60;
      
      let delayStr = '';
      if (delayHours > 0) {
        delayStr = `${delayHours} jam ${remainingMinutes} menit`;
      } else {
        delayStr = `${delayMinutes} menit`;
      }
      
      message = `${medicineInfo} diminum terlambat ${delayStr} pada ${timeStr}, ${dateStr}. ${log.notes || ''}`;
      break;
    
    case 'on-time':
      message = `${medicineInfo} berhasil diminum tepat waktu pada ${timeStr}, ${dateStr}.`;
      break;
    
    case 'overdose':
      message = `⚠️ PERINGATAN: Terdeteksi potensi overdosis! ${medicineInfo} diambil pada ${timeStr}, ${dateStr}. Segera konsultasi dengan dokter!`;
      break;
    
    default:
      message = `Aktivitas obat tercatat pada ${timeStr}, ${dateStr}. ${log.notes || ''}`;
  }

  // Tambahkan info suhu dan kelembaban jika abnormal
  if (log.temperature && log.temperature > 30) {
    message += ` 🌡️ Suhu tinggi: ${log.temperature}°C`;
  }
  if (log.humidity && (log.humidity > 70 || log.humidity < 30)) {
    message += ` 💧 Kelembaban: ${log.humidity}%`;
  }

  // Tambahkan info aksi
  if (log.aksi) {
    message += ` (${log.aksi})`;
  }

  return message.trim();
}

function getNotificationPriority(log) {
  if (log.compliance_status === 'overdose') return 'critical';
  if (log.compliance_status === 'missed') return 'high';
  if (log.compliance_status === 'late') return 'medium';
  return 'low';
}

module.exports = router;
