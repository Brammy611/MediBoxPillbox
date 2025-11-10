const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/user');
const Patient = require('../models/patient');
const Medicine = require('../models/medicine');
const Log = require('../models/log');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected untuk seeding data...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Data dummy untuk dashboard
const seedDashboardData = async () => {
  try {
    console.log('🌱 Mulai seeding data dashboard...');

    // 1. Buat User (Keluarga/Caregiver)
    const caregiver = await User.create({
      name: 'Bram',
      email: 'FamilyAkun@gmail.com',
      phone: '081585183071',
      password: '$2a$10$dummyHashedPassword123', // Password hash dummy
      role: 'caregiver'
    });
    console.log('✅ User (Caregiver) created:', caregiver.name);

    // 2. Buat Patient (Lansia)
    const patient = await Patient.create({
      name: 'Supono',
      age: 70,
      gender: 'Laki-laki',
      address: 'Jln. Bougenville No. 5A, Semarang',
      medicalHistory: {
        allergies: ['Kacang', 'Udang'],
        conditions: ['Prostat']
      },
      caregiver: caregiver._id,
      deviceId: 'MEDIBOX-001'
    });
    console.log('✅ Patient created:', patient.name);

    // Update caregiver dengan linked patient
    caregiver.linked_patients.push(patient._id);
    await caregiver.save();

    // 3. Buat Medicines (Obat-obatan)
    const medicines = await Medicine.insertMany([
      {
        name: 'Amoxcillin',
        compartmentNumber: 1,
        dosage: '2 kali Sehari',
        description: 'Setelah Makan',
        stock: 20,
        status: 'Tersedia',
        patient: patient._id
      },
      {
        name: 'Paracetamol',
        compartmentNumber: 2,
        dosage: '3 kali Sehari',
        description: 'Sebelum Makan',
        stock: 15,
        status: 'Tersedia',
        patient: patient._id
      },
      {
        name: 'Obat Prostat',
        compartmentNumber: 3,
        dosage: '1 kali Sehari',
        description: 'Malam hari',
        stock: 3,
        status: 'Hampir Habis',
        patient: patient._id
      }
    ]);
    console.log('✅ Medicines created:', medicines.length);

    // 4. Buat Logs (Riwayat Aktivitas)
    const today = new Date();
    const logs = await Log.insertMany([
      {
        patient: patient._id,
        medicine: medicines[2]._id, // Obat Prostat
        timestamp: new Date(today.setHours(20, 5, 0)),
        action: 'taken',
        status: 'on_time',
        description: 'Tepat Waktu',
        deviceId: 'MEDIBOX-001'
      },
      {
        patient: patient._id,
        medicine: medicines[0]._id, // Amoxcilin
        timestamp: new Date(today.setHours(12, 10, 0)),
        action: 'missed',
        status: 'missed',
        description: 'Terlewat',
        deviceId: 'MEDIBOX-001'
      },
      {
        patient: patient._id,
        medicine: medicines[0]._id, // Amoxcilin
        timestamp: new Date(today.setHours(7, 2, 0)),
        action: 'taken',
        status: 'late',
        description: 'Terlewat',
        deviceId: 'MEDIBOX-001'
      }
    ]);
    console.log('✅ Logs created:', logs.length);

    // 5. Buat Log untuk statistik (data beberapa hari terakhir)
    const statisticLogs = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Random jumlah obat per hari (2-4)
      const count = Math.floor(Math.random() * 3) + 2;
      for (let j = 0; j < count; j++) {
        statisticLogs.push({
          patient: patient._id,
          medicine: medicines[Math.floor(Math.random() * medicines.length)]._id,
          timestamp: new Date(date.setHours(8 + j * 4, 0, 0)),
          action: 'taken',
          status: 'on_time',
          deviceId: 'MEDIBOX-001'
        });
      }
    }
    await Log.insertMany(statisticLogs);
    console.log('✅ Statistic logs created:', statisticLogs.length);

    console.log('\n✨ Seeding completed successfully!');
    console.log('\n📊 Data Summary:');
    console.log(`   - Caregiver: ${caregiver.email}`);
    console.log(`   - Patient: ${patient.name} (ID: ${patient._id})`);
    console.log(`   - Medicines: ${medicines.length}`);
    console.log(`   - Logs: ${logs.length + statisticLogs.length}`);
    
    console.log('\n🔗 Untuk mengakses dashboard, gunakan:');
    console.log(`   GET /api/dashboard/patient/${patient._id}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
  }
};

// Run seeder
const runSeeder = async () => {
  await connectDB();
  await seedDashboardData();
};

runSeeder();
