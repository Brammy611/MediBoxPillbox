# 🚀 Quick Start - Qualcomm AI Compliance Integration

## ⚡ Setup Cepat (5 Menit)

### 1️⃣ Install Dependencies
```powershell
cd C:\Arib\MediBoxPillbox\MediBoxPillbox\server
npm install
```

Dependencies yang ditambahkan:
- ✅ `axios` - untuk API calls
- ✅ `node-cron` - untuk automated scheduler

---

### 2️⃣ Cek Environment Variables
File `.env` sudah diupdate dan berisi:
```env
QUALCOMM_AI_API_URL=https://app.aihub.qualcomm.com/api/models/mq885klzq/predict
QUALCOMM_AI_API_KEY=bet3vrp7r5aysc09ypmmyf21suvmwn9nkgr7j80d
```

✅ Sudah dikonfigurasi dengan benar!

---

### 3️⃣ Pastikan MongoDB Terkoneksi
Sebelum start server, pastikan MongoDB Atlas cluster aktif:
1. Login ke https://cloud.mongodb.com/
2. Cek Cluster0 tidak paused
3. Whitelist IP: 0.0.0.0/0

---

### 4️⃣ Start Server
```powershell
cd C:\Arib\MediBoxPillbox\MediBoxPillbox\server
npm run dev
```

**Expected Output:**
```
🔐 Environment Variables Loaded:
   - MONGO_URI: ✓ Set
   - GEMINI_API_KEY: ✓ Set (AIzaSyDSQh...)
   - QUALCOMM_AI_API_KEY: ✓ Set (bet3vrp7r5...)
   
MongoDB Connected: Berhasil terhubung ke database MediBoxPillbox...
🤖 Starting Qualcomm AI Compliance Scheduler...
🕐 [Compliance Scheduler] Initializing...
📅 Schedule: Every 5 minutes
🚀 Running initial compliance processing...
🚀 Server berjalan pada http://localhost:5000
```

---

## 🧪 Test Integrasi

### Test 1: Koneksi Qualcomm AI
```powershell
# PowerShell
Invoke-WebRequest http://localhost:5000/api/compliance/test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Koneksi ke Qualcomm AI Hub berhasil"
}
```

---

### Test 2: Proses Batch Logs
Login dulu untuk dapat token, lalu:

```powershell
# Login untuk dapat token
$response = Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/auth/login" -ContentType "application/json" -Body '{"email":"family@example.com","password":"password123"}'
$token = $response.token

# Proses batch logs
Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/compliance/process-batch" -Headers @{Authorization="Bearer $token"}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Batch processing selesai",
  "processed": 15,
  "errors": 0,
  "total": 15
}
```

---

### Test 3: Cek Statistik Kepatuhan
```powershell
# Ganti <patientId> dengan ID patient yang valid
$patientId = "673e11d20d2e1d2d5e9c4567"
Invoke-RestMethod -Method GET -Uri "http://localhost:5000/api/compliance/stats/$patientId" -Headers @{Authorization="Bearer $token"}
```

**Expected Response:**
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
    }
  }
}
```

---

## 📊 Lihat Hasil di Dashboard

### Family Dashboard
1. Buka browser: http://localhost:3000
2. Login sebagai caregiver
3. Pilih patient
4. Lihat di **Panel Statistik**:
   - Status Kepatuhan: Patuh/Tidak Patuh
   - Persentase Kepatuhan: XX%
   - Kategori: Baik/Sedang/Perlu Perhatian

Dashboard otomatis mengambil data dari collection `kepatuhan` yang diproses oleh Qualcomm AI!

---

## 🔄 Cara Kerja Scheduler

Scheduler berjalan **otomatis setiap 5 menit**:

```
⏰ 10:00 - Cek logs baru → Proses 3 logs → Simpan ke kepatuhan
⏰ 10:05 - Cek logs baru → Tidak ada logs baru → Skip
⏰ 10:10 - Cek logs baru → Proses 1 log → Simpan ke kepatuhan
```

Monitor di console server:
```
⏰ [13/11/2025 10:30:00] Compliance scheduler triggered
🤖 [Compliance Scheduler] Starting automated compliance processing...
📊 Found 5 unprocessed log(s)
   ✅ [1/5] Log xxx: Patuh (confidence: 0.95)
   ✅ [2/5] Log xxx: Tidak Patuh (confidence: 0.87)
