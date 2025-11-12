# ⚡ QUICK REFERENCE - Real-time Inference

## 🎯 Konsep Utama

**Model Qualcomm AI melakukan inferensi OTOMATIS setiap kali ada data baru masuk ke collection `logs`**

---

## 🚀 Start Server

```powershell
cd C:\Arib\MediBoxPillbox\MediBoxPillbox\server
npm run dev
```

**Expected Output:**
```
📡 Starting Real-time Compliance Monitor...
🔍 [Compliance Monitor] Starting real-time monitoring...
✅ [Compliance Monitor] Real-time monitoring active!
```

✅ Monitor siap! Sekarang setiap data baru akan diproses otomatis.

---

## 📊 Testing Real-time Inference

### Cara 1: Insert via MongoDB Compass/Shell

```javascript
// Collection: logs
db.logs.insertOne({
  patient: ObjectId("673e11d20d2e1d2d5e9c4567"),
  waktu_konsumsi_seharusnya: new Date("2025-11-13T08:00:00Z"),
  timestamp_konsumsi_aktual: new Date("2025-11-13T08:15:00Z"),
  aksi: "Terima",
  timestamp: new Date()
})
```

**Server akan LANGSUNG output:**
```
🆕 [NEW LOG DETECTED]
   🤖 Sending to Qualcomm AI for inference...
   ✅ Inference completed in 345 ms
   📊 Result: Patuh
   💾 Saved to kepatuhan collection
```

⚡ **Total time: < 1 detik**

---

### Cara 2: Via Device/API

Jika device/application insert log via API, monitor otomatis detect dan proses.

---

## 🔍 Check Status

```powershell
Invoke-RestMethod http://localhost:5000/api/compliance/monitor/status
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

## 📋 Data Requirements

Log HARUS memiliki 3 field ini untuk diproses:

```javascript
{
  waktu_konsumsi_seharusnya: Date,  // ✅ REQUIRED
  timestamp_konsumsi_aktual: Date,  // ✅ REQUIRED
  aksi: String,                     // ✅ REQUIRED ("Terima" or "Tolak")
  patient: ObjectId                 // ✅ REQUIRED
}
```

---

## 🔄 System Components

### 1. Real-time Monitor (Primary)
- ✅ Deteksi data baru < 100ms
- ✅ Inferensi Qualcomm AI 300-500ms
- ✅ Total: < 1 detik

### 2. Scheduler (Backup)
- ✅ Runs setiap 5 menit
- ✅ Proses logs yang terlewat
- ✅ Safety net

**Both running simultaneously!**

---

## 📊 Workflow

```
Data baru masuk → Change Stream detect → Qualcomm AI inference → Save kepatuhan
     (0ms)              (< 100ms)              (300-500ms)          (50ms)
                                    
                        TOTAL: < 1 SECOND ⚡
```

---

## 🐛 Quick Troubleshooting

### Monitor tidak running?
```powershell
# Restart server
npm run dev
```

### Data tidak diproses?
- Cek log memiliki 3 field wajib
- Cek monitor status: `GET /api/compliance/monitor/status`
- Lihat server console untuk errors

### Change Streams error?
- MongoDB Atlas: Works ✅
- Local MongoDB: Need replica set setup

---

## ✅ Verification Steps

1. **Start server** → See "Real-time monitoring active"
2. **Insert log** → See "NEW LOG DETECTED" 
3. **Check result** → Query `kepatuhan` collection
4. **Dashboard** → Stats updated instantly

---

## 🎉 Benefits vs Traditional Scheduler

| Feature | Scheduler | Real-time |
|---------|-----------|-----------|
| Detection | Every 5 min | Instant |
| Delay | Up to 5 min | < 1 sec |
| Speed | Slow | 300x faster |
| Dashboard | Updates every 5 min | Updates instantly |

---

## 📞 Need Help?

Read full docs: `REALTIME_COMPLIANCE_MONITORING.md`

---

**TLDR: Data masuk → AI langsung proses → < 1 detik selesai ⚡**
