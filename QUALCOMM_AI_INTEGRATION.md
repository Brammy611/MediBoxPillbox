# 🤖 Qualcomm AI Compliance Integration

## 📋 Overview

Sistem ini mengintegrasikan **Qualcomm AI** untuk mengklasifikasi kepatuhan konsumsi obat pasien berdasarkan data dari collection `logs`. Hasil klasifikasi disimpan ke collection `kepatuhan` untuk analisis lebih lanjut.

---

## 🏗️ Arsitektur Sistem

```
┌─────────────┐
│   Logs      │  ← Data konsumsi obat dari device/manual entry
│ Collection  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Compliance Scheduler    │  ← Otomatis proses setiap 5 menit
│ (complianceScheduler.js)│
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Qualcomm AI Service    │  ← Kirim data ke Qualcomm AI Hub
│ (qualcommAIService.js)  │     - waktu_konsumsi_seharusnya
└──────┬──────────────────┘     - timestamp_konsumsi_aktual
       │                         - aksi (Terima/Tolak)
       ▼
┌─────────────────────────┐
│   Qualcomm AI Hub       │  ← Klasifikasi: Patuh / Tidak Patuh
│   (Cloud API)           │     + Confidence Score
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│   Kepatuhan Collection  │  ← Simpan hasil klasifikasi
│   - kepatuhan           │     + timestamp created_at
│   - confidence_score    │
│   - patient_id          │
│   - log_id              │
└─────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Dashboard API          │  ← Display statistik kepatuhan
│  (familyDashboard.js)   │     - Persentase kepatuhan
└─────────────────────────┘     - Status: Patuh/Tidak Patuh
                                - Kategori: Baik/Sedang/Perlu Perhatian
```

---

## 📊 Collection Schema

### Collection: `logs`
Field yang digunakan untuk klasifikasi:
```javascript
{
  waktu_konsumsi_seharusnya: Date,    // Jadwal konsumsi
  timestamp_konsumsi_aktual: Date,    // Waktu aktual konsumsi
  aksi: String,                        // "Terima" atau "Tolak"
  patient: ObjectId                    // Reference ke Patient
}
```

### Collection: `kepatuhan`
Hasil klasifikasi dari Qualcomm AI:
```javascript
{
  patient_id: ObjectId,               // Reference ke Patient
  log_id: ObjectId,                   // Reference ke Log
  kepatuhan: String,                  // "Patuh" atau "Tidak Patuh"
  waktu_konsumsi_seharusnya: Date,
  timestamp_konsumsi_aktual: Date,
  aksi: String,                       // "Terima" atau "Tolak"
  confidence_score: Number,           // 0-1, tingkat kepercayaan AI
  created_at: Date                    // Timestamp klasifikasi
}
```

---

## 🔧 Setup & Installation

### 1. Install Dependencies
```powershell
cd C:\Arib\MediBoxPillbox\MediBoxPillbox\server
npm install
```

Package yang ditambahkan:
- `axios` - HTTP client untuk API calls
- `node-cron` - Scheduler untuk otomasi

### 2. Environment Variables
Pastikan `.env` sudah lengkap:
```env
# MongoDB
MONGO_URI=mongodb+srv://...
MONGO_DB=MediBoxPillbox

# Qualcomm AI Hub
QUALCOMM_AI_API_URL=https://app.aihub.qualcomm.com/api/models/mq885klzq/predict
QUALCOMM_AI_API_KEY=bet3vrp7r5aysc09ypmmyf21suvmwn9nkgr7j80d
```

### 3. Start Server
```powershell
npm run dev
```

Expected output:
```
🔐 Environment Variables Loaded:
   - QUALCOMM_AI_API_KEY: ✓ Set (bet3vrp7r5...)
MongoDB Connected: Berhasil terhubung ke database MediBoxPillbox...
🤖 Starting Qualcomm AI Compliance Scheduler...
🕐 [Compliance Scheduler] Initializing...
📅 Schedule: Every 5 minutes
```

---

## 🚀 API Endpoints

### Base URL: `/api/compliance`

#### 1. Test Koneksi Qualcomm AI
```http
GET /api/compliance/test
```

