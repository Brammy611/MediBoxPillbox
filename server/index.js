const express = require('express');
const connectDB = require('./config/db'); // Impor fungsi koneksi DB

// Memuat variabel .env
require('dotenv').config();

// 1. Panggil fungsi koneksi database
connectDB();

// 2. Inisialisasi Express
const app = express();

// 3. Buat rute (route) testing sederhana
app.get('/', (req, res) => {
  res.send('API MediBox Berjalan!');
});

// 4. Tentukan Port
const PORT = process.env.PORT || 5000;

// 5. Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan pada http://localhost:${PORT}`);
});