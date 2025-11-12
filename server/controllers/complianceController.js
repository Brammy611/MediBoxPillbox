const Log = require('../models/log');
const Kepatuhan = require('../models/kepatuhan');
const qualcommAIService = require('../services/qualcommAIService');
const complianceMonitor = require('../services/complianceMonitor');

/**
 * Controller untuk memproses kepatuhan menggunakan Qualcomm AI
 */

/**
 * Proses satu log untuk mendapatkan klasifikasi kepatuhan
 */
exports.processLogCompliance = async (req, res) => {
  try {
    const { logId } = req.params;

    console.log(`📊 Processing compliance for log: ${logId}`);

    // Ambil data log
    const log = await Log.findById(logId).populate('patient');
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log tidak ditemukan'
      });
    }

    // Pastikan data yang dibutuhkan ada
    if (!log.waktu_konsumsi_seharusnya || !log.timestamp_konsumsi_aktual || !log.aksi) {
      return res.status(400).json({
        success: false,
        message: 'Data log tidak lengkap. Diperlukan: waktu_konsumsi_seharusnya, timestamp_konsumsi_aktual, dan aksi'
      });
    }

    // Cek apakah sudah pernah diproses
    const existingKepatuhan = await Kepatuhan.findOne({ log_id: logId });
    if (existingKepatuhan) {
      return res.json({
        success: true,
        message: 'Log sudah pernah diproses',
        data: existingKepatuhan,
        isNew: false
      });
    }

    // Kirim ke Qualcomm AI untuk klasifikasi
    const aiResult = await qualcommAIService.classifyCompliance({
      waktu_konsumsi_seharusnya: log.waktu_konsumsi_seharusnya,
      timestamp_konsumsi_aktual: log.timestamp_konsumsi_aktual,
      aksi: log.aksi
    });

    // Simpan hasil ke collection kepatuhan
    const kepatuhan = new Kepatuhan({
      patient_id: log.patient._id || log.patient,
      log_id: log._id,
      kepatuhan: aiResult.kepatuhan,
      waktu_konsumsi_seharusnya: log.waktu_konsumsi_seharusnya,
      timestamp_konsumsi_aktual: log.timestamp_konsumsi_aktual,
      aksi: log.aksi,
      confidence_score: aiResult.confidence,
      created_at: new Date()
    });

    await kepatuhan.save();

    console.log(`✅ Compliance saved for log ${logId}: ${aiResult.kepatuhan}`);

    res.json({
      success: true,
      message: 'Kepatuhan berhasil diproses',
      data: kepatuhan,
      isNew: true,
      aiMethod: aiResult.method || 'qualcomm-ai'
    });

  } catch (error) {
    console.error('❌ Error processing compliance:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses kepatuhan',
      error: error.message
    });
  }
};

/**
 * Proses semua logs yang belum diproses
 */
exports.processBatchCompliance = async (req, res) => {
  try {
    console.log('📊 Starting batch compliance processing...');

    // Ambil semua log yang memiliki data lengkap untuk analisis
    const logs = await Log.find({
      waktu_konsumsi_seharusnya: { $exists: true, $ne: null },
      timestamp_konsumsi_aktual: { $exists: true, $ne: null },
      aksi: { $exists: true, $ne: null }
    }).populate('patient');

    console.log(`Found ${logs.length} logs with complete data`);

    // Ambil log_id yang sudah diproses
    const processedLogIds = await Kepatuhan.distinct('log_id');
    
    // Filter hanya log yang belum diproses
    const unprocessedLogs = logs.filter(log => 
      !processedLogIds.some(id => id.toString() === log._id.toString())
    );

    console.log(`${unprocessedLogs.length} logs need processing`);

    if (unprocessedLogs.length === 0) {
      return res.json({
        success: true,
        message: 'Semua log sudah diproses',
        processed: 0,
        total: logs.length
      });
    }

    const results = [];
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
          patient_id: log.patient._id || log.patient,
          log_id: log._id,
          kepatuhan: aiResult.kepatuhan,
          waktu_konsumsi_seharusnya: log.waktu_konsumsi_seharusnya,
          timestamp_konsumsi_aktual: log.timestamp_konsumsi_aktual,
          aksi: log.aksi,
          confidence_score: aiResult.confidence,
          created_at: new Date()
        });

        await kepatuhan.save();
        
        results.push({
          log_id: log._id,
          kepatuhan: aiResult.kepatuhan,
          confidence: aiResult.confidence,
          status: 'success'
        });

        successCount++;
        console.log(`✅ [${successCount}/${unprocessedLogs.length}] Log ${log._id}: ${aiResult.kepatuhan}`);

        // Delay kecil untuk menghindari rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing log ${log._id}:`, error.message);
        
        results.push({
          log_id: log._id,
          error: error.message,
          status: 'error'
        });
      }
    }

    console.log(`✅ Batch processing complete: ${successCount} success, ${errorCount} errors`);

    res.json({
      success: true,
      message: 'Batch processing selesai',
      processed: successCount,
      errors: errorCount,
      total: unprocessedLogs.length,
      results
    });

  } catch (error) {
    console.error('❌ Error in batch processing:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses batch kepatuhan',
      error: error.message
    });
  }
};

