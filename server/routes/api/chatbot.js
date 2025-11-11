const express = require('express');
const router = express.Router();

// POST /api/chatbot/message
// Body: { patientId, message }
// Returns a mock structured AI response for frontend chat UI
router.post('/message', async (req, res) => {
  try {
    const { patientId, message } = req.body || {};

    // Very simple mock logic: if message contains 'mual' or 'muntah' => GI related response
    const lower = (message || '').toLowerCase();
    let mockResponse = null;

    if (lower.includes('mual') || lower.includes('muntah')) {
      mockResponse = {
        success: true,
        messageId: `msg_${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        text: `Berdasarkan keluhan mual dan kehilangan nafsu makan pada pasien, kemungkinan penyebab termasuk gastroenteritis atau efek samping obat. Saya menyarankan pemantauan oral rehidrasi dan evaluasi lebih lanjut oleh tenaga medis.`,
        analysis: [
          {
            label: 'Kemungkinan Diagnosis',
            score: 0.72,
            detail: 'Gastroenteritis atau keracunan makanan ringan (perlu dikonfirmasi oleh dokter)'
          },
          {
            label: 'Perhatian',
            score: 0.55,
            detail: 'Risiko dehidrasi pada lansia, perhatikan frekuensi muntah dan penurunan kesadaran.'
          }
        ],
        warning: {
          level: 'medium',
          text: 'Jika muncul demam tinggi, muntah terus-menerus, atau darah pada muntahan atau tinja, segera bawa ke fasilitas kesehatan.'
        },
        recommendations: [
          'Rehidrasi oral dengan larutan garam elektrolit (ORS) jika dapat ditoleransi',
          'Hentikan obat antiemetik/NSAID jika dicurigai sebagai penyebab, konsultasikan dokter',
          'Pantau frekuensi muntah dan urine (tanda dehidrasi)'
        ],
        nextSteps: [
          'Jika kondisi memburuk, hubungi dokter atau fasilitas gawat darurat',
          'Jika ringan, catat waktu dan frekuensi muntah selama 24 jam dan laporkan ke caregiver/dokter'
        ]
      };
    } else if (lower.includes('pusing')) {
      mockResponse = {
        success: true,
        messageId: `msg_${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        text: `Keluhan pusing dapat disebabkan oleh hipotensi ortostatik, hipoglikemia, atau efek obat. Periksa tekanan darah posisi berdiri/duduk dan kadar gula jika memungkinkan.`,
        analysis: [
          { label: 'Kemungkinan', score: 0.58, detail: 'Hipotensi ortostatik atau efek samping obat' }
        ],
        warning: { level: 'low', text: 'Monitoring dan evaluasi tekanan darah disarankan' },
        recommendations: [ 'Posisi berbaring jika pusing berat', 'Periksa obat yang baru dimulai atau dosis yang berubah' ],
        nextSteps: [ 'Jika terjadi kehilangan kesadaran segera ke fasilitas kesehatan' ]
      };
    } else {
      // Generic fallback
      mockResponse = {
        success: true,
        messageId: `msg_${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        text: `Terima kasih, saya menerima keluhan Anda: "${message}". Dapatkah Anda memberikan detail tambahan seperti kapan mulai, ada demam, atau perubahan obat?`,
        analysis: [],
        warning: { level: 'low', text: 'Butuh informasi tambahan' },
        recommendations: [],
        nextSteps: [ 'Berikan detail tambahan (waktu mulai, demam, ada obat baru?)' ]
      };
    }

    // Simulate small processing delay
    setTimeout(() => {
      res.json(mockResponse);
    }, 400);
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ success: false, message: 'Gagal memproses pesan chatbot', error: error.message });
  }
});

module.exports = router;
