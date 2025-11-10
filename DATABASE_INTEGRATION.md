# 📊 Database Integration Guide - Dashboard Utama

## Overview
Panduan ini menjelaskan cara mengintegrasikan Dashboard Utama dengan MongoDB untuk mengambil data real dari database, bukan mock data.

---

## 🗄️ Perubahan yang Sudah Dilakukan

### 1. Update Models
✅ **Patient Model** (`server/models/patient.js`)
- Menambahkan field `name`, `address`, `medicalHistory` (allergies & conditions)
- Support untuk `caregiver` reference

✅ **Medicine Model** (`server/models/medicine.js`)
- Menambahkan field `compartmentNumber`, `description`, `stock`, `status`
- Compatible dengan dashboard requirements

✅ **Log Model** (`server/models/log.js`)
- Menambahkan field `action`, `status`, `description`
- Support untuk tracking aktivitas minum obat

### 2. Update API Dashboard
✅ **`server/routes/api/dashboard.js`**
- Mengambil data dari MongoDB (Patient, User, Medicine, Log)
- Aggregation untuk statistik dan analisis
- Real-time data processing

### 3. Seeder Script
✅ **`server/seeders/dashboardSeeder.js`**
- Script untuk insert dummy data ke MongoDB
- Creates: 1 Caregiver, 1 Patient, 3 Medicines, Multiple Logs

---

## 🚀 Cara Menjalankan

### Step 1: Pastikan MongoDB Connection
Cek file `.env` Anda:
```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxx.mongodb.net/?retryWrites=true&w=majority
MONGO_DB=MediBoxPillbox
PORT=5000
```

Test koneksi:
```bash
cd server
npm run dev
```

Lihat di terminal, harus muncul: `MongoDB Connected: Berhasil terhubung...`

---

### Step 2: Jalankan Seeder untuk Insert Data Dummy

```bash
cd server
node seeders/dashboardSeeder.js
```

**Output yang diharapkan:**
```
🌱 Mulai seeding data dashboard...
✅ User (Caregiver) created: Bram
✅ Patient created: Supono
✅ Medicines created: 3
✅ Logs created: 3
✅ Statistic logs created: XX

✨ Seeding completed successfully!

📊 Data Summary:
   - Caregiver: FamilyAkun@gmail.com
   - Patient: Supono (ID: 673xxxxxxxxxxxxx)
   - Medicines: 3
   - Logs: XX

🔗 Untuk mengakses dashboard, gunakan:
   GET /api/dashboard/patient/673xxxxxxxxxxxxx
```

**PENTING**: Salin Patient ID yang muncul!

---

### Step 3: Update Frontend dengan Patient ID Real

Edit file: `client/src/pages/DashboardUtama.tsx`

Ganti baris ini:
```typescript
const response = await axios.get(`http://localhost:5000/api/dashboard/patient/123`);
```

Dengan Patient ID yang didapat dari seeder:
```typescript
const response = await axios.get(`http://localhost:5000/api/dashboard/patient/673xxxxxxxxxxxxx`);
```

---

### Step 4: Test API Endpoint

**Option A: Browser**
Buka browser dan akses:
```
http://localhost:5000/api/dashboard/patient/[YOUR_PATIENT_ID]
```

**Option B: PowerShell**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/patient/[YOUR_PATIENT_ID]" | ConvertTo-Json
```

**Option C: Postman/Insomnia**
- Method: GET
- URL: `http://localhost:5000/api/dashboard/patient/[YOUR_PATIENT_ID]`

---

### Step 5: Run Frontend
```bash
cd client
npm start
```

Buka `http://localhost:3001/dashboard-utama`

Dashboard sekarang akan menampilkan **DATA REAL DARI MONGODB**! 🎉

---

## 📊 Struktur Data di MongoDB

### Collections Created:

1. **users** (Caregiver/Keluarga)
   ```json
   {
     "_id": "ObjectId",
     "name": "Bram",
     "email": "FamilyAkun@gmail.com",
     "phone": "081585183071",
     "role": "caregiver",
     "linked_patients": ["patient_id"]
   }
   ```

2. **patients** (Lansia)
   ```json
   {
     "_id": "ObjectId",
     "name": "Supono",
     "age": 70,
     "gender": "Laki-laki",
     "address": "Jln. Bougenville No. 5A, Semarang",
     "medicalHistory": {
       "allergies": ["Kacang", "Udang"],
       "conditions": ["Prostat"]
     },
     "caregiver": "user_id",
     "deviceId": "MEDIBOX-001"
   }
   ```