📊 Processing complete: ✅ 5 success, ❌ 0 errors
```

---

## 📝 File Changes Summary

### ✅ File Baru Dibuat:
1. `server/controllers/complianceController.js` - Controller API compliance
2. `server/routes/api/compliance.js` - Routes `/api/compliance`
3. `server/schedulers/complianceScheduler.js` - Automated scheduler
4. `QUALCOMM_AI_INTEGRATION.md` - Dokumentasi lengkap
5. `QUALCOMM_AI_QUICKSTART.md` - Quick start guide (file ini)

### ✅ File Diupdate:
1. `server/index.js` - Tambah route compliance & start scheduler
2. `server/routes/api/familyDashboard.js` - Gunakan data dari collection kepatuhan
3. `server/package.json` - Tambah dependencies (axios, node-cron)
4. `server/.env` - Already configured (sudah ada Qualcomm API key)

### ✅ File Yang Sudah Ada (Tidak Diubah):
1. `server/services/qualcommAIService.js` - Service Qualcomm AI
2. `server/models/kepatuhan.js` - Schema collection kepatuhan
3. `server/models/log.js` - Schema collection logs

---

## 🎯 Next Actions

### Immediate (Sekarang):
1. ✅ `npm install` - Install dependencies
2. ✅ `npm run dev` - Start server
3. ✅ Test koneksi Qualcomm AI
4. ✅ Run batch process untuk proses logs yang ada

### Testing (Dalam 5 menit):
1. Tambah logs baru di database (simulasi device/manual entry)
2. Tunggu scheduler proses (max 5 menit)
3. Cek collection `kepatuhan` di MongoDB
4. Refresh Family Dashboard - lihat perubahan statistik

### Monitoring (Ongoing):
1. Monitor server logs untuk scheduler activity
2. Cek error rate di scheduler
3. Monitor Qualcomm AI quota/usage
4. Validasi akurasi klasifikasi vs expected behavior

---

## 🐛 Common Issues

### Issue 1: Dependencies Error
```
Error: Cannot find module 'axios'
```
**Fix:**
```powershell
npm install axios node-cron
```

---

### Issue 2: Scheduler Tidak Berjalan
**Cek:**
1. MongoDB terkoneksi? (lihat "MongoDB Connected" di console)
2. Server fully started? (lihat "Server berjalan pada...")
3. Ada error di console?

**Fix:**
- Restart server: Ctrl+C → `npm run dev`

---

### Issue 3: No Logs to Process
```
ℹ️  No logs found with complete compliance data
```
**Artinya:** Belum ada logs dengan field lengkap
- `waktu_konsumsi_seharusnya`
- `timestamp_konsumsi_aktual`
- `aksi`

**Fix:** Tambah logs atau update logs existing dengan field tersebut

---

### Issue 4: Qualcomm AI Error
```
❌ Qualcomm AI Error: Network error
```
**Cek:**
1. API Key valid? (cek `.env`)
2. Internet connection?
3. Qualcomm API Hub online?

**Fallback:** Sistem otomatis gunakan rule-based classification

---

## 📚 Dokumentasi Lengkap

Baca dokumentasi detail di: `QUALCOMM_AI_INTEGRATION.md`

Topics covered:
- ✅ Arsitektur sistem lengkap
- ✅ Collection schemas
- ✅ Semua API endpoints dengan examples
- ✅ Fallback mechanism
- ✅ Advanced troubleshooting
- ✅ Cron schedule customization

---

## ✅ Checklist Setup

- [ ] Dependencies installed (`npm install`)
- [ ] MongoDB Atlas cluster active
- [ ] Server running (`npm run dev`)
- [ ] Qualcomm AI test passed
- [ ] Batch process completed
- [ ] Scheduler running (monitor logs)
- [ ] Dashboard showing compliance data

---

## 🎉 Done!

Jika semua checklist ✅, sistem Qualcomm AI Compliance Integration sudah berjalan dengan sempurna!

**Monitoring Tips:**
- Biarkan server running minimal 10 menit untuk lihat scheduler action
- Cek MongoDB collection `kepatuhan` untuk verify data masuk
- Refresh Family Dashboard setiap ada logs baru

---

**Need Help?**
Lihat troubleshooting di `QUALCOMM_AI_INTEGRATION.md` atau tanya admin!
