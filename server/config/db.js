const mongoose = require('mongoose');

// Memuat variabel dari .env
require('dotenv').config(); 

const connectDB = async () => {
  try {
    // Menggunakan URI dan nama DB dari .env
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB // Menentukan nama database
    });

    console.log('MongoDB Connected: Berhasil terhubung ke database MediBoxPillbox...');
  } catch (err) {
    console.error(err.message);
    // Keluar dari proses jika gagal terhubung
    process.exit(1);
  }
};

module.exports = connectDB;