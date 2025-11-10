const express = require('express');
const router = express.Router();
const Patient = require('../../models/patient');
const User = require('../../models/user');
const Medicine = require('../../models/medicine');
const Log = require('../../models/log');

// GET /api/dashboard/patient/:patientId
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

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
