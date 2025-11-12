# 📬 Sistem Notifikasi MediBox

## Overview
Sistem notifikasi real-time yang terintegrasi dengan collection `logs` di MongoDB untuk menampilkan aktivitas obat dan peringatan kepada keluarga pasien.

## 🎯 Fitur Utama

### 1. Badge Notifikasi pada Icon Lonceng
- Badge merah dengan angka muncul di icon lonceng (Topbar)
- Badge menghitung jumlah notifikasi yang belum dibaca (`isRead: false`)
- Badge menghilang otomatis saat dropdown dibuka
- Animasi pulse untuk menarik perhatian

### 2. Dropdown Notifikasi
- Dropdown muncul saat icon lonceng diklik
- Menampilkan 50 notifikasi terbaru (30 hari terakhir)
- Auto-refresh setiap 30 detik
- Notifikasi ditandai otomatis sebagai sudah dibaca saat dropdown dibuka

### 3. Tab Notifikasi di Family Dashboard
- Menampilkan riwayat lengkap notifikasi
- Filter berdasarkan prioritas: Kritis, Penting, Peringatan, Info
- Tampilan detail untuk setiap notifikasi
- Update real-time setiap 30 detik

## 📊 Struktur Data Notifikasi

### Collection: `logs`
```javascript
{
  _id: ObjectId,
  patient_id: ObjectId,           // Referensi ke patient
  device_id: ObjectId,            // Referensi ke device
  servo_active: [1, 2],           // Nomor kotak obat yang aktif
  waktu_konsumsi_seharusnya: Date,
  timestamp_konsumsi_aktual: Date,
  aksi: "Terima" | "Tolak",
  delay_seconds: 525,             // Keterlambatan dalam detik
  compliance_status: "on-time" | "late" | "missed" | "overdose",
  temperature: 25.8,              // Suhu MediBox
  humidity: 62.6,                 // Kelembaban MediBox
  notes: "1 obat diambil terlambat.",
  isRead: false,                  // Status baca notifikasi
  createdAt: Date
}
```

## 🎨 Tipe Notifikasi

### 1. ✅ On-Time (Success)
**Prioritas:** Low  
**Warna:** Hijau  
**Contoh:**
```
✅ Obat Diminum Tepat Waktu
2 obat berhasil diminum tepat waktu pada 14:00, 7 November 2025.
```

### 2. ⏰ Late (Warning)
**Prioritas:** Medium  
**Warna:** Kuning  
**Contoh:**
```
⏰ Terlambat Minum Obat
1 obat diminum terlambat 8 menit pada 13:08, 7 November 2025. 1 obat diambil terlambat.
```

### 3. ⚠️ Missed (Danger)
**Prioritas:** High  
**Warna:** Merah  
**Contoh:**
```
⚠️ Obat Terlewat
2 obat tidak diminum pada 20:00, 7 November 2025. Pasien melewatkan jadwal minum obat.
```

### 4. 🚨 Overdose (Critical)
**Prioritas:** Critical  
**Warna:** Merah Gelap  
**Contoh:**
```
🚨 Peringatan Overdosis
⚠️ PERINGATAN: Terdeteksi potensi overdosis! 1 obat diambil pada 14:30, 7 November 2025. Segera konsultasi dengan dokter!
```

### 5. 🌡️ Peringatan Suhu/Kelembaban
**Prioritas:** Medium  
**Warna:** Kuning  
**Tambahan Info:**
- Suhu > 30°C: "🌡️ Suhu tinggi: 32°C"
- Kelembaban > 70% atau < 30%: "💧 Kelembaban: 75%"

## 🔧 API Endpoints

