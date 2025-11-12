const express = require('express');
const router = express.Router();
const {
  tambahMedicineBaru,
  getMedicinesByPatient,
  getMedicineById,
  updateMedicine,
  deleteMedicine
} = require('../../controllers/medicineController');

// @route   POST /api/medicines/tambah
// @desc    Tambah medicine baru
// @access  Public
router.post('/tambah', tambahMedicineBaru);

// @route   GET /api/medicines/patient/:patientId
// @desc    Get medicines by patient ID
// @access  Public
router.get('/patient/:patientId', getMedicinesByPatient);

// @route   GET /api/medicines/:id
// @desc    Get medicine by ID
// @access  Public
router.get('/:id', getMedicineById);

// @route   PUT /api/medicines/:id
// @desc    Update medicine
// @access  Public
router.put('/:id', updateMedicine);

// @route   DELETE /api/medicines/:id
// @desc    Delete medicine
// @access  Public
router.delete('/:id', deleteMedicine);

module.exports = router;