3. **medicines** (Obat)
   ```json
   {
     "_id": "ObjectId",
     "name": "Amoxcillin",
     "compartmentNumber": 1,
     "dosage": "2 kali Sehari",
     "description": "Setelah Makan",
     "stock": 20,
     "status": "Tersedia",
     "patient": "patient_id"
   }
   ```

4. **logs** (Aktivitas)
   ```json
   {
     "_id": "ObjectId",
     "patient": "patient_id",
     "medicine": "medicine_id",
     "timestamp": "2025-11-11T20:05:00.000Z",
     "action": "taken",
     "status": "on_time",
     "description": "Tepat Waktu",
     "deviceId": "MEDIBOX-001"
   }
   ```

---

## 🔄 Re-Seeding (Menghapus dan Insert Ulang)

Jika ingin reset data dan insert ulang:

### Option 1: Hapus Manual via MongoDB Compass
1. Buka MongoDB Compass
2. Connect ke database Anda
3. Hapus semua documents di collections: `users`, `patients`, `medicines`, `logs`
4. Jalankan seeder lagi

### Option 2: Via Mongoose (Tambahkan ke seeder)
Edit `dashboardSeeder.js`, tambahkan di awal fungsi `seedDashboardData()`:
```javascript
// Clear existing data
await User.deleteMany({});
await Patient.deleteMany({});
await Medicine.deleteMany({});
await Log.deleteMany({});
console.log('🗑️  Existing data cleared');
```

Kemudian jalankan lagi:
```bash
node seeders/dashboardSeeder.js
```

---

## 🎯 Fitur Database Integration

### Yang Sudah Berfungsi:
✅ Informasi Pasien (dari collection `patients`)
✅ Informasi Keluarga (dari collection `users`)
✅ Grafik Waktu Pengambilan Obat (aggregation dari `logs`)
✅ Analisis Waktu Kritis (Pagi/Siang/Malam dari `logs`)
✅ Status Kepatuhan (calculated dari missed logs)
✅ Peringatan Stok (dari field `status` di `medicines`)
✅ Riwayat Aktivitas Real-Time (dari `logs` hari ini)
✅ Total Missed Hari Ini (count dari `logs`)
✅ Tabel Informasi Obat (dari collection `medicines`)

### Advanced Queries Used:
- **Population**: Patient → Caregiver, Log → Medicine
- **Aggregation**: Grouping logs by date dan time periods
- **Filtering**: Date range queries (today, last 6 days)
- **Sorting**: Logs by timestamp descending

---

## 🔧 Troubleshooting

### ❌ Error: "Patient tidak ditemukan"
**Solusi:**
- Pastikan seeder sudah dijalankan
- Check Patient ID yang digunakan sudah benar
- Verify di MongoDB Compass bahwa data ada

### ❌ Error: "Cannot read property 'name' of null"
**Solusi:**
- Ada relasi yang tidak ter-populate dengan benar
- Check bahwa caregiver ada untuk patient tersebut
- Jalankan ulang seeder untuk ensure data integrity

### ❌ Data statistik kosong
**Solusi:**
- Logs belum ada atau timestamp-nya tidak sesuai
- Run seeder lagi, pastikan statisticLogs created
- Check date range di API query

### ❌ MongoDB Connection Timeout
**Solusi:**
1. Cek internet connection
2. Whitelist IP address Anda di MongoDB Atlas:
   - Login ke MongoDB Atlas
   - Network Access → Add IP Address
   - Allow access from anywhere (0.0.0.0/0) untuk development
3. Check MONGO_URI di `.env` sudah benar

---

## 📈 Next Steps

### Untuk Production:
1. **Add More Seeder Data**
   - Multiple patients
   - Multiple caregivers
   - Historical logs (1 month+)

2. **API Enhancements**
   - Date range filters
   - Pagination untuk logs
   - Search & filtering

3. **Real Device Integration**
   - Connect dengan MediBox hardware
   - Real-time log creation dari device
   - WebSocket untuk live updates

4. **Security**
   - Add authentication middleware
   - Validate patientId belongs to logged-in user
   - Rate limiting

---

## 📝 Summary

**Sekarang Anda memiliki:**
✅ Database models yang updated
✅ Seeder script untuk dummy data
✅ API yang mengambil dari MongoDB
✅ Dashboard yang menampilkan data real

**Untuk menggunakan:**
1. Run seeder → Get Patient ID
2. Update frontend dengan Patient ID
3. Start backend & frontend
4. Dashboard shows real database data!

🎉 **Database integration complete!**
