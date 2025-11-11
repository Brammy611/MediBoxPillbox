const express = require('express');
const router = express.Router();
const Patient = require('../../models/patient');
const User = require('../../models/user');
const Medicine = require('../../models/medicine');
const Log = require('../../models/log');

// DATA DUMMY - Untuk development tanpa database
const dummyDashboardData = {
  informasiPasien: {
    nama: 'Supono',
    umur: 70,
    jenisKelamin: 'Laki-laki',
    alamatLansia: 'Jl. Melati No. 45, Semarang',
    riwayatAlergi: 'Penisilin, Seafood',
    riwayatPenyakit: 'Hipertensi, Diabetes Tipe 2'
  },
  informasiKeluarga: {
    nama: 'Budi Santoso',
    email: 'budi.santoso@email.com',
    hubunganDenganLansia: 'Anak Kandung',
    alamat: 'Jl. Mawar No. 12, Semarang',
    noHp: '081234567890',
    jenisKelamin: 'Laki-laki'
  },
  statistik: {
    waktuPengambilanObat: [
      { hari: 'Hari ke -6', jumlah: 8 },
      { hari: 'Hari ke -5', jumlah: 9 },
      { hari: 'Hari ke -4', jumlah: 7 },
      { hari: 'Hari ke -3', jumlah: 10 },
      { hari: 'Hari ke -2', jumlah: 8 },
      { hari: 'Hari ke -1', jumlah: 9 },
      { hari: 'Hari ke 0', jumlah: 6 }
    ],
    analisisWaktuKritis: [
      { waktu: 'Pagi', persen: 35, label: 'Pagi' },
      { waktu: 'Siang', persen: 40, label: 'Siang' },
      { waktu: 'Malam', persen: 25, label: 'Malam' }
    ],
    keterangan: '*Waktu lansia sering telat minum',
    statusKepatuhan: {
      status: 'Patuh',
      kategori: 'Baik'
    },
    peringatanStok: 'Stok obat Metformin hampir habis'
  },
  aktivitas: {
    riwayatRealTime: [
      {
        waktu: '[Hari ini, 08:00]',
        namaObat: 'Amlodipine 5mg',
        status: 'Diminum',
        statusIcon: '✓',
        deskripsi: 'Tepat Waktu'
      },
      {
        waktu: '[Hari ini, 12:30]',
        namaObat: 'Metformin 500mg',
        status: 'Diminum',
        statusIcon: '✓',
        deskripsi: 'Terlambat 30 menit'
      },
      {
        waktu: '[Hari ini, 14:00]',
        namaObat: 'Simvastatin 20mg',
        status: 'Tidak Diminum',
        statusIcon: '✗',
        deskripsi: 'Terlewat'
      },
      {
        waktu: '[Hari ini, 18:00]',
        namaObat: 'Amlodipine 5mg',
        status: 'Diminum',
        statusIcon: '✓',
        deskripsi: 'Tepat Waktu'
      },
      {
        waktu: '[Hari ini, 20:15]',
        namaObat: 'Metformin 500mg',
        status: 'Diminum',
        statusIcon: '✓',
        deskripsi: 'Terlambat 15 menit'
      }
    ],
    totalMissedHariIni: 1,
    deteksiAnomali: {
      pesan: 'Sistem normal. Tidak ada anomali terdeteksi.',
      waktu: '-',
      tingkatKeparahan: 'rendah'
    }
  },
  informasiObat: [
    {
      noSekat: 1,
      namaObat: 'Amlodipine 5mg',
      aturanMinum: '2x sehari (Pagi & Malam)',
      deskripsi: 'Obat tekanan darah tinggi',
      statusObat: 'Tersedia'
    },
    {
      noSekat: 2,
      namaObat: 'Metformin 500mg',
      aturanMinum: '3x sehari (Sesudah makan)',
      deskripsi: 'Obat diabetes',
      statusObat: 'Hampir Habis'
    },
    {
      noSekat: 3,
      namaObat: 'Simvastatin 20mg',
      aturanMinum: '1x sehari (Malam)',
      deskripsi: 'Obat kolesterol',
      statusObat: 'Tersedia'
    }
  ]
};

