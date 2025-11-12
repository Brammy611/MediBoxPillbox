const mongoose = require('mongoose');

// Memuat variabel dari .env
require('dotenv').config(); 

const connectDB = async () => {
  try {
    // Menggunakan URI dan nama DB dari .env dengan opsi koneksi yang lebih robust
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB, // Menentukan nama database
      serverSelectionTimeoutMS: 5000, // Timeout untuk memilih server (5 detik)
      socketTimeoutMS: 45000, // Timeout untuk operasi socket (45 detik)
      family: 4 // Gunakan IPv4, hindari masalah IPv6
    });

    console.log('MongoDB Connected: Berhasil terhubung ke database MediBoxPillbox...');
    
    // Event listeners untuk monitoring koneksi
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });
    
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('Full error:', err);
    
    // Berikan informasi troubleshooting
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check if MongoDB Atlas cluster is running (not paused)');
    console.error('2. Verify your IP address is whitelisted in MongoDB Atlas');
    console.error('3. Check your internet connection');
    console.error('4. Verify the connection string in .env file');
    
    // Keluar dari proses jika gagal terhubung
    process.exit(1);
  }
};

module.exports = connectDB;