/**
 * Dapatkan statistik kepatuhan dari collection kepatuhan
 */
exports.getComplianceStats = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { days = 7 } = req.query;

    console.log(`📊 Getting compliance stats for patient ${patientId}, last ${days} days`);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Ambil data kepatuhan
    const complianceData = await Kepatuhan.find({
      patient_id: patientId,
      created_at: { $gte: startDate }
    }).sort({ created_at: -1 });

    // Hitung statistik
    const total = complianceData.length;
    const patuh = complianceData.filter(k => k.kepatuhan === 'Patuh').length;
    const tidakPatuh = complianceData.filter(k => k.kepatuhan === 'Tidak Patuh').length;
    const persentasePatuh = total > 0 ? (patuh / total * 100).toFixed(1) : 0;

    // Kategori kepatuhan
    let kategori = 'Baik';
    if (persentasePatuh < 50) {
      kategori = 'Perlu Perhatian';
    } else if (persentasePatuh < 80) {
      kategori = 'Sedang';
    }

    // Grafik per hari
    const dailyStats = {};
    complianceData.forEach(item => {
      const date = item.created_at.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { patuh: 0, tidakPatuh: 0 };
      }
      if (item.kepatuhan === 'Patuh') {
        dailyStats[date].patuh++;
      } else {
        dailyStats[date].tidakPatuh++;
      }
    });

    res.json({
      success: true,
      data: {
        summary: {
          total,
          patuh,
          tidakPatuh,
          persentasePatuh: parseFloat(persentasePatuh),
          kategori
        },
        dailyStats,
        recentCompliance: complianceData.slice(0, 10) // 10 data terbaru
      }
    });

  } catch (error) {
    console.error('❌ Error getting compliance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik kepatuhan',
      error: error.message
    });
  }
};

/**
 * Get all compliance data for a patient
 */
exports.getPatientCompliance = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const complianceData = await Kepatuhan.find({ patient_id: patientId })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('log_id');

    const total = await Kepatuhan.countDocuments({ patient_id: patientId });

    res.json({
      success: true,
      data: complianceData,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: (parseInt(skip) + complianceData.length) < total
      }
    });

  } catch (error) {
    console.error('❌ Error getting patient compliance:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kepatuhan',
      error: error.message
    });
  }
};

/**
 * Test Qualcomm AI connection
 */
exports.testQualcommAI = async (req, res) => {
  try {
    console.log('🧪 Testing Qualcomm AI connection...');
    
    const result = await qualcommAIService.testConnection();
    
    res.json({
      success: result.success,
      message: result.message,
      method: result.method,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error testing Qualcomm AI:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal test koneksi Qualcomm AI',
      error: error.message
    });
  }
};

/**
 * Delete all compliance data (for testing/reset)
 */
exports.resetCompliance = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (patientId) {
      await Kepatuhan.deleteMany({ patient_id: patientId });
      console.log(`🗑️ Deleted compliance data for patient ${patientId}`);
    } else {
      await Kepatuhan.deleteMany({});
      console.log('🗑️ Deleted all compliance data');
    }

    res.json({
      success: true,
      message: 'Data kepatuhan berhasil direset'
    });

  } catch (error) {
    console.error('❌ Error resetting compliance:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal reset data kepatuhan',
      error: error.message
    });
  }
};

/**
 * Get real-time monitor status
 */
exports.getMonitorStatus = async (req, res) => {
  try {
    const status = complianceMonitor.getStatus();
    
    res.json({
      success: true,
      monitor: status,
      message: status.isMonitoring 
        ? 'Real-time monitoring active - AI inference on new data' 
        : 'Real-time monitoring inactive'
    });

  } catch (error) {
    console.error('❌ Error getting monitor status:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil status monitor',
      error: error.message
    });
  }
};

/**
 * Start/Stop real-time monitor manually
 */
exports.toggleMonitor = async (req, res) => {
  try {
    const { action } = req.body; // 'start' or 'stop'
    
    if (action === 'start') {
      await complianceMonitor.startMonitoring();
      res.json({
        success: true,
        message: 'Real-time monitor started'
      });
    } else if (action === 'stop') {
      await complianceMonitor.stopMonitoring();
      res.json({
        success: true,
        message: 'Real-time monitor stopped'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid action. Use "start" or "stop"'
      });
    }

  } catch (error) {
    console.error('❌ Error toggling monitor:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengubah status monitor',
      error: error.message
    });
  }
};
