const Medicine = require('../models/medicine');
const mongoose = require('mongoose');

// Tambah medicine baru
exports.tambahMedicineBaru = async (req, res) => {
  try {
    // 1. Ambil data dari frontend
    const { namaObat, aturanMinum, deskripsi, patientId, frekuensiPerHari, jumlahTablet, stokObat } = req.body;
    
    console.log('Received data:', { namaObat, aturanMinum, deskripsi, patientId, frekuensiPerHari, jumlahTablet, stokObat });

    // Validasi input
    if (!namaObat || namaObat.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Nama obat tidak boleh kosong' 
      });
    }

    // Validasi patientId - lebih fleksibel
    let validPatientId = patientId;
    
    if (!validPatientId || validPatientId === 'undefined' || validPatientId === 'null') {
      // Jika tidak ada patientId, coba ambil patient pertama dari database
      const Patient = require('../models/patient');
      const firstPatient = await Patient.findOne();
      
      if (!firstPatient) {
        return res.status(400).json({ 
          success: false,
          message: 'Tidak ada patient tersedia di database' 
        });
      }
      
      validPatientId = firstPatient._id.toString();
      console.log('Using first patient ID:', validPatientId);
    }

    // Validasi format ObjectId
    if (!mongoose.Types.ObjectId.isValid(validPatientId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Format Patient ID tidak valid: ' + validPatientId
      });
    }

    const patientObjectId = new mongoose.Types.ObjectId(validPatientId);

    // 2. Logika Bisnis: Tentukan compartmentNumber baru secara otomatis untuk patient ini
    // Cari medicine dengan compartmentNumber tertinggi untuk patient ini
    const lastMedicine = await Medicine.findOne({ 
      $or: [{ patient: patientObjectId }, { patient_id: patientObjectId }] 
    }).sort({ compartmentNumber: -1 });
    
    let newCompartmentNumber = 1; // Default ke 1
    
    if (lastMedicine) {
      // Pastikan lastMedicine.compartmentNumber adalah angka yang valid
      const lastNumber = parseInt(lastMedicine.compartmentNumber) || 
                        parseInt(lastMedicine.section_number) || 0;
      newCompartmentNumber = lastNumber + 1;
    }
    
    console.log('Last medicine:', lastMedicine ? lastMedicine.compartmentNumber : 'none');
    console.log('New compartment number:', newCompartmentNumber);
    
    // Validasi bahwa newCompartmentNumber adalah angka yang valid
    if (isNaN(newCompartmentNumber) || newCompartmentNumber < 1) {
      newCompartmentNumber = 1;
      console.log('Reset to default compartment number: 1');
    }

    // Generate schedule dari frekuensi per hari
    const schedule = [];
    if (frekuensiPerHari && jumlahTablet) {
      const freq = parseInt(frekuensiPerHari) || 3;
      const tablet = parseInt(jumlahTablet) || 1;
      
      // Buat jadwal default berdasarkan frekuensi
      // Contoh: 3x sehari -> 08:00, 14:00, 20:00
      const times = ['08:00', '14:00', '20:00', '10:00', '16:00', '22:00', '12:00', '18:00', '06:00', '24:00'];
      for (let i = 0; i < freq && i < times.length; i++) {
        schedule.push({
          time: times[i],
          dose: tablet
        });
      }
    }

    // 3. Tentukan stock obat
    const stockValue = stokObat ? parseInt(stokObat) : 20;
    const finalStock = isNaN(stockValue) || stockValue < 1 ? 20 : stockValue;

    // 4. Buat dokumen baru
    const newMedicine = new Medicine({
      patient: patientObjectId,
      patient_id: patientObjectId,
      name: namaObat.trim(),
      dosage: aturanMinum || '',
      description: deskripsi || '',
      compartmentNumber: newCompartmentNumber,
      section_number: newCompartmentNumber,
      quantity_in_box: finalStock,
      stock: finalStock,
      status: 'Tersedia',
      schedule: schedule
    });

    // 4. Simpan ke MongoDB Atlas
    const savedMedicine = await newMedicine.save();
    
    console.log('Medicine saved successfully:', savedMedicine._id);

    // 5. Kirim respons sukses
    res.status(201).json({
      success: true,
      message: 'Obat berhasil ditambahkan',
      data: savedMedicine
    });

  } catch (error) {
    console.error("Error saat menambah medicine:", error);
    console.error("Error stack:", error.stack);
    
    // Handle validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: 'Validasi gagal: ' + messages.join(', '),
        error: error.message 
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Nomor compartment sudah digunakan',
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

// Get medicines by patient ID
exports.getMedicinesByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Format patientId tidak valid' 
      });
    }
    
    const pid = new mongoose.Types.ObjectId(patientId);
    const medicines = await Medicine.find({ 
      $or: [{ patient: pid }, { patient_id: pid }] 
    }).sort({ section_number: 1, compartmentNumber: 1 });
    
    return res.json({ 
      success: true, 
      count: medicines.length, 
      medicines 
    });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data obat', 
      error: error.message 
    });
  }
};

// Get medicine by ID
exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({ 
        success: false,
        message: 'Obat tidak ditemukan' 
      });
    }

    res.status(200).json({
      success: true,
      data: medicine
    });
  } catch (error) {
    console.error("Error saat mengambil medicine:", error);
    res.status(500).json({ 
      success: false,
      message: 'Gagal mengambil data obat', 
      error: error.message 
    });
  }
};

// Update medicine
exports.updateMedicine = async (req, res) => {
  try {
    const { name, dosage, description, status, quantity_in_box, stock } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (dosage) updateData.dosage = dosage;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (quantity_in_box !== undefined) updateData.quantity_in_box = quantity_in_box;
    if (stock !== undefined) updateData.stock = stock;
    
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({ 
        success: false,
        message: 'Obat tidak ditemukan' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Obat berhasil diupdate',
      data: medicine
    });
  } catch (error) {
    console.error("Error saat update medicine:", error);
    res.status(500).json({ 
      success: false,
      message: 'Gagal update data obat', 
      error: error.message 
    });
  }
};

// Delete medicine
exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);

    if (!medicine) {
      return res.status(404).json({ 
        success: false,
        message: 'Obat tidak ditemukan' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Obat berhasil dihapus',
      data: medicine
    });
  } catch (error) {
    console.error("Error saat delete medicine:", error);
    res.status(500).json({ 
      success: false,
      message: 'Gagal menghapus data obat', 
      error: error.message 
    });
  }
};
