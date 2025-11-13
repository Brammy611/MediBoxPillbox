const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Patient = require('../../models/patient');
const User = require('../../models/user');
const Medicine = require('../../models/medicine');
const Log = require('../../models/log');
const Kepatuhan = require('../../models/kepatuhan');

// Helper: list some patients for selection
router.get('/patients', async (_req, res) => {
  try {
    const patients = await Patient.find().limit(20).select('_id name username age gender');
    return res.json({ success: true, count: patients.length, patients });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil daftar pasien', error: e.message });
  }
});

// GET /api/dashboard/patient/:patientId (LIVE DATA)
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    // Validasi ObjectId lebih awal agar tidak memicu CastError
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ success: false, message: 'Format patientId tidak valid' });
    }

    // Ambil patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient tidak ditemukan' });
    }

    // Ambil caregiver (user) memakai caregiver_id yang ada di dokumen eksternal
    let caregiver = null;
    if (patient.caregiver || patient.caregiver_id) {
      const caregiverId = patient.caregiver || patient.caregiver_id;
      caregiver = await User.findById(caregiverId);
    }
    
    // Jika tidak ada caregiver dari field di atas, cari user yang linked_patients-nya berisi patient ini
    if (!caregiver) {
      caregiver = await User.findOne({ 
        role: 'caregiver', 
        linked_patients: patient._id 
      });
    }

    // Ambil medicines (gunakan field patient atau patient_id yang tersimpan)
    const medicines = await Medicine.find({
      $or: [ { patient: patient._id }, { patient_id: patient._id } ]
    });

    // Ambil logs terkait patient (gunakan field patient atau patient_id)
    const rawLogs = await Log.find({ $or: [ { patient: patient._id }, { patient_id: patient._id } ] })
      .populate('medicine')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Buat map obat untuk pencarian cepat nama obat dari log.medicine_id
    const medicineMap = medicines.reduce((acc, m) => {
      acc[m._id.toString()] = m;
      return acc;
    }, {});

    // Hitung statistik 7 hari terakhir (taken/on-time + late)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    // Filter logs untuk statistik - ambil yang berhasil diminum (on-time atau late)
    // Gunakan createdAt atau timestamp_konsumsi_aktual
    const statLogs = rawLogs.filter(l => {
      const logDate = l.createdAt || l.timestamp_konsumsi_aktual || l.timestamp;
      const isInRange = logDate >= sevenDaysAgo;
      const isSuccess = l.compliance_status === 'on-time' || 
                       l.compliance_status === 'late' || 
                       l.aksi === 'Terima';
      return isInRange && isSuccess;
    });

    // Kelompokkan per hari - buat array 7 hari terakhir
    const waktuPengambilanObat = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = statLogs.filter(l => {
        const logDate = new Date(l.createdAt || l.timestamp_konsumsi_aktual || l.timestamp);
        return logDate >= date && logDate < nextDate;
      }).length;
      
      waktuPengambilanObat.push({
        hari: `Hari ke -${i}`,
        jumlah: count,
        tanggal: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      });
    }

    // Analisis waktu kritis berdasarkan jam (pagi 5-12, siang 12-18, malam 18-5)
    const timeBuckets = { Pagi: 0, Siang: 0, Malam: 0 };
    statLogs.forEach(l => {
      const logDate = new Date(l.createdAt || l.timestamp_konsumsi_aktual || l.timestamp);
      const h = logDate.getHours();
      if (h >= 5 && h < 12) {
        timeBuckets.Pagi++;
      } else if (h >= 12 && h < 18) {
        timeBuckets.Siang++;
      } else {
        timeBuckets.Malam++;
      }
    });
    
    const totalBucket = Object.values(timeBuckets).reduce((a,b)=>a+b,0) || 0;
    const analisisWaktuKritis = Object.keys(timeBuckets).map(label => ({
      waktu: label,
      persen: totalBucket > 0 ? Math.round((timeBuckets[label]/totalBucket)*100) : 0,
      label,
      jumlah: timeBuckets[label]
    }));

    // Total missed (compliance_status === 'missed' atau aksi === 'Tolak') hanya hari ini
    const today = new Date(); 
    today.setHours(0, 0, 0, 0);
    const todayMissed = rawLogs.filter(l => {
      const logDate = new Date(l.createdAt || l.timestamp_konsumsi_aktual || l.timestamp);
      const isToday = logDate >= today;
      const isMissed = l.compliance_status === 'missed' || 
                      l.action === 'missed' || 
                      l.aksi === 'Tolak';
      return isToday && isMissed;
    }).length;
    
    // Hitung total obat yang harus diminum hari ini vs yang sudah diminum
    const todayLogs = rawLogs.filter(l => {
      const logDate = new Date(l.createdAt || l.timestamp_konsumsi_aktual || l.timestamp);
      return logDate >= today;
    });
    const todayTaken = todayLogs.filter(l => 
      l.compliance_status === 'on-time' || 
      l.compliance_status === 'late' || 
      l.aksi === 'Terima'
    ).length;
    const todayTotal = todayLogs.length;
    
    // Hitung compliance rate (7 hari terakhir)
    const totalSuccess = statLogs.length;
    const totalMissed = rawLogs.filter(l => {
      const logDate = new Date(l.createdAt || l.timestamp_konsumsi_aktual || l.timestamp);
      const isInRange = logDate >= sevenDaysAgo;
      const isMissed = l.compliance_status === 'missed' || 
                      l.action === 'missed' || 
                      l.aksi === 'Tolak';
      return isInRange && isMissed;
    }).length;
    const totalAttempts = totalSuccess + totalMissed;
    const complianceRate = totalAttempts > 0 
      ? Math.round((totalSuccess / totalAttempts) * 100) 
      : 0;

    // Riwayat realtime format
    const riwayatRealTime = rawLogs.slice(0, 20).map(log => {
      // Gunakan createdAt atau timestamp_konsumsi_aktual
      const t = new Date(log.createdAt || log.timestamp_konsumsi_aktual || log.timestamp);
      const hh = t.getHours().toString().padStart(2, '0');
      const mm = t.getMinutes().toString().padStart(2, '0');
      const dd = t.getDate().toString().padStart(2, '0');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
      const monthStr = monthNames[t.getMonth()];
      
      // Tentukan status berhasil diminum
      const taken = (log.compliance_status === 'on-time' || 
                    log.compliance_status === 'late' || 
                    log.aksi === 'Terima');
      
      // Jumlah obat dari servo_active atau medicine_id
      let jumlahObat = 1;
      if (Array.isArray(log.servo_active) && log.servo_active.length > 0) {
        jumlahObat = log.servo_active.length;
      } else if (Array.isArray(log.medicine_id) && log.medicine_id.length > 0) {
        jumlahObat = log.medicine_id.length;
      }
      
      // Format tampilan jumlah obat - selalu tampilkan dengan angka
      const namaObat = `${jumlahObat} obat`;
      
      // Deskripsi lebih detail
      let deskripsi = log.notes || '';
      if (log.compliance_status === 'late' && log.delay_seconds) {
        const delayMin = Math.floor(log.delay_seconds / 60);
        deskripsi = `Terlambat ${delayMin} menit. ${deskripsi}`;
      } else if (log.compliance_status === 'on-time') {
        deskripsi = 'Tepat waktu';
      } else if (log.compliance_status === 'missed') {
        deskripsi = 'Tidak diminum';
      }
      
      return {
        waktu: `${dd} ${monthStr}, ${hh}:${mm}`,
        namaObat,
        status: taken ? 'Diminum' : 'Tidak Diminum',
        statusIcon: taken ? '✓' : '✗',
        deskripsi: deskripsi.trim() || '-',
        compliance: log.compliance_status,
        temperature: log.temperature,
        humidity: log.humidity
      };
    });

    // ============================================
    // 🔹 KEPATUHAN: Ambil entry terbaru dari Collection Kepatuhan
    // ============================================
    const latestKepatuhan = await Kepatuhan.findOne({
      patient_id: patient._id
    })
    .sort({ created_at: -1 })
    .lean();

    let statusKepatuhan = 'Tidak Diketahui';
    let statusColor = '#9CA3AF'; // Gray untuk tidak diketahui
    let statusDetail = 'Belum ada data kepatuhan';

    if (latestKepatuhan) {
      statusKepatuhan = latestKepatuhan.kepatuhan; // 'Patuh' atau 'Tidak Patuh'
      statusColor = latestKepatuhan.kepatuhan === 'Patuh' ? '#10B981' : '#EF4444';
      statusDetail = `Status terakhir: ${latestKepatuhan.kepatuhan} (${new Date(latestKepatuhan.created_at).toLocaleString('id-ID')})`;
    }

    // Informasi obat (fallback jika schedule/fields lain tidak ada)
    const informasiObat = medicines.map(m => {
      const qty = typeof m.quantity_in_box === 'number' ? m.quantity_in_box : (typeof m.stock === 'number' ? m.stock : undefined);
      let derivedStatus = m.status;
      if (!derivedStatus && typeof qty === 'number') {
        if (qty <= 0) derivedStatus = 'Habis';
        else if (qty <= 5) derivedStatus = 'Hampir Habis';
        else derivedStatus = 'Tersedia';
      }
      return {
        noSekat: m.compartmentNumber ?? m.section_number ?? null,
        namaObat: m.name,
        aturanMinum: m.dosage || '-',
        deskripsi: m.description || '-',
        statusObat: derivedStatus || 'Tersedia'
      };
    });

    const dashboardData = {
      informasiPasien: {
        // Display name now forced to use username primarily per request
        nama: patient.name || 'Unknown',
        tanggalLahir: patient.birthDate ? patient.birthDate.toISOString().split('T')[0] : '',
        jenisKelamin: patient.gender || '-',
        alamatLansia: patient.address || '-',
        riwayatAlergi: Array.isArray(patient.medicalHistory?.allergies) ? patient.medicalHistory.allergies.join(', ') : '-',
        riwayatPenyakit: Array.isArray(patient.medicalHistory?.conditions) ? patient.medicalHistory.conditions.join(', ') : Array.isArray(patient.medical_history) ? patient.medical_history.join(', ') : '-'
      },
      informasiKeluarga: caregiver ? {
        nama: caregiver.name || '-',
        email: caregiver.email || '-',
        hubunganDenganLansia: caregiver.relationship || 'Keluarga',
        alamat: caregiver.address || '-',
        noHp: caregiver.phone || '-',
        jenisKelamin: caregiver.gender || '-'
      } : null,
      statistik: {
        waktuPengambilanObat,
        analisisWaktuKritis,
        keterangan: '*Data diambil dari MongoDB',
        statusKepatuhan: {
          status: statusKepatuhan,
          color: statusColor,
          persentase: null,
          detail: statusDetail
        },
        peringatanStok: informasiObat.some(i => i.statusObat === 'Hampir Habis' || i.statusObat === 'Habis') 
          ? 'Stok obat hampir habis' 
          : 'Stok obat mencukupi',
        ringkasanHariIni: {
          diminum: todayTaken,
          terlewat: todayMissed,
          total: todayTotal,
          persentase: todayTotal > 0 ? Math.round((todayTaken / todayTotal) * 100) : 0
        }
      },
      aktivitas: {
        riwayatRealTime,
        totalMissedHariIni: todayMissed,
        deteksiAnomali: {
          pesan: 'Sistem normal. Tidak ada anomali terdeteksi.',
          waktu: '-',
          tingkatKeparahan: 'rendah'
        }
      },
      informasiObat,
      metadata: {
        lastUpdated: new Date().toISOString(),
        patientId,
        source: 'mongodb'
      }
    };

    return res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data dashboard', error: error.message });
  }
});

