const { GoogleGenerativeAI } = require("@google/generative-ai");
const Patient = require('../models/patient');
const Medicine = require('../models/medicine');

/**
 * Controller untuk Chatbot Gemini AI - Cek Gejala Mandiri
 * Mengambil data dari MongoDB (riwayat penyakit, obat) dan generate response menggunakan Gemini AI
 */
exports.askGemini = async (req, res) => {
  try {
    console.log('\n=== GEMINI CHATBOT REQUEST START ===');
    const { message, patientId } = req.body;
    
    // Validasi input
    if (!message || !patientId) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        success: false,
        text: "Pesan dan ID pasien diperlukan untuk analisis." 
      });
    }

    console.log('📩 Request:', { 
      message: message.substring(0, 50) + '...', 
      patientId 
    });

    // Step 1: Inisialisasi Gemini AI dengan model
    console.log('🤖 Initializing Gemini AI...');
    
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured in environment variables');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Gunakan model gemini-2.0-flash (fast and efficient)
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,      // Kreativitas sedang
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048, // Max panjang response
      }
    });

    console.log('✓ Gemini model initialized:', process.env.GEMINI_MODEL || 'gemini-2.0-flash');

    // Step 2: Ambil data pasien dari MongoDB
    console.log('📊 Fetching patient data from MongoDB...');
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      console.error('❌ Patient not found:', patientId);
      return res.status(404).json({
        success: false,
        text: "Data pasien tidak ditemukan. Silakan login ulang."
      });
    }

    console.log('✓ Patient found:', patient.name);

    // Step 3: Ambil data obat aktif pasien
    console.log('💊 Fetching active medicines...');
    const medicines = await Medicine.find({ 
      patient: patientId,
      status: { $in: ['Tersedia', 'Hampir Habis'] }
    });

    console.log(`✓ Found ${medicines.length} active medicine(s)`);

    // Step 4: Format data konteks untuk AI
    const patientName = patient.name || 'Pasien';
    const patientAge = patient.age || 'tidak diketahui';
    const patientGender = patient.gender || 'tidak diketahui';
    
    // Riwayat penyakit
    const conditions = patient.medicalHistory?.conditions || [];
    const conditionsText = conditions.length > 0 
      ? conditions.join(', ') 
      : 'Tidak ada riwayat penyakit kronis tercatat';
    
    // Riwayat alergi
    const allergies = patient.medicalHistory?.allergies || [];
    const allergiesText = allergies.length > 0
      ? allergies.join(', ')
      : 'Tidak ada riwayat alergi tercatat';
    
    // Daftar obat yang sedang diminum
    const medicinesList = medicines.length > 0
      ? medicines.map(med => {
          const scheduleText = med.schedule && med.schedule.length > 0
            ? `${med.schedule.length}x sehari`
            : (med.dosage || 'dosis tidak tercatat');
          return `- ${med.name} (${scheduleText})`;
        }).join('\n')
      : 'Tidak ada obat yang sedang dikonsumsi';

    console.log('📋 Context prepared:', {
      conditions: conditionsText,
      allergies: allergiesText,
      medicinesCount: medicines.length
    });

    // Step 5: Buat prompt untuk Gemini AI
    const prompt = `Anda adalah Asisten Kesehatan AI MediBox yang membantu keluarga memantau kondisi kesehatan lansia.

**PENTING - WAJIB DIBACA:**
- Anda BUKAN dokter dan TIDAK BOLEH memberikan diagnosis medis pasti
- Jawaban Anda hanya sebagai panduan awal dan TIDAK menggantikan konsultasi dokter
- Selalu awali jawaban dengan disclaimer peringatan
- Gunakan bahasa Indonesia yang mudah dipahami oleh keluarga lansia
- Fokus pada informasi praktis dan actionable

---
**DATA PASIEN:**
- Nama: ${patientName}
- Usia: ${patientAge} tahun
- Jenis Kelamin: ${patientGender}

**RIWAYAT KESEHATAN:**
- Riwayat Penyakit: ${conditionsText}
- Riwayat Alergi: ${allergiesText}

**OBAT YANG SEDANG DIMINUM:**
${medicinesList}

---
**KELUHAN/GEJALA YANG DIRASAKAN:**
"${message}"

---
**INSTRUKSI JAWABAN:**
Berdasarkan data pasien di atas, berikan analisis dalam format berikut:

⚠️ **DISCLAIMER WAJIB (Taruh di awal):**
"Analisis ini dibuat oleh AI dan BUKAN pengganti diagnosis dokter. Segera hubungi dokter jika keluhan berlanjut atau memburuk."

**1. 🔍 ANALISIS KEMUNGKINAN**
Jelaskan kemungkinan penyebab gejala dengan mempertimbangkan:
- Gejala yang disampaikan
- Riwayat penyakit pasien (${conditionsText})
- Obat yang sedang diminum (kemungkinan efek samping)
- Riwayat alergi jika relevan

Contoh: "Keluhan mual yang dialami ${patientName} kemungkinan disebabkan oleh efek samping obat X yang sedang dikonsumsi, atau bisa jadi terkait dengan kondisi Y yang dimiliki beliau."

**2. 💡 REKOMENDASI TINDAKAN**
Berikan 3-5 poin rekomendasi praktis:
1. Tindakan pertama yang bisa dilakukan di rumah
2. Hal-hal yang perlu dipantau
3. Kapan harus segera menghubungi dokter
4. Tips perawatan atau pencegahan
5. Interaksi obat jika ada yang perlu diperhatikan

**3. ⚠️ TANDA BAHAYA - SEGERA KE DOKTER JIKA:**
Sebutkan 3-5 gejala berbahaya yang jika muncul HARUS segera dibawa ke dokter/rumah sakit.

**4. 📝 CATATAN TAMBAHAN**
Berikan saran tambahan yang relevan dengan kondisi pasien.

---
**PENTING:**
- Gunakan bahasa yang hangat, empati, tapi profesional
- Jangan gunakan istilah medis yang terlalu teknis
- Gunakan emoji untuk memudahkan pembacaan
- Selalu tekankan pentingnya konsultasi dokter untuk diagnosis pasti
- Jika gejala serius (nyeri dada, sesak napas berat, kehilangan kesadaran), TEKANKAN untuk SEGERA ke UGD

Jawab sekarang:`;

    console.log('📝 Prompt created, length:', prompt.length, 'characters');

    // Step 6: Generate response dari Gemini AI dengan retry logic
    console.log('🚀 Sending request to Gemini AI...');
    const startTime = Date.now();
    
    let aiResponse = null;
    let lastError = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`   Attempt ${attempt}/${maxRetries}...`);
        
        const result = await model.generateContent(prompt);
        const response = result.response;
        aiResponse = response.text();
        
        // Success - break retry loop
        console.log(`✅ Success on attempt ${attempt}`);
        break;
        
      } catch (retryError) {
        lastError = retryError;
        console.error(`❌ Attempt ${attempt} failed:`, retryError.message);
        
        // Check if it's a network error that's worth retrying
        const isNetworkError = retryError.message?.includes('fetch failed') ||
                              retryError.message?.includes('ECONNREFUSED') ||
                              retryError.message?.includes('ETIMEDOUT') ||
                              retryError.message?.includes('network');
        
        if (!isNetworkError || attempt === maxRetries) {
          // Not a network error, or final attempt - throw immediately
          throw retryError;
        }
        
        // Wait before retry (exponential backoff: 1s, 2s, 4s)
        const waitTime = Math.pow(2, attempt - 1) * 1000;
        console.log(`   Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    if (!aiResponse) {
      throw lastError || new Error('Failed to get AI response after retries');
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ AI response received in ${duration}ms`);
    console.log('Response length:', aiResponse.length, 'characters');
    console.log('Response preview:', aiResponse.substring(0, 150) + '...');

    // Step 7: Kirim response ke frontend
    console.log('📤 Sending response to frontend');
    console.log('=== GEMINI CHATBOT REQUEST END ===\n');
    
    return res.json({ 
      success: true,
      sender: 'ai',
      text: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('\n❌ === GEMINI CHATBOT ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.stack) {
      console.error('Stack:', error.stack.split('\n').slice(0, 3).join('\n'));
    }

    // Handle berbagai tipe error
    let errorMessage = 'Maaf, AI sedang mengalami masalah teknis. Silakan coba lagi dalam beberapa saat.';
    
    if (error.message?.includes('API_KEY') || error.message?.includes('API key') || error.message?.includes('not configured')) {
      console.error('❌ API Key error');
      errorMessage = 'Maaf, konfigurasi AI bermasalah. Silakan hubungi administrator.';
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      console.error('❌ Quota exceeded');
      errorMessage = 'Maaf, layanan AI mencapai batas penggunaan. Silakan coba lagi nanti.';
    } else if (error.message?.includes('timeout')) {
      console.error('❌ Request timeout');
      errorMessage = 'Maaf, permintaan ke AI timeout. Silakan coba dengan pertanyaan yang lebih singkat.';
    } else if (error.message?.includes('fetch failed') || error.message?.includes('network') || error.message?.includes('ECONNREFUSED') || error.message?.includes('ETIMEDOUT')) {
      console.error('❌ Network/Connection error');
      errorMessage = 'Maaf, tidak dapat terhubung ke layanan AI. Kemungkinan penyebab:\n\n' +
                    '1. ❌ Koneksi internet bermasalah\n' +
                    '2. 🔒 Firewall/VPN memblokir akses ke Google API\n' +
                    '3. 🌐 DNS tidak dapat resolve generativelanguage.googleapis.com\n\n' +
                    '💡 Solusi cepat:\n' +
                    '- Periksa koneksi internet Anda\n' +
                    '- Coba matikan VPN sementara\n' +
                    '- Hubungi administrator jaringan\n\n' +
                    'Jika situasi mendesak, segera hubungi dokter.';
    }

    console.error('Sending error response\n');
    
    return res.status(500).json({ 
      success: false,
      sender: 'ai',
      text: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
