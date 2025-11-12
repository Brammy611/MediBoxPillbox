const cron = require('node-cron');
const Log = require('../models/log');
const Kepatuhan = require('../models/kepatuhan');
const qualcommAIService = require('../services/qualcommAIService');

/**
 * Scheduler untuk otomatis memproses logs baru dan simpan ke collection kepatuhan
 * Berjalan setiap 5 menit
 */

let isProcessing = false;

const processNewLogs = async () => {
  if (isProcessing) {
    console.log('⏭️  Skipping: Previous compliance processing still running');
    return;
  }

  try {
    isProcessing = true;
    console.log('\n🤖 [Compliance Scheduler] Starting automated compliance processing...');

    // Ambil semua log yang memiliki data lengkap untuk analisis
    const logs = await Log.find({
      waktu_konsumsi_seharusnya: { $exists: true, $ne: null },
      timestamp_konsumsi_aktual: { $exists: true, $ne: null },
      aksi: { $exists: true, $ne: null }
    }).populate('patient');

    if (logs.length === 0) {
      console.log('ℹ️  No logs found with complete compliance data');
      isProcessing = false;
      return;
    }

    // Ambil log_id yang sudah diproses
    const processedLogIds = await Kepatuhan.distinct('log_id');
    
    // Filter hanya log yang belum diproses
    const unprocessedLogs = logs.filter(log => 
      !processedLogIds.some(id => id.toString() === log._id.toString())
    );

    if (unprocessedLogs.length === 0) {
      console.log('✅ All logs already processed. No new logs to process.');
      isProcessing = false;
      return;
    }

    console.log(`📊 Found ${unprocessedLogs.length} unprocessed log(s)`);

    let successCount = 0;
    let errorCount = 0;

    // Proses setiap log
    for (const log of unprocessedLogs) {
      try {
        // Kirim ke Qualcomm AI
        const aiResult = await qualcommAIService.classifyCompliance({
          waktu_konsumsi_seharusnya: log.waktu_konsumsi_seharusnya,
          timestamp_konsumsi_aktual: log.timestamp_konsumsi_aktual,
          aksi: log.aksi
        });

        // Simpan ke collection kepatuhan
        const kepatuhan = new Kepatuhan({
          patient_id: log.patient_id || log.patient,  // ✅ Fix: Use patient_id first
          log_id: log._id,
          kepatuhan: aiResult.kepatuhan,
          waktu_konsumsi_seharusnya: log.waktu_konsumsi_seharusnya,
          timestamp_konsumsi_aktual: log.timestamp_konsumsi_aktual,
          aksi: log.aksi,
          confidence_score: aiResult.confidence,
          method: aiResult.method || 'unknown',  // ✅ Add method tracking
          created_at: new Date()
        });

        await kepatuhan.save();
        
        successCount++;
        console.log(`   ✅ [${successCount}/${unprocessedLogs.length}] Log ${log._id}: ${aiResult.kepatuhan} (confidence: ${aiResult.confidence})`);

        // Delay kecil untuk menghindari rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error processing log ${log._id}:`, error.message);
      }
    }

    console.log(`\n📊 [Compliance Scheduler] Processing complete:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📈 Total processed: ${successCount + errorCount}\n`);

  } catch (error) {
    console.error('❌ [Compliance Scheduler] Error:', error.message);
  } finally {
    isProcessing = false;
  }
};

// Schedule untuk berjalan setiap 5 menit
const startComplianceScheduler = () => {
  console.log('🕐 [Compliance Scheduler] Initializing...');
  console.log('📅 Schedule: Every 5 minutes');
  console.log('🎯 Task: Process new logs and classify compliance using Qualcomm AI\n');

  // Cron expression: setiap 5 menit
  // Format: minute hour day month weekday
  cron.schedule('*/5 * * * *', () => {
    const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    console.log(`\n⏰ [${now}] Compliance scheduler triggered`);
    processNewLogs();
  });

  // Jalankan sekali saat startup (opsional, bisa dihapus jika tidak perlu)
  console.log('🚀 Running initial compliance processing...');
  setTimeout(() => {
    processNewLogs();
  }, 5000); // Delay 5 detik setelah server start
};

// Manual trigger function (bisa dipanggil dari API atau console)
const triggerManualProcessing = async () => {
  console.log('🔧 [Manual Trigger] Starting compliance processing...');
  await processNewLogs();
  console.log('✅ [Manual Trigger] Processing complete');
};

module.exports = {
  startComplianceScheduler,
  triggerManualProcessing,
  processNewLogs
};
