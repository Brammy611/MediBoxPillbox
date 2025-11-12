# 🧪 Testing Notification System

## Quick Test Guide

### 1. Insert Test Logs ke MongoDB

Gunakan MongoDB Compass atau mongosh untuk insert data test:

```javascript
// Contoh Log - On Time
db.logs.insertOne({
  patient_id: ObjectId("674eaa222222222222222222"), // Ganti dengan patient_id yang valid
  device_id: ObjectId("674eaa333333333333333333"),
  servo_active: [1, 2],
  waktu_konsumsi_seharusnya: new Date("2025-11-13T07:00:00Z"),
  timestamp_konsumsi_aktual: new Date("2025-11-13T07:02:00Z"),
  aksi: "Terima",
  delay_seconds: 0,
  compliance_status: "on-time",
  temperature: 25.5,
  humidity: 60.2,
  notes: "Obat diminum tepat waktu",
  isRead: false,
  createdAt: new Date()
});

// Contoh Log - Late (Terlambat)
db.logs.insertOne({
  patient_id: ObjectId("674eaa222222222222222222"),
  device_id: ObjectId("674eaa333333333333333333"),
  servo_active: [1],
  waktu_konsumsi_seharusnya: new Date("2025-11-13T13:00:00Z"),
  timestamp_konsumsi_aktual: new Date("2025-11-13T13:08:55Z"),
  aksi: "Terima",
  delay_seconds: 535,
  compliance_status: "late",
  temperature: 25.8,
  humidity: 62.6,
  notes: "1 obat diambil terlambat 8 menit",
  isRead: false,
  createdAt: new Date()
});

// Contoh Log - Missed (Terlewat)
db.logs.insertOne({
  patient_id: ObjectId("674eaa222222222222222222"),
  device_id: ObjectId("674eaa333333333333333333"),
  servo_active: [1, 2, 3],
  waktu_konsumsi_seharusnya: new Date("2025-11-13T20:00:00Z"),
  timestamp_konsumsi_aktual: null,
  aksi: "Tolak",
  delay_seconds: 0,
  compliance_status: "missed",
  temperature: 26.1,
  humidity: 58.5,
  notes: "Pasien tidak mengambil obat",
  isRead: false,
  createdAt: new Date()
});

// Contoh Log - Overdose (KRITIS!)
db.logs.insertOne({
  patient_id: ObjectId("674eaa222222222222222222"),
  device_id: ObjectId("674eaa333333333333333333"),
  servo_active: [1],
  waktu_konsumsi_seharusnya: new Date("2025-11-13T14:00:00Z"),
  timestamp_konsumsi_aktual: new Date("2025-11-13T14:15:00Z"),
  aksi: "Terima",
  delay_seconds: 900,
  compliance_status: "overdose",
  temperature: 27.2,
  humidity: 61.8,
  notes: "PERINGATAN: Terdeteksi pengambilan obat di luar jadwal!",
  isRead: false,
  createdAt: new Date()
});

// Contoh Log - Suhu Tinggi
db.logs.insertOne({
  patient_id: ObjectId("674eaa222222222222222222"),
  device_id: ObjectId("674eaa333333333333333333"),
  servo_active: [2],
  waktu_konsumsi_seharusnya: new Date("2025-11-13T08:00:00Z"),
  timestamp_konsumsi_aktual: new Date("2025-11-13T08:01:00Z"),
  aksi: "Terima",
  delay_seconds: 60,
  compliance_status: "on-time",
  temperature: 32.5, // Suhu tinggi!
  humidity: 75.2, // Kelembaban tinggi!
  notes: "Peringatan: Suhu dan kelembaban tidak normal",
  isRead: false,
  createdAt: new Date()
});
```

### 2. Bulk Insert untuk Testing

