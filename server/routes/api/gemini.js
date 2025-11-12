const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

console.log("✅ File gemini.js berhasil di-load oleh Express");

// POST /api/gemini/saran-pola-makan
router.post('/saran-pola-makan', async (req, res) => {
  console.log("📩 Route /api/gemini/saran-pola-makan terpanggil");
  const { penyakit, daftarObat } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Kunci API Gemini tidak dikonfigurasi' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = `
      Peran: Anda adalah asisten farmasi dan nutrisi AI.
      Input: Pasien menderita ${penyakit} dan mengonsumsi: ${daftarObat?.join(", ")}.
      Tugas: Buat analisis dalam format JSON sesuai struktur berikut:

      {
        "interaksiObatMakanan": {
          "obat": "",
          "peringatan": "",
          "alasan": ""
        },
        "interaksiObatObat": {
          "judul": "",
          "hindari": "",
          "alasan": ""
        },
        "tipsEfekSamping": {
          "obat": "",
          "efekUmum": "",
          "saran": ""
        },
        "rekomendasiMakanan": [
          {
            "kategori": "",
            "items": [],
            "saran": ""
          }
        ]
      }
    `;

    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });
    let responseText = "";

    try {
      const result = await model.generateContent(prompt);
      responseText = await result.response.text();

      // Bersihkan markdown jika ada
      responseText = responseText.replace(/```json|```/g, "").trim();

      const parsed = JSON.parse(responseText);
      return res.json(parsed);

    } catch (err) {
      console.error("[Gemini API Error]", err);
      console.log("Raw response:", responseText);
      return res.status(500).json({
        error: "Gagal memanggil Gemini atau parsing response",
        raw: responseText,
        details: err.message
      });
    }

  } catch (err) {
    console.error("[Server Error]", err);
    return res.status(500).json({ error: "Terjadi kesalahan server", details: err.message });
  }
});

module.exports = router;
