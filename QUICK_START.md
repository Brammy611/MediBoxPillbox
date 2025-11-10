# 🎯 Quick Start Guide - Dashboard Utama

## Untuk Menjalankan Dashboard

### Step 1: Start Backend Server
```bash
# Buka terminal/command prompt pertama
cd server
npm run dev
```
✅ Backend akan running di `http://localhost:5000`

### Step 2: Start Frontend Application  
```bash
# Buka terminal/command prompt kedua
cd client
npm start
```
✅ Frontend akan running di `http://localhost:3001`

### Step 3: Akses Dashboard
1. Buka browser (Chrome/Firefox/Edge)
2. Navigasi ke: `http://localhost:3001`
3. Klik menu **"Dashboard Utama"** di sidebar kiri
4. Dashboard akan menampilkan data lengkap!

---

## 🖼️ Screenshot Panduan

### Menu di Sidebar:
```
┌─────────────────────────┐
│ 🏠 Tentang MediBox      │
│ 📊 Dashboard Utama  ← Klik ini!
│ 👨‍👩‍👧 Family Dashboard    │
│ 💊 Apotheker Dashboard  │
└─────────────────────────┘
```

### Layout Dashboard:
```
┌─────────────────────────────────────────────────┬─────────────────┐
│                                                 │ Info Lansia     │
│  📈 Grafik Waktu | 🥧 Analisis Waktu          │ - Nama          │
│     Pengambilan  |    Kritis                   │ - Umur          │
│                  |                              │ - Alamat        │
│                                                 │                 │
├─────────────────────────────────────────────────┤ Info Keluarga   │
│  📋 Riwayat Aktivitas Real-Time                │ - Nama          │
│  ┌─────┬──────────┬────────┬────────┐         │ - Email         │
│  │Waktu│Nama Obat │Status  │Deskripsi│         │ - Hubungan      │
│  ├─────┼──────────┼────────┼────────┤         │                 │
│  │20:05│Prostat   │✓Diminum│Tepat   │         │                 │
│  └─────┴──────────┴────────┴────────┘         │                 │
├─────────────────────────────────────────────────┴─────────────────┤
│  💊 Informasi Obat                                                │
│  ┌───┬──────────┬─────────────┬─────────────┬──────────┐       │
│  │No │Nama Obat │Aturan Minum │Deskripsi    │Status    │       │
│  ├───┼──────────┼─────────────┼─────────────┼──────────┤       │
│  │ 1 │Amoxcilin │2x Sehari    │Setelah Makan│Tersedia  │       │
│  └───┴──────────┴─────────────┴─────────────┴──────────┘       │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting Umum

### ❌ Problem: "Cannot GET /api/dashboard/patient/123"
**Solusi:**
- Pastikan backend server sudah running
- Check terminal backend, harus ada pesan: `Server berjalan pada http://localhost:5000`
- Restart backend: `npm run dev`

### ❌ Problem: "Network Error" di browser
**Solusi:**
1. Cek apakah backend running di port 5000
2. Test API manual: buka browser dan akses `http://localhost:5000/api/dashboard/patient/123`
3. Harus muncul JSON data

### ❌ Problem: Loading terus, data tidak muncul
**Solusi:**
1. Buka Developer Console (F12)
2. Lihat tab Console untuk error messages
3. Lihat tab Network untuk status request
4. Pastikan response status 200 OK

### ❌ Problem: Grafik tidak muncul
**Solusi:**
```bash
cd client
npm install recharts --save
# Restart frontend
npm start
```

---

## 📱 Fitur-Fitur Dashboard

### 1. Statistik Visual
- **Line Chart**: Menampilkan tren pengambilan obat harian
- **Pie Chart**: Distribusi waktu kritis (Pagi/Siang/Malam)
- **Status Badge**: Kepatuhan pasien
- **Alert**: Peringatan stok obat

### 2. Monitoring Real-time
- **Tabel Aktivitas**: Log setiap kali minum obat
- **Status Indicator**: ✓ (Diminum) atau ✗ (Tidak Diminum)
- **Total Missed**: Counter obat yang terlewat hari ini
- **Deteksi Anomali**: Alert jika ada masalah (guncangan, dll)

### 3. Informasi Lengkap
- **Panel Lansia**: Data lengkap pasien (nama, umur, alergi, penyakit)
- **Panel Keluarga**: Kontak keluarga yang bisa dihubungi
- **Tabel Obat**: Daftar semua obat dengan status ketersediaan

---

## 🎨 Customize Dashboard

### Mengganti Data Patient
Edit file: `client/src/pages/DashboardUtama.tsx`

Cari baris:
```typescript
const response = await axios.get(`http://localhost:5000/api/dashboard/patient/123`);
```

Ganti `123` dengan patient ID yang sesuai.

### Menambah Data Obat Baru
Edit file: `server/routes/api/dashboard.js`

Tambahkan obat baru di array `informasiObat`:
```javascript
{
  noSekat: 4,
  namaObat: "Vitamin C",
  aturanMinum: "1 kali Sehari",
  deskripsi: "Setelah Sarapan",
  statusObat: "Tersedia"
}
```

---

## 📞 Need Help?

Jika masih ada masalah:
1. Pastikan semua dependencies terinstall: `npm install`
2. Clear cache: `npm cache clean --force`
3. Restart both servers (backend & frontend)
4. Check documentation: `DASHBOARD_README.md`

**Happy Monitoring! 🏥💊**
