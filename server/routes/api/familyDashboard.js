const express = require('express');
const router = express.Router();

// MOCK DATA untuk Family Dashboard
const mockFamilyDashboardData = {
  stats: {
    waktuPengambilanObat: [
      { hari: "Hari-1", jumlah: 4 },
      { hari: "Hari-2", jumlah: 3 },
      { hari: "Hari-3", jumlah: 4 },
      { hari: "Hari-4", jumlah: 2 },
      { hari: "Hari-5", jumlah: 3 },
      { hari: "Hari-6", jumlah: 4 },
      { hari: "Hari-7", jumlah: 5 }
    ],
    analisisWaktuKritis: [
      { waktu: "Pagi", persen: 20, label: "Pagi" },
      { waktu: "Siang", persen: 10, label: "Siang" },
      { waktu: "Malam", persen: 70, label: "Malam" }
    ],
    statusKepatuhan: "Patuh",
    kategoriKepatuhan: "Baik",
    peringatanStok: "Stok obat hampir habis"
  },
  profiles: {
    lansiaProfile: {
      nama: "Sugeng",
      tanggalLahir: "1955-03-10",
      jenisKelamin: "Laki-laki",
      alamat: "Jl. Siliwangi No. 6a, Semarang",
      riwayatAlergi: "Debu",
      riwayatPenyakit: "Prostat"
    },
    caregiverProfile: {
      nama: "Bram",
      email: "FamilyAkun@gmail.com",
      jenisKelamin: "Laki-laki",
      alamat: "Jl. CandiPrambanan No. 5a, Semarang",
      hubungan: "Anak",
      noHP: "085xxxx..."
    }
  },
  informasiObat: [
    { 
      noSekat: 1, 
      namaObat: "Amoxcilin", 
      aturanMinum: "2 kali Sehari", 
      deskripsi: "Setelah Makan",
      statusObat: "Tersedia"
    },
    { 
      noSekat: 2, 
      namaObat: "Obat Prostat", 
      aturanMinum: "1 kali Sehari", 
      deskripsi: "Sebelum Tidur",
      statusObat: "Tersedia"
    },
    { 
      noSekat: 3, 
      namaObat: "Vitamin C", 
      aturanMinum: "1 kali Sehari", 
      deskripsi: "Setelah Sarapan",
      statusObat: "Tersedia"
    }
  ],
  saranPolaMakan: {
    disclaimer: "Informasi di halaman ini dibuat oleh AI sebagai panduan untuk membantu Anda, INI BUKAN PENGGANTI saran medis profesional. Selalu konsultasikan semua perubahan pola makan atau keluhan tentang obat dengan dokter atau ahli gizi Anda.",
    interaksiObat: [
      {
        obatTerdeteksi: "Amlodipine (Obat Hipertensi)",
        peringatan: "Jangan dikonsumsi bersamaan dengan jus Grapefruit (Jeruk Bali Merah).",
        alasan: "AI mendeteksi bahwa Grapefruit dapat meningkatkan kadar Amlodipine dalam darah, memicu efek samping berlebih seperti pusing atau sakit kepala berlebih."
      },
      {
        obatTerdeteksi: "Simvastatin (Obat Kolesterol)",
        peringatan: "Hindari konsumsi alkohol berlebih.",
        alasan: "Dapat meningkatkan risiko kerusakan hati."
      }
    ],
    tipsEfekSamping: {
      obatTerdeteksi: "Amlodipine (Obat Hipertensi)",
      efekSampingUmum: "Pusing saat berdiri (Hipotensi Ortostatik).",
      tips: "Saran: Sebaiknya minum obat ini sambil duduk sebelum tidur. Ingatkan beliau untuk bangun dari tempat tidur secara perlahan (duduk dulu 30 detik sebelum berdiri) untuk mencegah pusing."
    },
    rekomendasiMakanan: [
      {
        id: 1,
        judul: "1. Untuk Kesehatan Jantung & Hipertensi",
        makanan: ["Pisang", "Apel", "Bayam"],
        deskripsi: "Saran AI: Makanan-makanan ini kaya akan kalium (potassium) yang dapat membantu menyeimbangkan kadar garam (natrium) dan menjaga tekanan darah kakek tetap stabil.",
        deskripsiLanjutan: "Saran AI: Mengandung Omega-3 yang tinggi, yang terbukti baik untuk kesehatan pembuluh darah dan jantung."
      },
      {
        id: 2,
        judul: "2. Untuk Kesehatan Pencernaan & Energi",
        makanan: ["Oatmeal", "Gandum Utuh"],
        deskripsi: "Saran AI: Ini adalah sumber serat larut dan karbohidrat kompleks yang sangat baik. Serat membantu melancarkan pencernaan (mencegah sembelit) dan memberi energi yang tahan lama."
      }
    ],
    daftarObatTerkait: ["Amlodipine", "Simvastatin", "dst."]
  }
};

// GET /api/family-dashboard/:patientId
// Endpoint untuk mengambil semua data Family Dashboard
router.get('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    // TODO: Tambahkan middleware autentikasi di sini
    // Contoh: if (!req.user || req.user.role !== 'family') {
    //   return res.status(403).json({ success: false, message: 'Unauthorized' });
    // }

    // Simulasi delay API (opsional, untuk test loading state)
    // await new Promise(resolve => setTimeout(resolve, 500));

    // Return mock data
    res.json({
      success: true,
      data: mockFamilyDashboardData,
      metadata: {
        patientId: patientId,
        timestamp: new Date().toISOString(),
        source: 'mock-data'
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
// Endpoint untuk update profile (Lansia atau Caregiver)
router.put('/:patientId/profiles', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { profileType, profileData } = req.body;

    // TODO: Implementasi update ke database
    // Untuk sekarang, hanya return success

    res.json({
      success: true,
      message: `${profileType} profile berhasil diupdate`,
      data: profileData
    });

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