**Response:**
```json
{
  "success": true,
  "message": "Koneksi ke Qualcomm AI Hub berhasil",
  "method": "qualcomm-ai",
  "timestamp": "2025-11-13T10:30:00.000Z"
}
```

---

#### 2. Proses Satu Log
```http
POST /api/compliance/process/:logId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Kepatuhan berhasil diproses",
  "data": {
    "patient_id": "673e11d20d2e1d2d5e9c4567",
    "log_id": "674a5b3c1f8e2a4b6c7d8e9f",
    "kepatuhan": "Patuh",
    "confidence_score": 0.95,
    "created_at": "2025-11-13T10:30:00.000Z"
  },
  "isNew": true,
  "aiMethod": "qualcomm-ai"
}
```

---

#### 3. Proses Batch (Semua Logs Belum Diproses)
```http
POST /api/compliance/process-batch
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Batch processing selesai",
  "processed": 45,
  "errors": 2,
  "total": 47,
  "results": [
    {
      "log_id": "674a5b3c1f8e2a4b6c7d8e9f",
      "kepatuhan": "Patuh",
      "confidence": 0.95,
      "status": "success"
    },
    // ... more results
  ]
}
```

---

#### 4. Get Statistik Kepatuhan
```http
GET /api/compliance/stats/:patientId?days=7
Authorization: Bearer <token>
```

**Query Parameters:**
- `days` (optional): Jumlah hari ke belakang (default: 7)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 50,
      "patuh": 42,
      "tidakPatuh": 8,
      "persentasePatuh": 84.0,
      "kategori": "Baik"
    },
    "dailyStats": {
      "2025-11-13": { "patuh": 5, "tidakPatuh": 1 },
      "2025-11-12": { "patuh": 6, "tidakPatuh": 0 },
      // ... per hari
    },
    "recentCompliance": [
      // 10 data terbaru
    ]
  }
}
```

---

#### 5. Get All Compliance Data Patient
```http
GET /api/compliance/patient/:patientId?limit=50&skip=0
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "674a5b3c1f8e2a4b6c7d8e9f",
      "patient_id": "673e11d20d2e1d2d5e9c4567",
      "kepatuhan": "Patuh",
      "confidence_score": 0.95,
      "created_at": "2025-11-13T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "skip": 0,
    "hasMore": true
  }
}
```

---

#### 6. Reset Compliance Data (Testing)
```http
DELETE /api/compliance/reset/:patientId?
Authorization: Bearer <token>
```

**Parameters:**
- `patientId` (optional): Jika ada, hanya hapus data patient ini. Jika tidak, hapus semua.

---

## 🕐 Automated Scheduler

### Cara Kerja
Scheduler berjalan **otomatis setiap 5 menit** untuk:
1. Cek logs baru yang belum diproses
2. Kirim ke Qualcomm AI untuk klasifikasi
3. Simpan hasil ke collection `kepatuhan`

### Konfigurasi
File: `server/schedulers/complianceScheduler.js`

Ubah interval di cron expression:
```javascript
// Setiap 5 menit
cron.schedule('*/5 * * * *', () => { ... });

// Setiap 10 menit
cron.schedule('*/10 * * * *', () => { ... });

