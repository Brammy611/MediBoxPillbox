const Obat = require('../models/obat');

// Tambah obat baru
exports.tambahObatBaru = async (req, res) => {
  try {
    // 1. Ambil data dari frontend
    const { namaObat, aturanMinum, deskripsi, patientId } = req.body;

    // Validasi input
    if (!namaObat || namaObat.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Nama obat tidak boleh kosong' 
      });
    }

    // 2. Logika Bisnis: Tentukan noSekat baru secara otomatis
    // Cari obat dengan noSekat tertinggi
    const obatTerakhir = await Obat.findOne().sort({ noSekat: -1 });
    const noSekatBaru = obatTerakhir ? obatTerakhir.noSekat + 1 : 1;

    // 3. Buat dokumen baru
    const obatBaru = new Obat({
      noSekat: noSekatBaru,
      namaObat: namaObat.trim(),
      aturanMinum: aturanMinum || '',
      deskripsi: deskripsi || '',
      statusObat: 'Aktif',
      patientId: patientId || null
    });

    // 4. Simpan ke MongoDB Atlas
    await obatBaru.save();

    // 5. Kirim respons sukses
    res.status(201).json({
      success: true,
      message: 'Obat berhasil ditambahkan',
      data: obatBaru
    });

  } catch (error) {
    console.error("Error saat menambah obat:", error);
    
    // Handle duplicate key error (noSekat sudah ada)
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Nomor sekat sudah digunakan',
        error: error.message 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Gagal menyimpan data obat baru', 
      error: error.message 
    });
  }
};

// Get semua obat
exports.getAllObat = async (req, res) => {
  try {
    const obatList = await Obat.find().sort({ noSekat: 1 });
    res.status(200).json({
      success: true,
      count: obatList.length,
      data: obatList
    });
  } catch (error) {
    console.error("Error saat mengambil data obat:", error);
    res.status(500).json({ 
      success: false,
      message: 'Gagal mengambil data obat', 
      error: error.message 
    });
  }
};

// Get obat by ID
exports.getObatById = async (req, res) => {
  try {
    const obat = await Obat.findById(req.params.id);
    
    if (!obat) {
      return res.status(404).json({ 
        success: false,
        message: 'Obat tidak ditemukan' 
      });
    }

    res.status(200).json({
      success: true,
      data: obat
    });
  } catch (error) {
    console.error("Error saat mengambil obat:", error);
    res.status(500).json({ 
      success: false,
      message: 'Gagal mengambil data obat', 
      error: error.message 
    });
  }
};

// Update obat
exports.updateObat = async (req, res) => {
  try {
    const { namaObat, aturanMinum, deskripsi, statusObat } = req.body;
    
    const obat = await Obat.findByIdAndUpdate(
      req.params.id,
      { 
        namaObat, 
        aturanMinum, 
        deskripsi, 
        statusObat,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!obat) {
      return res.status(404).json({ 
        success: false,
        message: 'Obat tidak ditemukan' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Obat berhasil diupdate',
      data: obat
    });
  } catch (error) {
    console.error("Error saat update obat:", error);
    res.status(500).json({ 
      success: false,
      message: 'Gagal update data obat', 
      error: error.message 
    });
  }
};

// Delete obat
exports.deleteObat = async (req, res) => {
  try {
    const obat = await Obat.findByIdAndDelete(req.params.id);

    if (!obat) {
      return res.status(404).json({ 
        success: false,
        message: 'Obat tidak ditemukan' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Obat berhasil dihapus',
      data: obat
    });
  } catch (error) {
    console.error("Error saat delete obat:", error);
    res.status(500).json({ 
      success: false,
      message: 'Gagal menghapus data obat', 
      error: error.message 
    });
  }
};