```javascript
// Insert multiple logs sekaligus
db.logs.insertMany([
  {
    patient_id: ObjectId("674eaa222222222222222222"),
    device_id: ObjectId("674eaa333333333333333333"),
    servo_active: [1],
    waktu_konsumsi_seharusnya: new Date("2025-11-13T06:00:00Z"),
    timestamp_konsumsi_aktual: new Date("2025-11-13T06:02:00Z"),
    aksi: "Terima",
    delay_seconds: 120,
    compliance_status: "late",
    temperature: 24.8,
    humidity: 59.3,
    notes: "Terlambat 2 menit",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 jam lalu
  },
  {
    patient_id: ObjectId("674eaa222222222222222222"),
    device_id: ObjectId("674eaa333333333333333333"),
    servo_active: [1, 2],
    waktu_konsumsi_seharusnya: new Date("2025-11-13T12:00:00Z"),
    timestamp_konsumsi_aktual: new Date("2025-11-13T12:00:30Z"),
    aksi: "Terima",
    delay_seconds: 30,
    compliance_status: "on-time",
    temperature: 25.1,
    humidity: 61.0,
    notes: "Obat diminum tepat waktu",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 menit lalu
  },
  {
    patient_id: ObjectId("674eaa222222222222222222"),
    device_id: ObjectId("674eaa333333333333333333"),
    servo_active: [3],
    waktu_konsumsi_seharusnya: new Date("2025-11-13T18:00:00Z"),
    timestamp_konsumsi_aktual: null,
    aksi: "Tolak",
    delay_seconds: 0,
    compliance_status: "missed",
    temperature: 26.5,
    humidity: 63.2,
    notes: "Pasien melewatkan jadwal",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 10) // 10 menit lalu
  }
]);
```

### 3. Test API dengan Postman/Thunder Client

#### A. Get Notifications
```http
GET http://localhost:5000/api/notifications
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "unreadCount": 5
  }
}
```

#### B. Mark All as Read
```http
POST http://localhost:5000/api/notifications/mark-all-read
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Semua notifikasi ditandai sudah dibaca"
}
```

#### C. Mark Specific as Read
```http
POST http://localhost:5000/api/notifications/mark-read
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "notificationIds": ["6914a79a95445bfda4412dfa", "6914a79a95445bfda4412dfb"]
}
```

### 4. Test Frontend

#### A. Test Badge di Topbar
1. Login ke aplikasi
2. Cek icon lonceng - harus ada badge merah dengan angka
3. Klik icon lonceng
4. Badge harus hilang

#### B. Test Dropdown
1. Klik icon lonceng
2. Dropdown muncul dengan notifikasi
3. Notifikasi ditampilkan dengan warna sesuai prioritas
4. Relative time ditampilkan dengan benar

#### C. Test Family Dashboard - Tab Notifikasi
1. Buka Family Dashboard
2. Klik tab "Notifikasi"
3. Test filter: Semua, Kritis, Penting, Peringatan, Info
4. Cek detail notifikasi ditampilkan lengkap

### 5. Test Auto-Refresh

```javascript
// Di browser console, monitor fetch requests
// Seharusnya fetch setiap 30 detik
setInterval(() => {
  console.log('Checking notifications...', new Date().toLocaleTimeString());
}, 30000);
```

### 6. Query MongoDB untuk Debugging

```javascript
// Cek semua logs untuk patient tertentu
db.logs.find({ 
  patient_id: ObjectId("674eaa222222222222222222") 
}).sort({ createdAt: -1 }).limit(10);

// Cek unread notifications
db.logs.find({ 
  patient_id: ObjectId("674eaa222222222222222222"),
  isRead: { $ne: true }
}).count();

// Update semua notifikasi jadi unread (untuk testing)
db.logs.updateMany(
  { patient_id: ObjectId("674eaa222222222222222222") },
  { $set: { isRead: false } }
);

// Hapus semua logs (HATI-HATI!)
db.logs.deleteMany({ 
  patient_id: ObjectId("674eaa222222222222222222") 
});

// Get notification count by status
db.logs.aggregate([
  { $match: { patient_id: ObjectId("674eaa222222222222222222") } },
  { $group: { _id: "$compliance_status", count: { $sum: 1 } } }
]);
```

