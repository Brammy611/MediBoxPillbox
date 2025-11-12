# 🚀 Deployment Guide - MediBoxPillbox ke Vercel

## 📋 Prerequisites

1. Akun GitHub (https://github.com)
2. Akun Vercel (https://vercel.com) - bisa login dengan GitHub
3. MongoDB Atlas (https://www.mongodb.com/cloud/atlas) untuk database cloud

---

## 🗄️ Step 1: Setup MongoDB Atlas (Database Cloud)

### 1.1 Buat Cluster MongoDB
1. Login ke MongoDB Atlas: https://www.mongodb.com/cloud/atlas
2. Klik **"Create a Cluster"** (pilih FREE tier)
3. Pilih region terdekat (Singapore untuk Indonesia)
4. Tunggu cluster selesai dibuat (~5 menit)

### 1.2 Setup Database Access
1. Klik **"Database Access"** di sidebar
2. Klik **"Add New Database User"**
3. Buat username dan password (simpan dengan aman!)
4. Set **"Database User Privileges"** ke **"Read and write to any database"**
5. Klik **"Add User"**

### 1.3 Setup Network Access
1. Klik **"Network Access"** di sidebar
2. Klik **"Add IP Address"**
3. Klik **"Allow Access from Anywhere"** (untuk Vercel)
4. Klik **"Confirm"**

### 1.4 Dapatkan Connection String
1. Klik **"Database"** di sidebar
2. Klik **"Connect"** pada cluster Anda
3. Pilih **"Connect your application"**
4. Copy connection string (akan seperti ini):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Ganti `<username>` dan `<password>` dengan kredensial yang Anda buat
6. Ganti `?retryWrites` dengan `/MediBoxPillbox?retryWrites`
7. Simpan connection string ini!

---

## 📦 Step 2: Push Project ke GitHub

### 2.1 Inisialisasi Git (jika belum)
```bash
cd c:\Arib\MediBoxPillbox\MediBoxPillbox
git init
git add .
git commit -m "Initial commit - MediBoxPillbox"
```

### 2.2 Buat Repository di GitHub
1. Login ke GitHub: https://github.com
2. Klik tombol **"+"** di kanan atas → **"New repository"**
3. Nama repository: `MediBoxPillbox`
4. Set ke **Private** (recommended)
5. **JANGAN** centang "Initialize with README"
6. Klik **"Create repository"**

### 2.3 Push ke GitHub
```bash
git remote add origin https://github.com/Brammy611/MediBoxPillbox.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 3: Deploy Backend ke Vercel

### 3.1 Import Project
1. Login ke Vercel: https://vercel.com
2. Klik **"Add New..."** → **"Project"**
3. Import repository **MediBoxPillbox** dari GitHub
4. **IMPORTANT:** Klik **"Configure Project"**

### 3.2 Configure Backend
```
Framework Preset: Other
Root Directory: server
Build Command: (kosongkan)
Output Directory: (kosongkan)
Install Command: npm install
```

### 3.3 Environment Variables
Tambahkan environment variables berikut:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Connection string dari MongoDB Atlas |
| `JWT_SECRET` | String random (min 32 karakter) |
| `NODE_ENV` | production |

**Contoh JWT_SECRET:** `medibox_jwt_secret_key_2024_very_secure_random_string_12345`

### 3.4 Deploy
1. Klik **"Deploy"**
2. Tunggu hingga selesai (~2-3 menit)
3. **Copy URL backend** (akan seperti: `https://medibox-backend.vercel.app`)

---

## 💻 Step 4: Deploy Frontend ke Vercel

### 4.1 Update Environment Variable
**PENTING:** Sebelum deploy frontend, update file `.env.production`:
```bash
cd client
```
Edit file `.env.production`:
```
REACT_APP_API_URL=https://medibox-backend.vercel.app/api
```
**Ganti** `medibox-backend` dengan URL backend Anda!

Commit perubahan:
```bash
git add .
git commit -m "Update production API URL"
git push
```

### 4.2 Import Project (Lagi)
1. Kembali ke Vercel dashboard
2. Klik **"Add New..."** → **"Project"**
3. Import repository **MediBoxPillbox** lagi (untuk frontend)

### 4.3 Configure Frontend
```
Framework Preset: Create React App
Root Directory: client
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

### 4.4 Environment Variables
Tambahkan environment variable:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | URL backend + /api (contoh: https://medibox-backend.vercel.app/api) |

### 4.5 Deploy
1. Klik **"Deploy"**
2. Tunggu hingga selesai (~3-5 menit)
3. **Copy URL frontend** (akan seperti: `https://medibox.vercel.app`)

---

## ✅ Step 5: Testing Deployment

### 5.1 Test Backend
Buka browser dan akses:
```
https://medibox-backend.vercel.app/
```
Harus tampil: "API MediBox Berjalan!"

Test database connection:
```
https://medibox-backend.vercel.app/api/health/db
```
Harus tampil JSON dengan `"connected": true`

### 5.2 Test Frontend
1. Buka URL frontend: `https://medibox.vercel.app`
2. Coba register user baru
3. Coba login
4. Test semua dashboard

---

## 🔧 Troubleshooting

### Backend Error: "Cannot connect to database"
**Solusi:**
1. Cek MongoDB Atlas Network Access (harus allow 0.0.0.0/0)
2. Cek MONGODB_URI di Vercel environment variables
3. Pastikan connection string benar (username, password, database name)

### Frontend Error: "API request failed"
**Solusi:**
1. Cek REACT_APP_API_URL sudah benar
2. Cek CORS di backend (sudah di-enable dengan `cors()`)
3. Test backend URL secara langsung

### Deployment Failed
**Solusi:**
1. Cek build logs di Vercel
2. Pastikan `package.json` lengkap
3. Pastikan tidak ada syntax error

---

## 🔄 Update Project (Setelah Ada Perubahan Code)

### Update Backend:
```bash
cd server
git add .
git commit -m "Update backend"
git push
```
Vercel akan auto-redeploy backend!

### Update Frontend:
```bash
cd client
git add .
git commit -m "Update frontend"
git push
```
Vercel akan auto-redeploy frontend!

---

## 📊 Monitoring

### Vercel Dashboard
- Monitor logs: https://vercel.com/dashboard
- Klik project → Deployments → View logs
- Monitor usage, errors, dan performance

### MongoDB Atlas Dashboard
- Monitor database: https://cloud.mongodb.com
- Klik Metrics untuk lihat database activity
- Klik Collections untuk lihat data

---

## 🎯 Custom Domain (Optional)

### Tambah Custom Domain:
1. Beli domain di Namecheap/GoDaddy
2. Di Vercel, klik project → Settings → Domains
3. Tambahkan domain Anda
4. Update DNS records sesuai instruksi Vercel

**Contoh:**
- Backend: `api.medibox.com`
- Frontend: `medibox.com`

---

## 🔐 Security Tips

1. ✅ Selalu gunakan HTTPS (otomatis di Vercel)
2. ✅ Jangan expose JWT_SECRET
3. ✅ MongoDB Atlas harus pakai strong password
4. ✅ Enable MongoDB IP whitelist (jika perlu)
5. ✅ Monitor logs untuk aktivitas mencurigakan

---

## 📞 Support

Jika ada masalah:
1. Check Vercel logs
2. Check MongoDB Atlas logs
3. Check browser console untuk frontend errors
4. Check Network tab di DevTools

---

## 🎉 Selesai!

Aplikasi MediBoxPillbox Anda sudah online dan bisa diakses dari mana saja! 🚀

**Frontend:** https://medibox.vercel.app
**Backend:** https://medibox-backend.vercel.app

Happy Deploying! 🎊
