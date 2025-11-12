const express = require('express');
const router = express.Router();
const { askGemini } = require('../../controllers/geminiChatController');

/**
 * @route   POST /api/chatbot/ask-gemini
 * @desc    Chatbot AI menggunakan Gemini - Analisis gejala berdasarkan data pasien dari MongoDB
 * @access  Public (should be protected in production)
 * @body    { patientId: string, message: string }
 * @returns { success: boolean, sender: 'ai', text: string, timestamp: string }
 * 
 * AI akan menganalisis berdasarkan:
 * - Gejala/keluhan yang diinputkan user
 * - Riwayat penyakit pasien dari database
 * - Obat yang sedang diminum dari database
 * - Riwayat alergi dari database
 * 
 * Response format:
 * - Disclaimer (wajib)
 * - Analisis Kemungkinan
 * - Rekomendasi Tindakan
 * - Tanda Bahaya
 * - Catatan Tambahan
 */
router.post('/ask-gemini', askGemini);

module.exports = router;
