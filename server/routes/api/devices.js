const express = require('express');
const router = express.Router();

// Impor model yang kita buat di Tahap 2
const Device = require('../../models/device');
const Patient = require('../../models/patient');

/**
 * @route   GET /api/devices/patient/:patientId
 * @desc    Mengambil data sensor (device) terakhir berdasarkan ID Pasien
 * @access  Public (Nanti kita amankan dengan autentikasi)
 */
router.get('/patient/:patientId', async (req, res) => {
  try {
    // 1. Cari perangkat berdasarkan ID pasien
    const device = await Device.findOne({ patient_id: req.params.patientId });

    if (!device) {
      return res.status(404).json({ msg: 'Data perangkat tidak ditemukan' });
    }

    // 2. Kirim data perangkat sebagai respons
    res.json(device);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;