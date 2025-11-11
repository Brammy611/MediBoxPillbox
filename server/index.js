const express = require('express');
const cors = require('cors'); // Impor cors
const connectDB = require('./config/db');
require('dotenv').config();

// 1. Panggil fungsi koneksi database (DISABLED untuk development)
// connectDB(); // Uncomment ini jika sudah setup MongoDB

// 2. Inisialisasi Express
const app = express();

// 3. Tambahkan Middleware
app.use(cors()); // Izinkan permintaan dari domain lain (React)
app.use(express.json()); // Izinkan server membaca data JSON dari body

// 4. Definisikan Rute
app.get('/', (req, res) => {
  res.send('API MediBox Berjalan!');
});

// Gunakan rute yang kita buat
app.use('/api/devices', require('./routes/api/devices'));
app.use('/api/dashboard', require('./routes/api/dashboard'));
app.use('/api/family-dashboard', require('./routes/api/familyDashboard'));
// (Nanti tambahkan rute lain di sini)
// app.use('/api/users', require('./routes/api/users'));
// app.use('/api/logs', require('./routes/api/logs'));

// 5. Tentukan Port
const PORT = process.env.PORT || 5000;

// 6. Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan pada http://localhost:${PORT}`);
});