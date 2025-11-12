const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Models
const Patient = require('../../models/patient');
const User = require('../../models/user');
const Medicine = require('../../models/medicine');
const Log = require('../../models/log');
const Kepatuhan = require('../../models/kepatuhan');

// Helper: kategorikan jam ke Pagi/Siang/Malam
function kategoriWaktu(scheduleTime) {
  if (!scheduleTime) return 'Tidak Diketahui';
  // scheduleTime format "HH:MM"
  const hour = parseInt(scheduleTime.split(':')[0], 10);
  if (hour >= 5 && hour < 11) return 'Pagi';
  if (hour >= 11 && hour < 16) return 'Siang';
  return 'Malam';
}

// Helper: hitung persentase aman (avoid divide by zero)
function persen(part, total) {
  if (!total || total === 0) return 0;
  return Math.round((part / total) * 100);
}

// Helper: hitung usia dari birthDate (YYYY-MM-DD atau Date)
function hitungUsia(birthDate) {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
    age--;
  }
  return age < 0 ? null : age;
}

// GET /api/family-dashboard/:patientId
// Ambil data real dari MongoDB, menyesuaikan struktur yang dibutuhkan client FamilyDashboard
router.get('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ success: false, message: 'patientId tidak valid' });
    }

    // Ambil patient
    const patient = await Patient.findById(patientId).lean();
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan' });
    }

    // Ambil caregiver (dua kemungkinan field: caregiver atau caregiver_id pada dokumen Atlas yang Anda tunjukkan)
    let caregiverDoc = null;
    if (patient.caregiver) {
      caregiverDoc = await User.findById(patient.caregiver).lean();
    } else if (patient.caregiver_id && mongoose.Types.ObjectId.isValid(patient.caregiver_id)) {
      caregiverDoc = await User.findById(patient.caregiver_id).lean();
    } else {
      // Fallback: cari user caregiver yang punya linked_patients mengandung patientId
      caregiverDoc = await User.findOne({ role: 'caregiver', linked_patients: patient._id }).lean();
    }

    // Ambil semua obat milik pasien (mendukung kedua field patient / patient_id)
    const medicines = await Medicine.find({
      $or: [ { patient: patient._id }, { patient_id: patient._id } ]
    }).lean();

    // Ambil log 7 hari terakhir untuk statistik kepatuhan
    const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000); // termasuk hari ini (7 hari window)
    const logs = await Log.find({
      timestamp: { $gte: sevenDaysAgo },
      $or: [ { patient: patient._id }, { patient_id: patient._id } ]
    }).lean();

    // Map informasiObat sesuai struktur UI
    const informasiObat = medicines.map(m => {
      const jadwalStr = (m.schedule || []).map(s => s.time).join(', ');
      const aturanMinum = `${(m.schedule || []).length} kali Sehari`;
      // Tentukan nomor sekat: gunakan section_number jika ada, kalau tidak compartmentNumber
      const noSekat = (typeof m.section_number === 'number') ? m.section_number : m.compartmentNumber;
      // Derive status stok jika field status belum ada
      let statusObat = m.status;
      if (!statusObat) {
        if (typeof m.quantity_in_box === 'number') {
          if (m.quantity_in_box <= 0) statusObat = 'Habis';
          else if (m.quantity_in_box <= 5) statusObat = 'Hampir Habis';
          else statusObat = 'Tersedia';
        } else {
          statusObat = 'Tersedia';
        }
      }
      return {
        id: m._id.toString(),
        _id: m._id.toString(),
        noSekat: noSekat || null,
        namaObat: m.name,
        aturanMinum,
        deskripsi: jadwalStr || m.description || m.dosage || '-',
        statusObat
      };
    }).sort((a, b) => (a.noSekat || 0) - (b.noSekat || 0));

    // Statistik: waktuPengambilanObat per hari (Hari-1 = hari ini mundur dst)
    const hariMap = {}; // key: index (0..6) value jumlah
    logs.forEach(l => {
      const diffDays = Math.floor((Date.now() - new Date(l.timestamp).getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays >= 0 && diffDays < 7) {
        if (l.action === 'taken') {
          hariMap[diffDays] = (hariMap[diffDays] || 0) + 1;
        }
      }
    });
    const waktuPengambilanObat = Array.from({ length: 7 }, (_, i) => ({
      hari: `Hari-${i + 1}`,
      jumlah: hariMap[i] || 0
    })).reverse(); // opsional: reverse kalau mau Hari-1 terbaru

    // Analisis waktu kritis (persentase taken per kategori waktu)
    const kategoriCounter = { Pagi: 0, Siang: 0, Malam: 0 };
    let totalTaken = 0;
    logs.forEach(l => {
      if (l.action === 'taken') {
        totalTaken++;
        const kategori = kategoriWaktu(l.schedule_time);
        if (kategoriCounter[kategori] !== undefined) {
          kategoriCounter[kategori]++;
        }
      }
    });
    const analisisWaktuKritis = Object.keys(kategoriCounter).map(k => ({
      waktu: k,
      persen: persen(kategoriCounter[k], totalTaken),
      label: k
    }));

    // ============================================
    // 🔹 KEPATUHAN: Gunakan data dari Collection Kepatuhan (Qualcomm AI)
    // ============================================
    const kepatuhanData = await Kepatuhan.find({
      patient_id: patient._id,
      created_at: { $gte: sevenDaysAgo }
    }).lean();

    let statusKepatuhan = 'Patuh';
    let kategoriKepatuhan = 'Baik';
    let persentaseKepatuhan = 100;

    if (kepatuhanData.length > 0) {
      // Hitung dari data Qualcomm AI
      const totalKepatuhan = kepatuhanData.length;
      const jumlahPatuh = kepatuhanData.filter(k => k.kepatuhan === 'Patuh').length;
      persentaseKepatuhan = persen(jumlahPatuh, totalKepatuhan);

      if (persentaseKepatuhan < 50) {
        statusKepatuhan = 'Tidak Patuh';
        kategoriKepatuhan = 'Perlu Perhatian';
      } else if (persentaseKepatuhan < 80) {
        statusKepatuhan = 'Cukup Patuh';
        kategoriKepatuhan = 'Sedang';
      } else {
        statusKepatuhan = 'Patuh';
        kategoriKepatuhan = 'Baik';
      }
    } else {
      // Fallback ke metode lama jika belum ada data kepatuhan
      const totalRencana = medicines.reduce((acc, m) => acc + (m.schedule ? m.schedule.length * 7 : 0), 0);
      const totalTakenAll = logs.filter(l => l.action === 'taken').length;
      const adherenceRatio = totalRencana ? totalTakenAll / totalRencana : 1;
      persentaseKepatuhan = Math.round(adherenceRatio * 100);
      
      if (adherenceRatio < 0.5) {
        statusKepatuhan = 'Tidak Patuh';
        kategoriKepatuhan = 'Perlu Perhatian';
      } else if (adherenceRatio < 0.8) {
        statusKepatuhan = 'Cukup Patuh';
        kategoriKepatuhan = 'Sedang';
      }
    }

    // Peringatan stok kalau ada obat quantity_in_box <= 5
    const stokMenipis = medicines.some(m => typeof m.quantity_in_box === 'number' && m.quantity_in_box <= 5);
    const peringatanStok = stokMenipis ? 'Stok obat hampir habis' : 'Stok aman';

    // Profiles mapping
    const lansiaProfile = {
      nama: patient.name || patient.username || 'Tidak Diketahui',
      tanggalLahir: patient.birthDate ? new Date(patient.birthDate).toISOString().split('T')[0] : '',
      jenisKelamin: patient.gender || 'Tidak Diketahui',
      alamat: patient.address || '-',
      phone: patient.phone || '-',
      age: hitungUsia(patient.birthDate),
      riwayatAlergi: (patient.medicalHistory?.allergies || []).join(', ') || '-',
      riwayatPenyakit: (patient.medicalHistory?.conditions || []).join(', ') || '-'
    };

    const caregiverProfile = caregiverDoc ? {
      nama: caregiverDoc.name || '-',
      email: caregiverDoc.email || '-',
      jenisKelamin: caregiverDoc.gender || '-',
      alamat: caregiverDoc.address || '-',
      hubungan: caregiverDoc.relationship || 'Caregiver',
      noHP: caregiverDoc.phone || '-'
    } : {
      nama: '-',
      email: '-',
      jenisKelamin: '-',
      alamat: '-',
      hubungan: '-',
      noHP: '-'
    };

    // Saran pola makan (sementara masih template, daftarObatTerkait diisi dari nama obat riil)
    const saranPolaMakan = {
      disclaimer: 'Informasi di halaman ini dibuat oleh AI sebagai panduan, BUKAN PENGGANTI saran medis profesional. Konsultasikan perubahan dengan dokter.',
      interaksiObat: [], // Bisa diisi rule berbasis nama obat di masa depan
      tipsEfekSamping: {
        obatTerdeteksi: '',
        efekSampingUmum: '',
        tips: ''
      },
      rekomendasiMakanan: [],
      daftarObatTerkait: medicines.map(m => m.name)
    };

    const responseData = {
      stats: {
        waktuPengambilanObat,
        analisisWaktuKritis,
        statusKepatuhan,
        kategoriKepatuhan,
        persentaseKepatuhan,
        totalKepatuhan: kepatuhanData.length,
        jumlahPatuh: kepatuhanData.filter(k => k.kepatuhan === 'Patuh').length,
        jumlahTidakPatuh: kepatuhanData.filter(k => k.kepatuhan === 'Tidak Patuh').length,
        peringatanStok
      },
      profiles: {
        lansiaProfile,
        caregiverProfile
      },
      informasiObat,
      saranPolaMakan,
      // Inisialisasi data untuk fitur Cek Gejala Mandiri (chatbot)
      cekGejala: {
        initialMessage: `Halo, ${caregiverProfile.nama || 'Caregiver'}! Saya AI Asisten MediBox. Apakah ada keluhan yang ${lansiaProfile.nama || 'lansia'} rasakan hari ini?`,
        quickReplies: [
          'Kakek mual dan tidak nafsu makan',
          'Kakek terlihat pusing',
          'Kakek mengeluh nyeri dada'
        ]
      },
      // Data notifikasi
      notifikasi: [
        {
          id: 'n1',
          tipe: 'warning',
          pesan: 'Terdeteksi Guncangan keras pada MediBox pukul 02:15. Segera hubungi Kakek!'
        },
        {
          id: 'n2',
          tipe: 'info',
          pesan: 'Obat sudah diminum pada pukul 07:02, status telat'
        }
      ]
    };

    res.json({
      success: true,
      data: responseData,
      metadata: {
        patientId,
        timestamp: new Date().toISOString(),
        source: 'live-db'
      }
    });
  } catch (error) {
    console.error('Error fetching family dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data family dashboard',
      error: error.message
    });
  }
});

