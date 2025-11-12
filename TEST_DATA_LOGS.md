# 🧪 Test Data untuk Collection Logs

## Struktur Data Sesuai MongoDB Collection

Berdasarkan struktur logs yang ada di MongoDB, berikut adalah contoh data untuk testing:

## 1. Insert Data Test - 7 Hari Terakhir

### A. Data Hari Ini (Varied Times)

```javascript
// === HARI INI ===

// Pagi - On Time (07:00)
db.logs.insertOne({
  patient_id: ObjectId("674eaa222222222222222222"), // Ganti dengan patient_id Anda
  device_id: ObjectId("674eaa333333333333333333"),
  servo_active: [1],
  waktu_konsumsi_seharusnya: new Date("2025-11-13T07:00:00Z"),
  timestamp_konsumsi_aktual: new Date("2025-11-13T07:02:00Z"),
  aksi: "Terima",
  delay_seconds: 120,
  compliance_status: "on-time",
  temperature: 24.5,
  humidity: 60.2,
  notes: "Obat pagi diminum tepat waktu",
  createdAt: new Date("2025-11-13T07:02:00Z")
});

// Siang - Late (14:00 -> 14:15)
db.logs.insertOne({
  patient_id: ObjectId("674eaa222222222222222222"),
  device_id: ObjectId("674eaa333333333333333333"),
  servo_active: [2],
  waktu_konsumsi_seharusnya: new Date("2025-11-13T14:00:00Z"),
  timestamp_konsumsi_aktual: new Date("2025-11-13T14:15:00Z"),
  aksi: "Terima",
  delay_seconds: 900,
  compliance_status: "late",
  temperature: 25.8,
  humidity: 62.6,
  notes: "Terlambat 15 menit",
  createdAt: new Date("2025-11-13T14:15:00Z")
});

// Sore - On Time (17:00)
db.logs.insertOne({
  patient_id: ObjectId("674eaa222222222222222222"),
  device_id: ObjectId("674eaa333333333333333333"),
  servo_active: [3],
  waktu_konsumsi_seharusnya: new Date("2025-11-13T17:00:00Z"),
  timestamp_konsumsi_aktual: new Date("2025-11-13T17:03:00Z"),
  aksi: "Terima",
  delay_seconds: 180,
  compliance_status: "on-time",
  temperature: 26.1,
  humidity: 59.8,
  notes: "Obat sore diminum",
  createdAt: new Date("2025-11-13T17:03:00Z")
});

// Malam - Missed (20:00)
db.logs.insertOne({
  patient_id: ObjectId("674eaa222222222222222222"),
  device_id: ObjectId("674eaa333333333333333333"),
  servo_active: [1, 2],
  waktu_konsumsi_seharusnya: new Date("2025-11-13T20:00:00Z"),
  timestamp_konsumsi_aktual: null,
  aksi: "Tolak",
  delay_seconds: 0,
  compliance_status: "missed",
  temperature: 25.5,
  humidity: 61.2,
  notes: "Pasien menolak minum obat",
  createdAt: new Date("2025-11-13T20:05:00Z")
});

// Malam - Late (21:00 -> 21:30)
db.logs.insertOne({
  patient_id: ObjectId("674eaa222222222222222222"),
  device_id: ObjectId("674eaa333333333333333333"),
  servo_active: [1],
  waktu_konsumsi_seharusnya: new Date("2025-11-13T21:00:00Z"),
  timestamp_konsumsi_aktual: new Date("2025-11-13T21:30:00Z"),
  aksi: "Terima",
  delay_seconds: 1800,
  compliance_status: "late",
  temperature: 24.8,
  humidity: 60.5,
  notes: "Terlambat 30 menit",
  createdAt: new Date("2025-11-13T21:30:00Z")
});
```

### B. Data 6 Hari Sebelumnya