// PUT /api/dashboard/patient/:patientId/info
// Update informasi pasien atau keluarga
router.put('/patient/:patientId/info', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { infoType, infoData } = req.body;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ success: false, message: 'Format patientId tidak valid' });
    }

    // Update Informasi Pasien/Lansia
    if (infoType === 'pasien') {
      const update = {};
      if (infoData.nama) {
        // Update both name and username to keep display consistent
        update.name = infoData.nama;
        update.username = infoData.nama;
      }
      if (infoData.tanggalLahir) update.birthDate = new Date(infoData.tanggalLahir);
      if (infoData.jenisKelamin) update.gender = infoData.jenisKelamin;
      if (infoData.alamatLansia) update.address = infoData.alamatLansia;
      
      // Alergi & Penyakit dipisah dengan koma
      if (infoData.riwayatAlergi) {
        update['medicalHistory.allergies'] = infoData.riwayatAlergi
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }
      if (infoData.riwayatPenyakit) {
        update['medicalHistory.conditions'] = infoData.riwayatPenyakit
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }

      let updatedPatient;
      try {
        updatedPatient = await Patient.findByIdAndUpdate(
          patientId,
          update,
          { new: true, runValidators: true }
        ).lean();
      } catch (e) {
        // Handle duplicate username error
        if (e && e.code === 11000 && e.keyPattern && e.keyPattern.username) {
          return res.status(409).json({
            success: false,
            message: 'Username sudah digunakan. Silakan pilih username lain.'
          });
        }
        throw e;
      }

      if (!updatedPatient) {
        return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan' });
      }

      return res.json({
        success: true,
        message: 'Informasi pasien berhasil diperbarui',
        data: {
          // Consistent with GET: prioritize username for display
          nama: updatedpatient.name || 'Unknown',
          tanggalLahir: updatedPatient.birthDate ? updatedPatient.birthDate.toISOString().split('T')[0] : '',
          jenisKelamin: updatedPatient.gender || '-',
          alamatLansia: updatedPatient.address || '-',
          riwayatAlergi: Array.isArray(updatedPatient.medicalHistory?.allergies) 
            ? updatedPatient.medicalHistory.allergies.join(', ') 
            : '-',
          riwayatPenyakit: Array.isArray(updatedPatient.medicalHistory?.conditions) 
            ? updatedPatient.medicalHistory.conditions.join(', ') 
            : '-'
        }
      });
    }

    // Update Informasi Keluarga/Caregiver
    if (infoType === 'keluarga') {
      // Temukan caregiver terkait dengan pasien
      const patient = await Patient.findById(patientId).lean();
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan' });
      }

      let caregiverId = null;
      if (patient.caregiver) {
        caregiverId = patient.caregiver;
      } else if (patient.caregiver_id && mongoose.Types.ObjectId.isValid(patient.caregiver_id)) {
        caregiverId = patient.caregiver_id;
      } else {
        const caregiver = await User.findOne({ 
          role: 'caregiver', 
          linked_patients: patient._id 
        }).lean();
        caregiverId = caregiver?._id;
      }

      if (!caregiverId) {
        return res.status(404).json({ 
          success: false, 
          message: 'Caregiver tidak ditemukan untuk pasien ini' 
        });
      }

      // Update data caregiver
      const caregiverUpdate = {};
      if (infoData.nama) caregiverUpdate.name = infoData.nama;
      if (infoData.noHp) caregiverUpdate.phone = infoData.noHp;
      if (infoData.jenisKelamin) caregiverUpdate.gender = infoData.jenisKelamin;
      if (infoData.alamat) caregiverUpdate.address = infoData.alamat;
      if (infoData.hubunganDenganLansia) caregiverUpdate.relationship = infoData.hubunganDenganLansia;
      // Email tidak diupdate karena digunakan untuk login

      const updatedCaregiver = await User.findByIdAndUpdate(
        caregiverId,
        caregiverUpdate,
        { new: true }
      ).lean();

      if (!updatedCaregiver) {
        return res.status(404).json({ success: false, message: 'Caregiver tidak ditemukan' });
      }

      return res.json({
        success: true,
        message: 'Informasi keluarga berhasil diperbarui',
        data: {
          nama: updatedCaregiver.name || '-',
          email: updatedCaregiver.email || '-',
          hubunganDenganLansia: updatedCaregiver.relationship || 'Keluarga',
          alamat: updatedCaregiver.address || '-',
          noHp: updatedCaregiver.phone || '-',
          jenisKelamin: updatedCaregiver.gender || '-'
        }
      });
    }

    return res.status(400).json({ 
      success: false, 
      message: 'infoType tidak valid. Gunakan "pasien" atau "keluarga"' 
    });
  } catch (error) {
    console.error('Error updating info:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate informasi',
      error: error.message
    });
  }
});

module.exports = router;
