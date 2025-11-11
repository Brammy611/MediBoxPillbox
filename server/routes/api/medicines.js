const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Medicine = require('../../models/medicine');

// GET /api/medicines/patient/:patientId - list medicines for a patient (supports patient or patient_id)
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ success: false, message: 'Format patientId tidak valid' });
    }
    const pid = new mongoose.Types.ObjectId(patientId);
    const medicines = await Medicine.find({ $or: [ { patient: pid }, { patient_id: pid } ] }).sort({ section_number: 1, compartmentNumber: 1 });
    return res.json({ success: true, count: medicines.length, medicines });
  } catch (e) {
    console.error('Error fetching medicines:', e);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data obat', error: e.message });
  }
});

module.exports = router;
