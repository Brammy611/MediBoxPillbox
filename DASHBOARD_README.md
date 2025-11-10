# Dashboard Utama - MediBox Control Center

Dokumentasi untuk implementasi Dashboard Utama (Patient Role) di aplikasi MediBox Control Center.

## 📋 Fitur Dashboard

Dashboard Utama menampilkan informasi lengkap untuk pasien (patient/lansia), meliputi:

### 1. **Panel Statistik**
- **Grafik Waktu Pengambilan Obat**: Menampilkan tren pengambilan obat dalam beberapa hari terakhir
- **Analisis Waktu Kritis**: Diagram lingkaran yang menunjukkan distribusi waktu minum obat (Pagi, Siang, Malam)
- **Status Kepatuhan**: Indikator apakah pasien patuh dalam minum obat
- **Peringatan Stok**: Notifikasi jika stok obat hampir habis

### 2. **Panel Aktivitas Real-Time**
- Tabel riwayat aktivitas minum obat dengan waktu, nama obat, status, dan deskripsi
- Total missed hari ini (jumlah obat yang terlewat)
- Deteksi anomali (misalnya guncangan pada MediBox)

### 3. **Panel Informasi Pasien (Lansia)**
- Nama, Umur, Jenis Kelamin
- Alamat
- Riwayat Alergi
- Riwayat Penyakit

### 4. **Panel Informasi Keluarga**
- Nama Kontak Keluarga
- Email
- Hubungan dengan Lansia
- Alamat
- No. HP
- Jenis Kelamin

### 5. **Tabel Informasi Obat**
- No. Sekat pada MediBox
- Nama Obat
- Aturan Minum
- Deskripsi Obat
- Status Obat (Tersedia/Hampir Habis/Habis)

---

## 🚀 Cara Menjalankan

### Backend (Node.js + Express)

1. **Pastikan MongoDB sudah running** (atau gunakan MongoDB Atlas)

2. **Navigasi ke folder server:**
   ```bash
   cd server
   ```

3. **Install dependencies (jika belum):**
   ```bash
   npm install
   ```

4. **Jalankan server:**
   ```bash
   npm run dev
   ```
   Server akan berjalan di `http://localhost:5000`

5. **Test API Endpoint:**
   Buka browser atau Postman dan akses:
   ```
   GET http://localhost:5000/api/dashboard/patient/123
   ```

### Frontend (React.js)

1. **Navigasi ke folder client:**
   ```bash
   cd client
   ```

2. **Install dependencies (jika belum):**
   ```bash
   npm install
   ```

3. **Install Recharts untuk grafik:**
   ```bash
   npm install recharts axios
   ```

4. **Jalankan aplikasi React:**
   ```bash
   npm start
   ```
   Aplikasi akan berjalan di `http://localhost:3001` (atau port lain jika 3000 sudah digunakan)

5. **Akses Dashboard:**
   - Buka browser dan navigasi ke `http://localhost:3001`
   - Klik menu **"Dashboard Utama"** di sidebar

---

## 📁 Struktur File

### Backend
```
server/
├── routes/
│   └── api/
│       └── dashboard.js          # API endpoint untuk dashboard
└── index.js                       # Register route dashboard
```

### Frontend
```
client/
├── src/
│   ├── pages/
│   │   └── DashboardUtama.tsx    # Halaman utama dashboard
│   ├── components/
│   │   └── dashboard/
│   │       ├── PanelStatistik.tsx      # Panel grafik & statistik
│   │       ├── PanelAktivitas.tsx      # Panel riwayat aktivitas
│   │       ├── PanelInfoPasien.tsx     # Panel info lansia
│   │       ├── PanelInfoKeluarga.tsx   # Panel info keluarga
│   │       └── TabelObat.tsx           # Tabel informasi obat
│   └── App.tsx                    # Update routing
```

---

## 🔌 API Endpoint

### GET `/api/dashboard/patient/:patientId`

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "informasiPasien": {
      "nama": "Supono",
      "umur": 70,
      "jenisKelamin": "Laki-laki",
      "alamatLansia": "Jln. Bougenville No. 5A, Semarang",
      "riwayatAlergi": "Kacang, Udang",
      "riwayatPenyakit": "Prostat"
    },
    "informasiKeluarga": {
      "nama": "Bram",
      "email": "FamilyAkun@gmail.com",
      "hubunganDenganLansia": "Anak",
      "alamat": "Jln. Murasawan I No 5A, Semarang",
      "noHp": "081585183071",
      "jenisKelamin": "Laki-laki"
    },
    "statistik": {
      "waktuPengambilanObat": [...],
      "analisisWaktuKritis": [...],
      "statusKepatuhan": {...},
      "peringatanStok": "..."
    },
    "aktivitas": {
      "riwayatRealTime": [...],
      "totalMissedHariIni": 1,
      "deteksiAnomali": {...}
    },
    "informasiObat": [...]
  }
}
```

---

## 🎨 Teknologi & Library

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Web framework
- **MongoDB** - Database (opsional, saat ini menggunakan mock data)

### Frontend
- **React.js** (v19+) - UI framework
- **TypeScript** - Type safety
- **Axios** - HTTP client untuk API calls
- **Recharts** - Library untuk grafik (Line Chart & Pie Chart)
- **Tailwind CSS** - Styling
- **React Router** - Routing

---

## 🔧 Kustomisasi

### Mengganti Patient ID
Di file `DashboardUtama.tsx`, ubah patient ID dari hardcoded:
```typescript
const response = await axios.get(`http://localhost:5000/api/dashboard/patient/123`);
```

Menjadi dynamic (dari authentication/context):
```typescript
const { patientId } = useAuth(); // Ambil dari context
const response = await axios.get(`http://localhost:5000/api/dashboard/patient/${patientId}`);
```

### Menghubungkan dengan Database Real
Di file `server/routes/api/dashboard.js`, ganti mock data dengan query ke database:
```javascript
const patient = await Patient.findById(patientId).populate('linked_family');
const medications = await Medicine.find({ patient: patientId });
// dst...
```

### Customisasi Warna Grafik
Di `PanelStatistik.tsx`, ubah objek `COLORS`:
```typescript
const COLORS = {
  Pagi: "#FFA500",    // Orange
  Siang: "#FFD700",   // Gold
  Malam: "#4169E1",   // Royal Blue
};
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'recharts'"
```bash
cd client
npm install recharts
```

### Error: "Network Error" / API tidak bisa diakses
- Pastikan backend server sudah running di `http://localhost:5000`
- Check CORS settings di `server/index.js`
- Periksa firewall/antivirus

### Error: "Module not found: Error: Can't resolve 'axios'"
```bash
cd client
npm install axios
```

---

## 📝 Catatan

- **Mock Data**: Saat ini API menggunakan data dummy. Untuk production, hubungkan dengan database MongoDB dan model Mongoose yang sesuai.
- **Authentication**: Implementasi login/authentication belum termasuk dalam scope ini. Tambahkan middleware auth untuk production.
- **Real-time Updates**: Untuk update real-time, pertimbangkan menggunakan WebSocket (Socket.io) atau polling dengan `setInterval`.

---

## 📞 Kontak & Support

Jika ada pertanyaan atau issue, silakan hubungi tim developer atau buat issue di repository.

**Happy Coding! 🚀**