### 7. Test Scenarios

#### Scenario 1: First Time User
1. Login sebagai user baru
2. Tidak ada notifikasi
3. Badge tidak muncul
4. Dropdown menampilkan "Tidak ada notifikasi"

#### Scenario 2: Multiple Unread
1. Insert 10 logs dengan isRead: false
2. Badge menampilkan "9+" (karena max 9)
3. Klik icon lonceng
4. Dropdown menampilkan 10 notifikasi
5. Badge hilang

#### Scenario 3: Critical Notification
1. Insert log dengan compliance_status: "overdose"
2. Badge muncul
3. Dropdown menampilkan notifikasi dengan background merah
4. Label "KRITIS" ditampilkan

#### Scenario 4: Filter di Family Dashboard
1. Buka tab Notifikasi
2. Default: Filter "Semua"
3. Klik filter "Kritis" - hanya notifikasi overdose
4. Klik filter "Penting" - hanya notifikasi missed
5. Klik filter "Peringatan" - hanya notifikasi late
6. Klik filter "Info" - hanya notifikasi on-time

### 8. Performance Testing

```javascript
// Insert 100 logs untuk testing performance
const logs = [];
for (let i = 0; i < 100; i++) {
  logs.push({
    patient_id: ObjectId("674eaa222222222222222222"),
    device_id: ObjectId("674eaa333333333333333333"),
    servo_active: [Math.floor(Math.random() * 3) + 1],
    waktu_konsumsi_seharusnya: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    timestamp_konsumsi_aktual: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    aksi: Math.random() > 0.5 ? "Terima" : "Tolak",
    delay_seconds: Math.floor(Math.random() * 1800),
    compliance_status: ["on-time", "late", "missed"][Math.floor(Math.random() * 3)],
    temperature: 20 + Math.random() * 15,
    humidity: 40 + Math.random() * 40,
    notes: `Test notification ${i}`,
    isRead: Math.random() > 0.5,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
  });
}
db.logs.insertMany(logs);
```

### 9. Browser Console Tests

```javascript
// Test 1: Check NotificationContext
// Di browser console:
window.localStorage.getItem('token');

// Test 2: Manually trigger refresh
// (Jika sudah ada reference ke context)
// notificationContext.refreshNotifications();

// Test 3: Check current notifications
fetch('http://localhost:5000/api/notifications', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(d => console.log(d));
```

### 10. Checklist Testing

- [ ] Badge muncul dengan jumlah yang benar
- [ ] Badge hilang setelah dropdown dibuka
- [ ] Dropdown menampilkan notifikasi dengan benar
- [ ] Warna notifikasi sesuai prioritas
- [ ] Icon notifikasi sesuai tipe
- [ ] Relative time ditampilkan dengan benar
- [ ] Full datetime muncul di tooltip
- [ ] Auto-refresh bekerja (30 detik)
- [ ] Mark as read berfungsi
- [ ] Filter di Family Dashboard berfungsi
- [ ] Detail notifikasi lengkap
- [ ] Info tambahan (suhu, kelembaban) ditampilkan
- [ ] Badge "KRITIS" dan "PENTING" muncul
- [ ] Dot biru untuk unread notification
- [ ] Animasi pulse pada badge
- [ ] Responsive di mobile
- [ ] Loading state ditampilkan

### 11. Common Issues & Solutions

#### Issue: Badge tidak muncul
**Solution:**
- Pastikan user sudah login
- Cek patient_id di user document
- Verify token valid
- Check API response di Network tab

#### Issue: Notifikasi tidak update
**Solution:**
- Check console untuk errors
- Verify auto-refresh interval
- Check server running
- Verify MongoDB connection

#### Issue: Dropdown kosong
**Solution:**
- Insert test logs ke MongoDB
- Check patient_id matching
- Verify createdAt < 30 days
- Check API endpoint response

---

**Happy Testing! 🚀**
