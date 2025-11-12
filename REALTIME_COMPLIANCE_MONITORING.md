# 🚀 Real-time Compliance Monitoring with Qualcomm AI

## 📡 Overview

Sistem **Real-time Compliance Monitoring** menggunakan **MongoDB Change Streams** untuk mendeteksi data baru di collection `logs` dan **langsung melakukan inferensi dengan Qualcomm AI model** tanpa delay.

---

## 🎯 Cara Kerja

### Traditional Approach (Scheduler) ⏰
```
Data masuk → Tunggu 5 menit → Scheduler cek → Proses → Simpan
❌ Delay up to 5 minutes
```

### Real-time Approach (Change Stream) ⚡
```
Data masuk → Deteksi langsung → Proses instant → Simpan
✅ Delay < 1 second
```

---

## 🏗️ Architecture

```
┌─────────────────────────┐
│  Log Collection (MongoDB)│
│   - New document inserted│
└───────────┬───────────────┘
            │
            ▼ (Change Stream Event)
┌─────────────────────────┐
│  Compliance Monitor     │
│  (complianceMonitor.js) │
│  - Detect new log       │
│  - Extract data         │
└───────────┬───────────────┘
            │
            ▼
┌─────────────────────────┐
│  Qualcomm AI Service    │
│  - Run inference        │
│  - Get classification   │
└───────────┬───────────────┘
            │
            ▼
┌─────────────────────────┐
│  Kepatuhan Collection   │
│  - Save result          │
│  - Timestamp created    │
└─────────────────────────┘
```

---

## 🔧 Implementation

### 1. Change Stream Monitoring

File: `server/services/complianceMonitor.js`

```javascript
// Monitor collection logs untuk INSERT operations
this.changeStream = Log.watch([
  { 
    $match: { 
      operationType: 'insert',
      'fullDocument.waktu_konsumsi_seharusnya': { $exists: true },
      'fullDocument.timestamp_konsumsi_aktual': { $exists: true },
      'fullDocument.aksi': { $exists: true }
    } 
  }
]);

// Handler untuk setiap data baru
this.changeStream.on('change', async (change) => {
  const newLog = change.fullDocument;
  
  // Langsung kirim ke Qualcomm AI
  const aiResult = await qualcommAIService.classifyCompliance({
    waktu_konsumsi_seharusnya: newLog.waktu_konsumsi_seharusnya,
    timestamp_konsumsi_aktual: newLog.timestamp_konsumsi_aktual,
    aksi: newLog.aksi
  });
  
  // Simpan hasil
  await Kepatuhan.create({ ...aiResult, log_id: newLog._id });
});
```

---

## 📊 Data Flow Example

### Scenario: Device memasukkan log baru

**Step 1: Data masuk ke MongoDB**
```javascript
// POST /api/logs (dari device/manual entry)
{
  patient: "673e11d20d2e1d2d5e9c4567",
  waktu_konsumsi_seharusnya: "2025-11-13T08:00:00Z",
  timestamp_konsumsi_aktual: "2025-11-13T08:15:00Z",
  aksi: "Terima"
}
```

**Step 2: Change Stream deteksi (< 100ms)**
```
🆕 [NEW LOG DETECTED]
   Log ID: 674a5b3c1f8e2a4b6c7d8e9f
   Aksi: Terima
   Waktu Seharusnya: 13/11/2025 08:00:00
   Waktu Aktual: 13/11/2025 08:15:00
```

**Step 3: Qualcomm AI Inference (300-500ms)**
```
   🤖 Sending to Qualcomm AI for inference...
   ✅ Inference completed in 345 ms
   📊 Result: Patuh
   🎯 Confidence: 95.0%
   🔧 Method: qualcomm-ai
```

**Step 4: Save to Kepatuhan Collection (50ms)**
```
   💾 Saved to kepatuhan collection
   Total time: < 500ms dari data masuk
```

---