// PUT /api/family-dashboard/:patientId/profiles
// Placeholder update profile (Belum implement ke DB)
router.put('/:patientId/profiles', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { profileType, profileData } = req.body;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ success: false, message: 'patientId tidak valid' });
    }

    if (profileType === 'lansia') {
      // Map profileData ke field patient termasuk phone & age
      const update = {};
      if (profileData.nama) update.name = profileData.nama;
      if (profileData.tanggalLahir) update.birthDate = new Date(profileData.tanggalLahir);
      if (profileData.jenisKelamin) update.gender = profileData.jenisKelamin;
      if (profileData.alamat) update.address = profileData.alamat;
  if (profileData.phone) update.phone = profileData.phone;
  // usia tidak disimpan; akan dihitung otomatis dari tanggal lahir
      // Alergi & Penyakit dipisah dengan koma
      if (profileData.riwayatAlergi) {
        update['medicalHistory.allergies'] = profileData.riwayatAlergi.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (profileData.riwayatPenyakit) {
        update['medicalHistory.conditions'] = profileData.riwayatPenyakit.split(',').map(s => s.trim()).filter(Boolean);
      }
      const updatedPatient = await Patient.findByIdAndUpdate(patientId, update, { new: true }).lean();
      if (!updatedPatient) {
        return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan' });
      }
      return res.json({ success: true, message: 'Profil lansia berhasil diperbarui', data: profileData });
    }

    if (profileType === 'caregiver') {
      // Temukan caregiver terkait
      const patient = await Patient.findById(patientId).lean();
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan' });
      }
      let caregiverId = null;
      if (patient.caregiver) caregiverId = patient.caregiver;
      else if (patient.caregiver_id && mongoose.Types.ObjectId.isValid(patient.caregiver_id)) caregiverId = patient.caregiver_id;
      else {
        const caregiver = await User.findOne({ role: 'caregiver', linked_patients: patient._id }).lean();
        caregiverId = caregiver?._id;
      }
      if (!caregiverId) {
        return res.status(404).json({ success: false, message: 'Caregiver tidak ditemukan untuk pasien ini' });
      }
      
      // Update semua field caregiver
      const caregiverUpdate = {};
      if (profileData.nama) caregiverUpdate.name = profileData.nama;
      if (profileData.noHP) caregiverUpdate.phone = profileData.noHP;
      if (profileData.jenisKelamin) caregiverUpdate.gender = profileData.jenisKelamin;
      if (profileData.alamat) caregiverUpdate.address = profileData.alamat;
      if (profileData.hubungan) caregiverUpdate.relationship = profileData.hubungan;
      // Email tidak diupdate karena digunakan untuk login
      
      const updatedCaregiver = await User.findByIdAndUpdate(caregiverId, caregiverUpdate, { new: true }).lean();
      if (!updatedCaregiver) {
        return res.status(404).json({ success: false, message: 'Caregiver tidak ditemukan' });
      }
      
      return res.json({ 
        success: true, 
        message: 'Profil caregiver berhasil diperbarui', 
        data: {
          nama: updatedCaregiver.name,
          email: updatedCaregiver.email,
          jenisKelamin: updatedCaregiver.gender || '-',
          alamat: updatedCaregiver.address || '-',
          hubungan: updatedCaregiver.relationship || '-',
          noHP: updatedCaregiver.phone || '-'
        }
      });
    }

    return res.status(400).json({ success: false, message: 'profileType tidak dikenali' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate profile',
      error: error.message
    });
  }
});

module.exports = router;