### GET `/api/notifications`
**Auth:** Required (Bearer Token)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "6914a79a95445bfda4412dfa",
        "logId": "6914a79a95445bfda4412dfa",
        "patientId": "674eaa222222222222222222",
        "type": "warning",
        "title": "⏰ Terlambat Minum Obat",
        "message": "1 obat diminum terlambat 8 menit...",
        "timestamp": "2025-11-07T13:08:55.000Z",
        "isRead": false,
        "priority": "medium",
        "details": {
          "compliance_status": "late",
          "delay_seconds": 525,
          "servo_active": [1],
          "temperature": 25.8,
          "humidity": 62.6,
          "notes": "1 obat diambil terlambat.",
          "aksi": "Terima"
        }
      }
    ],
    "unreadCount": 5
  }
}
```

### POST `/api/notifications/mark-read`
**Auth:** Required  
**Body:**
```json
{
  "notificationIds": ["id1", "id2", "id3"]
}
```

### POST `/api/notifications/mark-all-read`
**Auth:** Required  
**Body:** Empty

## 💻 Komponen Frontend

### 1. NotificationContext
**File:** `client/src/context/NotificationContext.tsx`

Provider global untuk state notifikasi:
- Fetch otomatis setiap 30 detik
- Sharing state ke seluruh aplikasi
- Methods: `fetchNotifications()`, `markAllAsRead()`, `refreshNotifications()`

### 2. NotificationDropdown
**File:** `client/src/components/NotificationDropdown.tsx`

Dropdown notifikasi di Topbar:
- Icon lonceng dengan badge
- Dropdown dengan max 50 notifikasi
- Auto-mark as read saat dibuka
- Relative time display

### 3. NotifikasiTab
**File:** `client/src/components/family/NotifikasiTab.tsx`

Tab notifikasi di Family Dashboard:
- Filter berdasarkan prioritas
- Tampilan detail lengkap
- Info tambahan (suhu, kelembaban, keterlambatan)
- Timestamps lengkap

## 🎯 Logic Prioritas

```javascript
function getNotificationPriority(log) {
  if (log.compliance_status === 'overdose') return 'critical';
  if (log.compliance_status === 'missed') return 'high';
  if (log.compliance_status === 'late') return 'medium';
  return 'low';
}
```

## 🎨 Logic Tipe

```javascript
function getNotificationType(log) {
  if (log.compliance_status === 'missed') return 'danger';
  if (log.compliance_status === 'late') return 'warning';
  if (log.compliance_status === 'overdose') return 'danger';
  if (log.temperature && log.temperature > 30) return 'warning';
  if (log.humidity && log.humidity > 70) return 'warning';
  return 'info';
}
```

## 📝 Format Pesan Notifikasi

### Template Pesan
```javascript
// On-Time
"${medicineCount} obat berhasil diminum tepat waktu pada ${time}, ${date}."

// Late
"${medicineCount} obat diminum terlambat ${delayTime} pada ${time}, ${date}. ${notes}"

// Missed
"${medicineCount} obat tidak diminum pada ${time}, ${date}. ${notes}"

// Overdose
"⚠️ PERINGATAN: Terdeteksi potensi overdosis! ${medicineCount} obat diambil pada ${time}, ${date}. Segera konsultasi dengan dokter!"

// Tambahan Info
"🌡️ Suhu tinggi: ${temperature}°C"
"💧 Kelembaban: ${humidity}%"
"(${aksi})"
```

## 🚀 Setup & Installation

### Backend Setup
1. Pastikan model Log sudah memiliki field `isRead`, `aksi`, `waktu_konsumsi_seharusnya`, `timestamp_konsumsi_aktual`
2. Tambahkan route notifikasi di `server/index.js`
3. Deploy API endpoints

### Frontend Setup
1. Install NotificationContext di App.tsx
2. Wrap aplikasi dengan `<NotificationProvider>`
3. Import NotificationDropdown di Topbar
4. Import NotifikasiTab di FamilyDashboard

## 🔄 Flow Notifikasi

```
1. Device mengirim data log ke server
   ↓
2. Log disimpan di MongoDB dengan isRead: false
   ↓
3. Frontend fetch notifikasi setiap 30 detik
   ↓
4. Badge di icon lonceng menampilkan unread count
   ↓
5. User klik icon lonceng → dropdown muncul
   ↓
6. Semua notifikasi ditandai isRead: true
   ↓
7. Badge menghilang, unread count = 0
```

## 🎯 Best Practices

1. **Performance:**
   - Limit notifikasi ke 50 terbaru
   - Auto-refresh interval 30 detik (jangan terlalu cepat)
   - Lazy load di Family Dashboard

2. **UX:**
   - Badge merah untuk menarik perhatian
   - Animasi pulse untuk notifikasi baru
   - Relative time untuk kemudahan
   - Full datetime di tooltip

3. **Data:**
   - Simpan semua log di database
   - Jangan hapus notifikasi lama
   - Index pada patient_id dan createdAt
   - Cleanup otomatis notifikasi > 90 hari (optional)

## 🐛 Troubleshooting

### Badge tidak muncul
- Cek koneksi ke API `/api/notifications`
- Pastikan token valid
- Cek patient_id di user

### Notifikasi tidak update
- Cek auto-refresh interval
- Verify API endpoint working
- Check browser console untuk errors

### Notifikasi tidak ter-mark as read
- Verify POST to `/api/notifications/mark-all-read`
- Check authentication
- Verify patient_id matching

## 📱 Responsive Design

- Desktop: Dropdown width 420px, max-height 600px
- Mobile: Full width dropdown, max-height 80vh
- Touch-friendly button sizes (min 44px)

## 🔐 Security

- Semua endpoints memerlukan authentication
- User hanya bisa lihat notifikasi patient mereka sendiri
- Rate limiting pada API (recommended)
- Sanitize message content

## 📈 Future Enhancements

1. Push notifications (PWA)
2. Email notifications untuk critical alerts
3. SMS notifications untuk overdose
4. Notification preferences per user
5. Snooze functionality
6. Custom notification rules
7. Export notification history
8. Analytics dashboard untuk patterns

---

**Last Updated:** November 13, 2025  
**Version:** 1.0.0