## 🚀 Usage

### Server akan otomatis start monitoring saat berjalan

```powershell
npm run dev
```

**Console Output:**
```
MongoDB Connected: Berhasil terhubung...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Initializing Qualcomm AI Compliance System...

📡 Starting Real-time Compliance Monitor...
🔍 [Compliance Monitor] Starting real-time monitoring...
📡 Listening for new logs with compliance data...
✅ [Compliance Monitor] Real-time monitoring active!

🕐 Starting Compliance Scheduler (backup)...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🧪 Testing Real-time Inference

### Test 1: Insert Log Manually via MongoDB

```javascript
// MongoDB Shell or Compass
db.logs.insertOne({
  patient: ObjectId("673e11d20d2e1d2d5e9c4567"),
  waktu_konsumsi_seharusnya: new Date("2025-11-13T08:00:00Z"),
  timestamp_konsumsi_aktual: new Date("2025-11-13T08:15:00Z"),
  aksi: "Terima",
  timestamp: new Date()
})
```

**Expected Console Output (Server):**
```
🆕 [NEW LOG DETECTED]
   Log ID: 674a5b3c1f8e2a4b6c7d8e9f
   Patient: 673e11d20d2e1d2d5e9c4567
   Aksi: Terima
   Waktu Seharusnya: 13/11/2025, 08:00:00
   Waktu Aktual: 13/11/2025, 08:15:00
   🤖 Sending to Qualcomm AI for inference...
   ✅ Inference completed in 345 ms
   📊 Result: Patuh
   🎯 Confidence: 95.0%
   🔧 Method: qualcomm-ai
   💾 Saved to kepatuhan collection
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Test 2: Via API Endpoint

```powershell
# Login untuk token
$response = Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/auth/login" -ContentType "application/json" -Body '{"email":"family@example.com","password":"password123"}'
$token = $response.token

# Insert log via API (jika ada endpoint)
# Atau simulasi dengan MongoDB insert
```

---

### Test 3: Check Monitor Status

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/compliance/monitor/status"
```

**Response:**
```json
{
  "success": true,
  "monitor": {
    "isMonitoring": true,
    "uptime": "Active"
  },
  "message": "Real-time monitoring active - AI inference on new data"
}
```

---

## 📡 API Endpoints

### Get Monitor Status
```http
GET /api/compliance/monitor/status
```

**Response:**
```json
{
  "success": true,
  "monitor": {
    "isMonitoring": true,
    "uptime": "Active"
  },
  "message": "Real-time monitoring active - AI inference on new data"
}
```

---

### Toggle Monitor (Start/Stop)
```http
POST /api/compliance/monitor/toggle
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "stop"  // or "start"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Real-time monitor stopped"
}
```

---

## 🔄 Dual System: Real-time + Scheduler

Sistem menggunakan **2 mekanisme bersamaan**:

### 1. Real-time Monitor (Primary)
- ✅ Instant processing (< 1 second)
- ✅ Deteksi langsung saat data masuk
- ✅ Menggunakan MongoDB Change Streams

### 2. Scheduler (Backup)
- ✅ Runs every 5 minutes
- ✅ Catch missed logs (jika monitor error)
- ✅ Process logs yang terlewat

**Benefit:**
- Real-time untuk performa
- Scheduler sebagai safety net
- Tidak ada data yang terlewat

---

## 🛡️ Error Handling

### Auto-restart on Error
```javascript
this.changeStream.on('error', (error) => {
  console.error('❌ Change Stream Error:', error.message);
  
  // Auto-restart after 5 seconds
  setTimeout(() => {
    this.startMonitoring();
  }, 5000);
});
```

### Fallback Mechanism
Jika Qualcomm AI error, gunakan rule-based classification:
```javascript
// Aksi "Tolak" → Tidak Patuh
// Delay > 30 min → Tidak Patuh
// Delay ≤ 30 min → Patuh
```

---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| Detection Time | < 100ms |
| Qualcomm AI Inference | 300-500ms |
| DB Save | 50ms |
| **Total Time** | **< 1 second** |

**vs Traditional Scheduler:**
- Scheduler delay: up to 5 minutes
- Real-time: < 1 second
- **Speed improvement: 300x faster**

---

## 🔍 Monitoring & Logging

### Log Output Format

```
🆕 [NEW LOG DETECTED]
   Log ID: 674a5b3c1f8e2a4b6c7d8e9f
   Patient: 673e11d20d2e1d2d5e9c4567
   Aksi: Terima
   Waktu Seharusnya: 13/11/2025, 08:00:00
   Waktu Aktual: 13/11/2025, 08:15:00
   🤖 Sending to Qualcomm AI for inference...
   ✅ Inference completed in 345 ms
   📊 Result: Patuh
   🎯 Confidence: 95.0%
   🔧 Method: qualcomm-ai
   💾 Saved to kepatuhan collection
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Alert for High-confidence Non-compliance