// GET /api/dashboard/patient/:patientId
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    // GUNAKAN DATA DUMMY - Tidak perlu koneksi database
    // Nanti bisa di-uncomment untuk menggunakan database
    return res.json({
      success: true,
      data: dummyDashboardData,
      metadata: {
        lastUpdated: new Date().toISOString(),
        patientId: patientId,
        source: 'dummy-data'
      }
    });

    /* KODE UNTUK DATABASE - Uncomment jika sudah setup database
    // 1. Ambil data Patient dari database
    const patient = await Patient.findById(patientId).populate('caregiver');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient tidak ditemukan'
      });
    }

    // 2. Ambil data Caregiver (Keluarga)
    const caregiver = patient.caregiver;

    // 3. Ambil data Medicines
    const medicines = await Medicine.find({ patient: patientId });

    // 4. Ambil logs untuk aktivitas hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = await Log.find({
      patient: patientId,
      timestamp: { $gte: today }
    })
      .populate('medicine')
      .sort({ timestamp: -1 })
      .limit(10);

    // 5. Hitung statistik waktu pengambilan obat (6 hari terakhir)
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
    const statisticLogs = await Log.aggregate([
      {
        $match: {
          patient: patient._id,
          timestamp: { $gte: sixDaysAgo },
          action: 'taken'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 6. Analisis waktu kritis (Pagi, Siang, Malam)
    const timeAnalysis = await Log.aggregate([
      {
        $match: {
          patient: patient._id,
          action: 'taken',
          timestamp: { $gte: sixDaysAgo }
        }
      },
      {
        $project: {
          hour: { $hour: '$timestamp' }
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $and: [{ $gte: ['$hour', 5] }, { $lt: ['$hour', 12] }] },
              'Pagi',
              {
                $cond: [
                  { $and: [{ $gte: ['$hour', 12] }, { $lt: ['$hour', 18] }] },
                  'Siang',
                  'Malam'
                ]
              }
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Hitung persentase
    const totalTime = timeAnalysis.reduce((sum, item) => sum + item.count, 0);
    const analisisWaktuKritis = ['Pagi', 'Siang', 'Malam'].map((waktu) => {
      const data = timeAnalysis.find((item) => item._id === waktu);
      const count = data ? data.count : 0;
      return {
        waktu,
        persen: totalTime > 0 ? Math.round((count / totalTime) * 100) : 0,
        label: waktu
      };
    });

    // 7. Hitung total missed hari ini
    const totalMissed = todayLogs.filter((log) => log.action === 'missed').length;

    // 8. Format data untuk response
    const dashboardData = {
      informasiPasien: {
        nama: patient.name,
        umur: patient.age,
        jenisKelamin: patient.gender,
        alamatLansia: patient.address,
        riwayatAlergi: patient.medicalHistory?.allergies?.join(', ') || '-',
        riwayatPenyakit: patient.medicalHistory?.conditions?.join(', ') || '-'
      },
      informasiKeluarga: caregiver ? {
        nama: caregiver.name,
        email: caregiver.email,
        hubunganDenganLansia: 'Keluarga', // Bisa disesuaikan dengan field di DB
        alamat: caregiver.address || '-',
        noHp: caregiver.phone,
        jenisKelamin: caregiver.gender || '-'
      } : null,
      statistik: {
        waktuPengambilanObat: statisticLogs.map((log, index) => ({
          hari: `Hari ke -${statisticLogs.length - index - 1}`,
          jumlah: log.count
        })),
        analisisWaktuKritis,
        keterangan: '*Waktu lansia sering telat minum',
        statusKepatuhan: {
          status: totalMissed > 2 ? 'Tidak Patuh' : 'Patuh',
          kategori: totalMissed > 0 ? 'Peringatan' : 'Baik'
        },
        peringatanStok: medicines.some((m) => m.status === 'Hampir Habis')
          ? 'Stok obat hampir habis'
          : 'Stok obat mencukupi'
      },
      aktivitas: {
        riwayatRealTime: todayLogs.map((log) => {
          const time = new Date(log.timestamp);
          const hours = time.getHours().toString().padStart(2, '0');
          const minutes = time.getMinutes().toString().padStart(2, '0');
          
          return {
            waktu: `[Hari ini, ${hours}:${minutes}]`,
            namaObat: log.medicine?.name || 'Unknown',
            status: log.action === 'taken' ? 'Diminum' : 'Tidak Diminum',
            statusIcon: log.action === 'taken' ? '✓' : '✗',
            deskripsi: log.description || (log.status === 'on_time' ? 'Tepat Waktu' : 'Terlewat')
          };
        }),
        totalMissedHariIni: totalMissed,
        deteksiAnomali: {
          pesan: 'Sistem normal. Tidak ada anomali terdeteksi.',
          waktu: '-',
          tingkatKeparahan: 'rendah'
        }
      },
      informasiObat: medicines.map((med) => ({
        noSekat: med.compartmentNumber,
        namaObat: med.name,
        aturanMinum: med.dosage,
        deskripsi: med.description || '-',
        statusObat: med.status
      })),
      metadata: {
        lastUpdated: new Date().toISOString(),
        patientId: patientId,
        source: 'database'
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });
    */

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dashboard',
      error: error.message
    });
  }
});

module.exports = router;