// Setiap jam
cron.schedule('0 * * * *', () => { ... });
```

### Manual Trigger
Untuk testing, bisa trigger manual dari API:
```javascript
const { triggerManualProcessing } = require('./schedulers/complianceScheduler');
await triggerManualProcessing();
```

---

## 📈 Dashboard Integration

Data kepatuhan dari Qualcomm AI otomatis terintegrasi di:

### Family Dashboard
**Endpoint:** `GET /api/family-dashboard/:patientId`

**Response (added fields):**
```json
{
  "stats": {
    "statusKepatuhan": "Patuh",
    "kategoriKepatuhan": "Baik",
    "persentaseKepatuhan": 84,
    "totalKepatuhan": 50,
    "jumlahPatuh": 42,
    "jumlahTidakPatuh": 8
  }
}
```

### Status Kepatuhan Categories
- **Baik** (≥80%): Pasien sangat patuh
- **Sedang** (50-79%): Perlu sedikit pengawasan
- **Perlu Perhatian** (<50%): Butuh intervensi segera

---

## 🔄 Fallback Mechanism

Jika Qualcomm AI tidak tersedia, sistem menggunakan **Rule-Based Classification**:

### Rules:
1. **Aksi = "Tolak"** → Tidak Patuh (100% confidence)
2. **Aksi = "Terima"**:
   - Delay ≤ 30 menit → Patuh
   - Delay > 30 menit → Tidak Patuh

File: `server/services/qualcommAIService.js`

```javascript
fallbackClassification(logData) {
  if (aksi === 'Tolak') return 'Tidak Patuh';
  
  const delayMinutes = (actualTime - scheduledTime) / 60000;
  return Math.abs(delayMinutes) <= 30 ? 'Patuh' : 'Tidak Patuh';
}
```

---

## 🧪 Testing

### 1. Test Koneksi Qualcomm AI
```powershell
curl http://localhost:5000/api/compliance/test
```

### 2. Proses Batch Logs
```powershell
curl -X POST http://localhost:5000/api/compliance/process-batch \
  -H "Authorization: Bearer <token>"
```

### 3. Cek Statistik
```powershell
curl http://localhost:5000/api/compliance/stats/<patientId>?days=7 \
  -H "Authorization: Bearer <token>"
```

### 4. Monitor Scheduler Logs
Lihat console saat server berjalan:
```
⏰ [13/11/2025 10:30:00] Compliance scheduler triggered
🤖 [Compliance Scheduler] Starting automated compliance processing...
📊 Found 5 unprocessed log(s)
   ✅ [1/5] Log 674a5b3c1f8e2a4b6c7d8e9f: Patuh (confidence: 0.95)
   ✅ [2/5] Log 674a5b3c1f8e2a4b6c7d8ea0: Tidak Patuh (confidence: 0.87)
📊 [Compliance Scheduler] Processing complete:
   ✅ Success: 5
   ❌ Errors: 0
```

---

## 🐛 Troubleshooting

### Masalah 1: Scheduler Tidak Berjalan
**Solusi:**
- Pastikan MongoDB terkoneksi
- Cek console untuk error
- Pastikan `node-cron` terinstall

### Masalah 2: Qualcomm AI Error
**Solusi:**
- Cek API key di `.env`
- Test koneksi: `GET /api/compliance/test`
- Periksa koneksi internet
- Cek quota/limit API

### Masalah 3: Data Tidak Muncul di Dashboard
**Solusi:**
- Pastikan logs memiliki field: `waktu_konsumsi_seharusnya`, `timestamp_konsumsi_aktual`, `aksi`
- Run batch process: `POST /api/compliance/process-batch`
- Cek collection `kepatuhan` di MongoDB

---

## 📚 File Structure

```
server/
├── controllers/
│   └── complianceController.js       # Controller untuk API compliance
├── models/
│   ├── kepatuhan.js                  # Schema collection kepatuhan
│   └── log.js                        # Schema collection logs
├── routes/
│   └── api/
│       ├── compliance.js             # Routes untuk /api/compliance
│       └── familyDashboard.js        # Updated dengan data kepatuhan
├── services/
│   └── qualcommAIService.js          # Service Qualcomm AI + fallback
├── schedulers/
│   └── complianceScheduler.js        # Automated scheduler
└── index.js                          # Main server (start scheduler)
```

---

## 🎯 Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Configure `.env` dengan Qualcomm API key
3. ✅ Start server (`npm run dev`)
4. 🔄 Monitor scheduler logs
5. 🧪 Test API endpoints
6. 📊 Lihat hasil di Family Dashboard

---

## 📞 Support

Jika ada masalah:
1. Cek server logs untuk error messages
2. Test koneksi Qualcomm AI
3. Verifikasi data logs lengkap (waktu_konsumsi_seharusnya, timestamp_konsumsi_aktual, aksi)
4. Hubungi admin untuk troubleshooting lebih lanjut

---

**Last Updated:** November 13, 2025
**Version:** 1.0.0