```javascript
// === HARI KE -1 (12 Nov) ===
db.logs.insertMany([
  {
    patient_id: ObjectId("674eaa222222222222222222"),
    device_id: ObjectId("674eaa333333333333333333"),
    servo_active: [1],
    waktu_konsumsi_seharusnya: new Date("2025-11-12T08:00:00Z"),
    timestamp_konsumsi_aktual: new Date("2025-11-12T08:05:00Z"),
    aksi: "Terima",
    delay_seconds: 300,
    compliance_status: "on-time",
    temperature: 25.2,
    humidity: 61.0,
    notes: "Pagi",
    createdAt: new Date("2025-11-12T08:05:00Z")
  },
  {
    patient_id: ObjectId("674eaa222222222222222222"),
    device_id: ObjectId("674eaa333333333333333333"),
    servo_active: [2],
    waktu_konsumsi_seharusnya: new Date("2025-11-12T14:00:00Z"),
    timestamp_konsumsi_aktual: new Date("2025-11-12T14:20:00Z"),
    aksi: "Terima",
    delay_seconds: 1200,
    compliance_status: "late",
    temperature: 26.5,
    humidity: 63.2,
    notes: "Terlambat 20 menit",
    createdAt: new Date("2025-11-12T14:20:00Z")
  },
  {
    patient_id: ObjectId("674eaa222222222222222222"),
    device_id: ObjectId("674eaa333333333333333333"),
    servo_active: [1],
    waktu_konsumsi_seharusnya: new Date("2025-11-12T20:00:00Z"),
    timestamp_konsumsi_aktual: new Date("2025-11-12T20:02:00Z"),
    aksi: "Terima",
    delay_seconds: 120,
    compliance_status: "on-time",
    temperature: 24.9,
    humidity: 60.8,
    notes: "Malam",
    createdAt: new Date("2025-11-12T20:02:00Z")
  }
]);

// === HARI KE -2 (11 Nov) ===
db.logs.insertMany([
  {
    patient_id: ObjectId("674eaa222222222222222222"),
    device_id: ObjectId("674eaa333333333333333333"),
    servo_active: [1, 2],
    waktu_konsumsi_seharusnya: new Date("2025-11-11T07:00:00Z"),
    timestamp_konsumsi_aktual: new Date("2025-11-11T07:00:00Z"),
    aksi: "Terima",
    delay_seconds: 0,
    compliance_status: "on-time",
    temperature: 24.3,
    humidity: 59.5,
    notes: "Tepat waktu",
    createdAt: new Date("2025-11-11T07:00:00Z")
  },
  {
    patient_id: ObjectId("674eaa222222222222222222"),
    device_id: ObjectId("674eaa333333333333333333"),
    servo_active: [3],
    waktu_konsumsi_seharusnya: new Date("2025-11-11T13:00:00Z"),
    timestamp_konsumsi_aktual: null,
    aksi: "Tolak",
    delay_seconds: 0,
    compliance_status: "missed",
    temperature: 25.8,
    humidity: 62.1,
    notes: "Tidak diminum",
    createdAt: new Date("2025-11-11T13:10:00Z")
  },
  {
    patient_id: ObjectId("674eaa222222222222222222"),
    device_id: ObjectId("674eaa333333333333333333"),
    servo_active: [1],
    waktu_konsumsi_seharusnya: new Date("2025-11-11T19:00:00Z"),
    timestamp_konsumsi_aktual: new Date("2025-11-11T19:45:00Z"),
    aksi: "Terima",
    delay_seconds: 2700,
    compliance_status: "late",
    temperature: 25.1,
    humidity: 60.9,
    notes: "Terlambat 45 menit",
    createdAt: new Date("2025-11-11T19:45:00Z")
  }
]);

// === HARI KE -3 sampai -6 (Pattern Similar) ===
// Copy pattern di atas dan adjust tanggal
```

## 2. Bulk Insert untuk Testing Lengkap

```javascript
// Generate data 7 hari dengan pattern realistis
const patient_id = ObjectId("674eaa222222222222222222"); // GANTI!
const device_id = ObjectId("674eaa333333333333333333");   // GANTI!

const bulkData = [];
const today = new Date();
today.setHours(0, 0, 0, 0);

for (let day = 6; day >= 0; day--) {
  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() - day);
  
  // 3-5 logs per hari
  const logsPerDay = 3 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < logsPerDay; i++) {
    const hour = 7 + (i * 5); // 07:00, 12:00, 17:00, 22:00
    const logDate = new Date(baseDate);
    logDate.setHours(hour, 0, 0, 0);
    
    // Random: 70% on-time, 20% late, 10% missed
    const rand = Math.random();
    let status, aksi, delay, actualTime;
    
    if (rand < 0.7) {
      status = "on-time";
      aksi = "Terima";
      delay = Math.floor(Math.random() * 300); // 0-5 menit
      actualTime = new Date(logDate.getTime() + delay * 1000);
    } else if (rand < 0.9) {
      status = "late";
      aksi = "Terima";
      delay = 300 + Math.floor(Math.random() * 1800); // 5-35 menit
      actualTime = new Date(logDate.getTime() + delay * 1000);
    } else {
      status = "missed";
      aksi = "Tolak";
      delay = 0;
      actualTime = null;
    }
    
    bulkData.push({
      patient_id,
      device_id,
      servo_active: [Math.floor(Math.random() * 3) + 1],
      waktu_konsumsi_seharusnya: logDate,
      timestamp_konsumsi_aktual: actualTime,
      aksi,
      delay_seconds: delay,
      compliance_status: status,
      temperature: 24 + Math.random() * 4,
      humidity: 58 + Math.random() * 10,
      notes: status === "missed" ? "Tidak diminum" : 
             status === "late" ? `Terlambat ${Math.floor(delay/60)} menit` : 
             "Tepat waktu",
      createdAt: actualTime || new Date(logDate.getTime() + 600000)
    });
  }
}

db.logs.insertMany(bulkData);
print(`✅ Inserted ${bulkData.length} logs for testing`);
```