```
   ⚠️  HIGH CONFIDENCE NON-COMPLIANCE DETECTED!
   💡 Consider sending alert to caregiver
```

---

## 🐛 Troubleshooting

### Monitor Not Starting?

**Check:**
1. MongoDB connection active?
2. Change Streams enabled? (MongoDB 3.6+, Replica Set required)
3. Server console for errors?

**Fix:**
```powershell
# Restart server
Ctrl+C
npm run dev
```

---

### No Detection on New Data?

**Check:**
1. Log has required fields?
   - `waktu_konsumsi_seharusnya`
   - `timestamp_konsumsi_aktual`
   - `aksi`
2. Monitor status: `GET /api/compliance/monitor/status`

**Fix:**
```javascript
// Ensure log structure
{
  patient: ObjectId("..."),
  waktu_konsumsi_seharusnya: Date,  // REQUIRED
  timestamp_konsumsi_aktual: Date,  // REQUIRED
  aksi: "Terima" or "Tolak",       // REQUIRED
  // ... other fields
}
```

---

### Change Streams Not Supported?

**Error:**
```
Change streams are only supported on replica sets
```

**Fix:**
- MongoDB Atlas: Already uses replica sets ✅
- Local MongoDB: Convert to replica set or use scheduler only

---

## 🎯 Benefits

### 1. **Instant Inference** ⚡
- Qualcomm AI runs immediately when data arrives
- No waiting for scheduler

### 2. **Real-time Dashboard** 📊
- Compliance stats update instantly
- Family can see latest status

### 3. **Scalable** 📈
- Handles high-volume data ingestion
- Each log processed independently

### 4. **Reliable** 🛡️
- Auto-restart on errors
- Scheduler as backup

### 5. **Observable** 🔍
- Detailed logging for each inference
- Easy to debug and monitor

---

## 📚 File Structure

```
server/
├── services/
│   ├── complianceMonitor.js      # Real-time monitor (NEW)
│   └── qualcommAIService.js      # Qualcomm AI inference
├── schedulers/
│   └── complianceScheduler.js    # Backup scheduler
├── controllers/
│   └── complianceController.js   # API endpoints (updated)
└── index.js                      # Start monitor on boot (updated)
```

---

## 🚀 Production Checklist

- [x] Real-time monitor implemented
- [x] Change Stream error handling
- [x] Auto-restart mechanism
- [x] Backup scheduler running
- [x] API endpoints for status
- [x] Detailed logging
- [ ] WebSocket integration (future)
- [ ] Alert notifications (future)
- [ ] Performance monitoring dashboard (future)

---

## 📞 Support

Jika ada pertanyaan atau issue:
1. Check server logs untuk error details
2. Verify MongoDB Change Streams supported
3. Test monitor status endpoint
4. Restart server jika perlu

---

**Last Updated:** November 13, 2025
**Version:** 2.0.0 (Real-time)
