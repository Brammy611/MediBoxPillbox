# 🔧 Troubleshooting Guide - MediBox Server

## ❌ Masalah yang Terjadi

### 1. MongoDB Connection Timeout
```
MongooseError: Operation `users.findOne()` buffering timed out after 10000ms
getaddrinfo ENOTFOUND cluster0-shard-00-01.zgafu.mongodb.net
```

### 2. Gemini API Key Error
```
Error: Gemini API key not configured.
```

---

## ✅ SOLUSI

### 📌 LANGKAH 1: CEK ENVIRONMENT VARIABLES

Jalankan perintah berikut untuk memastikan semua variabel environment terbaca:

```powershell
cd C:\Arib\MediBoxPillbox\MediBoxPillbox\server
node check-env.js
```

**Expected Output:**
- ✅ MONGO_URI harus terisi
- ✅ GEMINI_API_KEY harus terisi
- ✅ .env file exists

Jika ada yang ❌, berarti file `.env` tidak terbaca dengan benar.

---

### 📌 LANGKAH 2: FIX MONGODB CONNECTION

MongoDB Atlas cluster kemungkinan **PAUSED** atau IP address tidak masuk whitelist.

#### 2.1 - Cek Status Cluster di MongoDB Atlas

1. Login ke **MongoDB Atlas**: https://cloud.mongodb.com/
2. Pilih cluster Anda: **Cluster0**
3. Cek apakah ada tombol **"Resume"** - jika ada, klik untuk mengaktifkan cluster
4. Tunggu 2-3 menit sampai cluster aktif (status berubah menjadi hijau)

#### 2.2 - Whitelist IP Address

1. Di MongoDB Atlas, klik menu **"Network Access"** (sidebar kiri)
2. Klik **"Add IP Address"**
3. Pilih **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Klik **"Confirm"**

⚠️ **CATATAN**: Untuk production, gunakan IP spesifik, bukan 0.0.0.0/0

#### 2.3 - Test Koneksi MongoDB

```powershell
cd C:\Arib\MediBoxPillbox\MediBoxPillbox\server
node test-mongo-connection.js
```

**Expected Output:**
```
✅ Connected successfully in XXXms
📊 Connection Details:
   - State: Connected
   - Database: MediBoxPillbox
   - Host: cluster0-shard-00-01.zgafu.mongodb.net
```

Jika masih error, kemungkinan:
- Cluster masih dalam proses startup (tunggu 2-3 menit)
- Password salah di connection string
- Internet bermasalah

---

### 📌 LANGKAH 3: FIX GEMINI API KEY

API Key sudah ada di `.env`, tetapi mungkin tidak terbaca karena:
1. File `.env` ada spasi di akhir baris
2. Server tidak restart setelah ubah `.env`
3. Path `.env` salah

#### 3.1 - Pastikan File .env Bersih

File `.env` sudah saya perbaiki (hapus spasi trailing). 

Isi file `.env` seharusnya:
```
MONGO_URI=mongodb+srv://bramantyo989:Beetle1110@cluster0.zgafu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGO_DB=MediBoxPillbox
PORT=5000
GEMINI_API_KEY=AIzaSyDSQhvZ8BIIEzUw7fMJo3SeReYkHn2zuEg
```

#### 3.2 - Test Gemini API Key

Lihat output saat server start, seharusnya muncul:
```
🔐 Environment Variables Loaded:
   - GEMINI_API_KEY: ✓ Set (AIzaSyDSQh...)
```

---

### 📌 LANGKAH 4: RESTART SERVER

**PENTING**: Setelah ubah `.env`, WAJIB restart server!

#### Stop Server (jika masih running)
- Tekan **Ctrl + C** di terminal server

#### Start Server Lagi
```powershell
cd C:\Arib\MediBoxPillbox\MediBoxPillbox\server
npm run dev
```

**Expected Output:**
```
🔐 Environment Variables Loaded:
   - MONGO_URI: ✓ Set
   - GEMINI_API_KEY: ✓ Set (AIzaSyDSQh...)

MongoDB Connected: Berhasil terhubung ke database MediBoxPillbox...
🚀 Server berjalan pada http://localhost:5000
```

---

## 🎯 QUICK FIX STEPS

Ikuti urutan ini:

1. **Cek .env terbaca**:
   ```powershell
   node check-env.js
   ```

2. **Aktifkan MongoDB Atlas Cluster**:
   - Login ke https://cloud.mongodb.com/
   - Resume cluster jika paused
   - Whitelist IP: 0.0.0.0/0

3. **Test MongoDB**:
   ```powershell
   node test-mongo-connection.js
   ```

4. **Restart Server**:
   ```powershell
   npm run dev
   ```

5. **Test Gemini API** dari frontend:
   - Buka Family Dashboard
   - Klik "Ambil Saran AI"
   - Seharusnya dapat response dari AI

---

## 🆘 JIKA MASIH ERROR

### MongoDB Masih Timeout?
- Pastikan cluster sudah **RESUME** (tidak paused)
- Tunggu 3-5 menit setelah resume
- Cek koneksi internet Anda
- Coba ganti DNS ke Google DNS (8.8.8.8)

### Gemini API Masih Error?
- Cek apakah API key valid di: https://aistudio.google.com/app/apikey
- Pastikan API key tidak expired
- Cek quota Gemini API di Google Cloud Console

### Masih Crash?
Kirim screenshot dari:
1. Output `node check-env.js`
2. Output `node test-mongo-connection.js`
3. Output `npm run dev`

---

## 📞 Kontak

Jika masih ada masalah, hubungi admin atau buka issue di GitHub.