## 3. Verify Data

```javascript
// Cek total logs untuk patient
db.logs.countDocuments({ patient_id: ObjectId("674eaa222222222222222222") });

// Cek logs 7 hari terakhir
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
db.logs.find({ 
  patient_id: ObjectId("674eaa222222222222222222"),
  createdAt: { $gte: sevenDaysAgo }
}).count();

// Cek distribusi status
db.logs.aggregate([
  { 
    $match: { 
      patient_id: ObjectId("674eaa222222222222222222"),
      createdAt: { $gte: sevenDaysAgo }
    } 
  },
  { 
    $group: { 
      _id: "$compliance_status", 
      count: { $sum: 1 } 
    } 
  }
]);

// Cek distribusi waktu
db.logs.aggregate([
  { 
    $match: { 
      patient_id: ObjectId("674eaa222222222222222222"),
      createdAt: { $gte: sevenDaysAgo }
    } 
  },
  { 
    $project: {
      hour: { $hour: "$createdAt" },
      compliance_status: 1
    }
  },
  {
    $group: {
      _id: {
        timeOfDay: {
          $cond: [
            { $and: [{ $gte: ["$hour", 5] }, { $lt: ["$hour", 12] }] },
            "Pagi",
            { $cond: [
              { $and: [{ $gte: ["$hour", 12] }, { $lt: ["$hour", 18] }] },
              "Siang",
              "Malam"
            ]}
          ]
        }
      },
      count: { $sum: 1 }
    }
  }
]);
```

## 4. Expected Dashboard Results

Setelah insert data di atas, expected results:

### Waktu Pengambilan Obat (7 Hari):
```
Hari ke -6: 3-5 obat
Hari ke -5: 3-5 obat
Hari ke -4: 3-5 obat
Hari ke -3: 3-5 obat
Hari ke -2: 3-5 obat
Hari ke -1: 3-5 obat
Hari ke -0: 3-5 obat
```

### Analisis Waktu Kritis:
```
Pagi (5-12):   ~33%
Siang (12-18): ~33%
Malam (18-5):  ~33%
```

### Status Kepatuhan:
```
Compliance Rate: ~70-80%
Status: Patuh / Cukup Patuh
Kategori: Baik / Perlu Perhatian
```

### Hari Ini:
```
Diminum: 3-4
Terlewat: 0-1
Total: 4-5
Persentase: 60-100%
```

## 5. Clean Up (Jika Perlu Reset)

```javascript
// HATI-HATI! Ini akan hapus SEMUA logs patient
db.logs.deleteMany({ 
  patient_id: ObjectId("674eaa222222222222222222") 
});

// Atau hapus hanya logs testing (7 hari terakhir)
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
db.logs.deleteMany({ 
  patient_id: ObjectId("674eaa222222222222222222"),
  createdAt: { $gte: sevenDaysAgo }
});
```

## 6. Tips Testing

1. **Ganti ObjectId:**
   - Cari patient_id yang valid: `db.patients.findOne({}, {_id: 1})`
   - Cari device_id yang valid: `db.devices.findOne({}, {_id: 1})`

2. **Test Incremental:**
   - Insert 1 log dulu, cek API
   - Insert 1 hari penuh, cek grafik
   - Insert 7 hari, cek semua fitur

3. **Verify di Compass:**
   - Gunakan Filter di Compass untuk visualisasi
   - Sort by `createdAt: -1` untuk lihat terbaru
   - Check field values match expected

4. **Monitor API Response:**
   ```bash
   # Test API endpoint
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:5000/api/dashboard/patient/YOUR_PATIENT_ID
   ```

---

**Happy Testing! 🚀**
