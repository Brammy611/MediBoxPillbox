const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
require('dotenv').config();

// 🔹 1. Koneksi ke DB
connectDB();

// 🔹 2. Inisialisasi Express
const app = express();

// 🔹 3. Middleware
app.use(cors());
app.use(express.json());

// 🔹 4. Route dasar untuk test
app.get('/', (req, res) => {
  res.send('API MediBox Berjalan!');
});

// 🔹 5. Rute API
// Gunakan rute yang kita buat
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/devices', require('./routes/api/devices'));
app.use('/api/dashboard', require('./routes/api/dashboard'));
app.use('/api/family-dashboard', require('./routes/api/familyDashboard'));
app.use('/api/medicines', require('./routes/api/medicines'));
app.use('/api/chatbot', require('./routes/api/chatbot'));
app.use('/api/notifications', require('./routes/api/notifications'));
// (Nanti tambahkan rute lain di sini)
// app.use('/api/users', require('./routes/api/users'));
// app.use('/api/logs', require('./routes/api/logs'));

// 🔹 Gemini Route (pastikan path ini cocok!)
console.log("📦 Memuat route: /api/gemini ...");
app.use('/api/gemini', require('./routes/api/gemini'));

// 🔹 Healthcheck MongoDB
app.get('/api/health/db', (_req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = states[mongoose.connection.readyState] || 'unknown';
  res.json({
    success: true,
    mongo: {
      connected: mongoose.connection.readyState === 1,
      state,
      dbName: mongoose.connection.name || null,
    },
  });
});

// 🔹 6. Global 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', url: req.originalUrl });
});

// 🔹 7. Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// 🔹 8. Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan pada http://localhost:${PORT}`);
});
// Export untuk Vercel
module.exports = app;
