const express = require('express');
const router = express.Router();
const {
  tambahObatBaru,
  getAllObat,
  getObatById,
  updateObat,
  deleteObat
} = require('../../controllers/obatController');

// @route   POST /api/obat/tambah
// @desc    Tambah obat baru
// @access  Public (bisa ditambahkan authentication middleware)
router.post('/tambah', tambahObatBaru);

// @route   GET /api/obat
// @desc    Get semua obat
// @access  Public
router.get('/', getAllObat);

// @route   GET /api/obat/:id
// @desc    Get obat by ID
// @access  Public
router.get('/:id', getObatById);

// @route   PUT /api/obat/:id
// @desc    Update obat
// @access  Public
router.put('/:id', updateObat);

// @route   DELETE /api/obat/:id
// @desc    Delete obat
// @access  Public
router.delete('/:id', deleteObat);

module.exports = router;
