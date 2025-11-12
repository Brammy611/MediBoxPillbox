const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Patient = require('../../models/patient');
const User = require('../../models/user');
const Medicine = require('../../models/medicine');
const Log = require('../../models/log');

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
      .sort({ timestamp: -1 })
      .limit(50);

    // Buat map obat untuk pencarian cepat nama obat dari log.medicine_id
    const medicineMap = medicines.reduce((acc, m) => {
      acc[m._id.toString()] = m;
      return acc;
    }, {});

    // Hitung statistik 6 hari terakhir (taken/on-time)
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
    const statLogs = rawLogs.filter(l => l.timestamp >= sixDaysAgo && (l.action === 'taken' || l.compliance_status === 'on-time'));

    // Kelompokkan per hari
    const byDay = {};
    statLogs.forEach(l => {
      const key = l.timestamp.toISOString().substring(0,10); // YYYY-MM-DD
      byDay[key] = (byDay[key] || 0) + 1;
    });
    const sortedDays = Object.keys(byDay).sort();
    const waktuPengambilanObat = sortedDays.map((d, idx) => ({
      hari: `Hari ke -${sortedDays.length - idx - 1}`,
      jumlah: byDay[d]
    }));

    // Analisis waktu kritis (pagi 5-12, siang 12-18, malam lainnya)
    const timeBuckets = { Pagi: 0, Siang: 0, Malam: 0 };
    statLogs.forEach(l => {
      const h = l.timestamp.getHours();
      if (h >=5 && h < 12) timeBuckets.Pagi++; else if (h >=12 && h < 18) timeBuckets.Siang++; else timeBuckets.Malam++;
    });
    const totalBucket = Object.values(timeBuckets).reduce((a,b)=>a+b,0) || 0;
    const analisisWaktuKritis = Object.keys(timeBuckets).map(label => ({
      waktu: label,
      persen: totalBucket ? Math.round((timeBuckets[label]/totalBucket)*100) : 0,
      label
    }));

    // Total missed (action === 'missed' atau compliance_status === 'missed') hanya hari ini
    const today = new Date(); today.setHours(0,0,0,0);
    const todayMissed = rawLogs.filter(l => l.timestamp >= today && (l.action === 'missed' || l.compliance_status === 'missed')).length;

    // Riwayat realtime format
    const riwayatRealTime = rawLogs.slice(0,10).map(log => {
      const t = new Date(log.timestamp);
      const hh = t.getHours().toString().padStart(2,'0');
      const mm = t.getMinutes().toString().padStart(2,'0');
      const taken = (log.action === 'taken') || (log.compliance_status === 'on-time' || log.compliance_status === 'late');
      // Tentukan nama obat dari populate atau dari medicine_id array
      let namaObat = 'Unknown';
      if (log.medicine && log.medicine.name) {
        namaObat = log.medicine.name;
      } else if (Array.isArray(log.medicine_id) && log.medicine_id.length > 0) {
        const names = log.medicine_id
          .map(id => medicineMap[id?.toString()]?.name)
          .filter(Boolean);
        if (names.length > 0) namaObat = names.join(', ');
      }
      return {
        waktu: `[${t.toDateString()}, ${hh}:${mm}]`,
        namaObat,
        status: taken ? 'Diminum' : 'Tidak Diminum',
        statusIcon: taken ? '✓' : '✗',
        deskripsi: log.notes || log.description || log.compliance_status || '-'
      };
    });

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
        nama: patient.name || patient.username || 'Unknown',
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
          status: todayMissed > 2 ? 'Tidak Patuh' : 'Patuh',
          kategori: todayMissed > 0 ? 'Peringatan' : 'Baik'
        },
        peringatanStok: informasiObat.some(i => i.statusObat === 'Hampir Habis' || i.statusObat === 'Habis') ? 'Stok obat hampir habis' : 'Stok obat mencukupi'
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
      if (infoData.nama) update.name = infoData.nama;
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

      const updatedPatient = await Patient.findByIdAndUpdate(
        patientId,
        update,
        { new: true }
      ).lean();

      if (!updatedPatient) {
        return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan' });
      }

      return res.json({
        success: true,
        message: 'Informasi pasien berhasil diperbarui',
        data: {
          nama: updatedPatient.name || updatedPatient.username || 'Unknown',
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
