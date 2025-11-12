# API Obat Documentation

## Base URL
```
http://localhost:5000/api/obat
```

## Endpoints

### 1. Tambah Obat Baru
**POST** `/tambah`

Menambahkan obat baru ke database. Nomor sekat akan ditentukan otomatis oleh sistem (auto-increment).

**Request Body:**
```json
{
  "namaObat": "Paracetamol",
  "aturanMinum": "3 kali sehari",
  "deskripsi": "Setelah makan",
  "patientId": "optional_patient_id"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Obat berhasil ditambahkan",
  "data": {
    "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "noSekat": 3,
    "namaObat": "Paracetamol",
    "aturanMinum": "3 kali sehari",
    "deskripsi": "Setelah makan",
    "statusObat": "Aktif",
    "createdAt": "2024-11-12T10:30:00.000Z",
    "updatedAt": "2024-11-12T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Nama obat tidak boleh kosong"
}
```

---

### 2. Get Semua Obat
**GET** `/`

Mengambil semua data obat yang tersimpan di database.

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
      "noSekat": 1,
      "namaObat": "Amoxicillin",
      "aturanMinum": "2 kali sehari",
      "deskripsi": "Setelah makan",
      "statusObat": "Aktif",
      "createdAt": "2024-11-12T10:30:00.000Z",
      "updatedAt": "2024-11-12T10:30:00.000Z"
    },
    ...
  ]
}
```

---

### 3. Get Obat By ID
**GET** `/:id`

Mengambil detail obat berdasarkan ID.

**URL Parameter:**
- `id`: MongoDB ObjectId dari obat

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "noSekat": 1,
    "namaObat": "Amoxicillin",
    "aturanMinum": "2 kali sehari",
    "deskripsi": "Setelah makan",
    "statusObat": "Aktif"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Obat tidak ditemukan"
}
```

---

### 4. Update Obat
**PUT** `/:id`

Mengupdate informasi obat yang sudah ada.

**URL Parameter:**
- `id`: MongoDB ObjectId dari obat

**Request Body:**
```json
{
  "namaObat": "Amoxicillin 500mg",
  "aturanMinum": "3 kali sehari",
  "deskripsi": "Setelah makan dengan air putih",
  "statusObat": "Selesai"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Obat berhasil diupdate",
  "data": {
    "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "noSekat": 1,
    "namaObat": "Amoxicillin 500mg",
    "aturanMinum": "3 kali sehari",
    "deskripsi": "Setelah makan dengan air putih",
    "statusObat": "Selesai",
    "updatedAt": "2024-11-12T11:00:00.000Z"
  }
}
```

---

### 5. Delete Obat
**DELETE** `/:id`

Menghapus obat dari database.

**URL Parameter:**
- `id`: MongoDB ObjectId dari obat

**Success Response (200):**
```json
{
  "success": true,
  "message": "Obat berhasil dihapus",
  "data": {
    "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "noSekat": 1,
    "namaObat": "Amoxicillin"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Obat tidak ditemukan"
}
```

---

## Status Obat
Obat memiliki 3 status yang berbeda:
- **Aktif**: Obat sedang digunakan (muncul di tabel "Update Obat")
- **Kosong**: Obat sudah habis (muncul di tabel "History")
- **Selesai**: Penggunaan obat sudah selesai (muncul di tabel "History")

---

## Error Handling
Semua error akan mengembalikan response dengan format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (optional)"
}
```

Status codes yang digunakan:
- `200`: Success (GET, PUT, DELETE)
- `201`: Created (POST)
- `400`: Bad Request (validation error)
- `404`: Not Found
- `500`: Internal Server Error
