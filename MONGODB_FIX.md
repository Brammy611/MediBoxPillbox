# 🔧 MongoDB Connection Solutions

## ❌ Problem: `queryTxt ETIMEOUT cluster0.zgafu.mongodb.net`

Koneksi ke MongoDB Atlas gagal karena **DNS Resolution Error**.

---

## ✅ SOLUSI 1: MongoDB Local (Recommended untuk Development)

### Install MongoDB Community Edition

**Windows:**
1. Download: https://www.mongodb.com/try/download/community
2. Install dengan default settings
3. MongoDB akan berjalan sebagai Windows Service

**Verify Installation:**
```powershell
mongod --version
```

### Update .env File:
```env
# Comment out MongoDB Atlas
# MONGO_URI=mongodb+srv://bramantyo989:Beetle1110@cluster0.zgafu.mongodb.net/MediBoxPillbox?retryWrites=true&w=majority&appName=Cluster0

# Use Local MongoDB
MONGO_URI=mongodb://localhost:27017/MediBoxPillbox
MONGO_DB=MediBoxPillbox
PORT=5000
```

### Test Connection:
```bash
cd server
node testConnection.js
```

### Run Seeder:
```bash
node seeders/dashboardSeeder.js
```

**✅ Keuntungan:**
- No internet required
- Faster development
- No IP whitelist issues
- Full control

---

## ✅ SOLUSI 2: Fix DNS (Untuk Tetap Menggunakan Atlas)

### Windows - Change DNS to Google DNS:

1. **Open Network Settings:**
   - Control Panel → Network and Sharing Center
   - Click your connection → Properties
   - Select "Internet Protocol Version 4 (TCP/IPv4)"
   - Click Properties

2. **Set DNS:**
   ```
   Preferred DNS server: 8.8.8.8
   Alternate DNS server: 8.8.4.4
   ```

3. **Flush DNS:**
   ```powershell
   ipconfig /flushdns
   ```

4. **Test Again:**
   ```bash
   node diagnosticTest.js
   ```

---

## ✅ SOLUSI 3: MongoDB Atlas - Whitelist IP

Jika DNS sudah fix, tapi masih error:

1. Go to: https://cloud.mongodb.com
2. Login dengan akun Anda
3. Select Project: Cluster0
4. Left Sidebar: Click "Network Access"
5. Click "Add IP Address"
6. Select "Allow Access from Anywhere"
   - IP: `0.0.0.0/0`
   - Click "Confirm"
7. Wait 1-2 minutes

### Test:
```bash
node testConnection.js
```

---

## ✅ SOLUSI 4: Use Mobile Hotspot (Quick Fix)

Jika ISP/Kampus memblokir MongoDB:

1. Enable Mobile Hotspot di HP
2. Connect laptop ke hotspot
3. Test connection:
   ```bash
   node testConnection.js
   ```

---

## ✅ SOLUSI 5: MongoDB Atlas Alternative Connection String

Coba format berbeda:

### Option A: Direct SRV
```env
MONGO_URI=mongodb+srv://bramantyo989:Beetle1110@cluster0.zgafu.mongodb.net/MediBoxPillbox
```

### Option B: Standard Connection (Non-SRV)
Get standard connection string dari MongoDB Atlas:
1. Cluster → Connect → Connect your application
2. Pilih "Standard connection string"
3. Copy format: `mongodb://bramantyo989:Beetle1110@host1:port1,host2:port2/MediBoxPillbox`

---

## 🎯 RECOMMENDED WORKFLOW

### Untuk Development (Saat ini):
```
✅ Gunakan MongoDB Local
```

### Untuk Production (Nanti):
```
✅ Fix DNS atau gunakan Mobile Hotspot
✅ Whitelist IP di MongoDB Atlas
✅ Deploy ke server dengan koneksi stabil
```

---

## 🚀 Quick Start - MongoDB Local

```bash
# 1. Install MongoDB Community Edition
# Download: https://www.mongodb.com/try/download/community

# 2. Update .env
MONGO_URI=mongodb://localhost:27017/MediBoxPillbox

# 3. Test
cd server
node testConnection.js

# 4. Run seeder
node seeders/dashboardSeeder.js

# 5. Start server
npm run dev
```

**Done! 🎉**

---

## 📞 Need Help?

Pilih salah satu solusi di atas:
- **Tercepat**: Solusi 1 (MongoDB Local)
- **Untuk Atlas**: Solusi 2 + 3 (Fix DNS + Whitelist)
- **Quick Fix**: Solusi 4 (Mobile Hotspot)
