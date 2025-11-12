const Log = require('../models/log');
const Kepatuhan = require('../models/kepatuhan');
const qualcommAIService = require('./qualcommAIService');

/**
 * Real-time Compliance Monitor
 * Mendeteksi data baru di collection logs dan langsung proses dengan Qualcomm AI
 */

class ComplianceMonitor {
  constructor() {
    this.changeStream = null;
    this.isMonitoring = false;
  }

  /**
   * Start monitoring logs collection untuk data baru
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️  Compliance Monitor already running');
      return;
    }

    try {
      console.log('🔍 [Compliance Monitor] Starting real-time monitoring...');
      console.log('📡 Listening for new logs with compliance data...\n');

      // Setup MongoDB Change Stream untuk mendeteksi INSERT operations
      this.changeStream = Log.watch([
        { 
          $match: { 
            operationType: 'insert',
            // Filter hanya log dengan data lengkap untuk inferensi
            'fullDocument.waktu_konsumsi_seharusnya': { $exists: true },
            'fullDocument.timestamp_konsumsi_aktual': { $exists: true },
            'fullDocument.aksi': { $exists: true }
          } 
        }
      ], {
        fullDocument: 'updateLookup'
      });

      this.isMonitoring = true;

      // Handle setiap data baru
      this.changeStream.on('change', async (change) => {
        await this.processNewLog(change);
      });

      // Handle errors
      this.changeStream.on('error', (error) => {
        console.error('❌ [Compliance Monitor] Change Stream Error:', error.message);
        this.isMonitoring = false;
        
        // Auto-restart after 5 seconds
        console.log('🔄 Restarting monitor in 5 seconds...');
        setTimeout(() => {
          this.startMonitoring();
        }, 5000);
      });

      // Handle stream close
      this.changeStream.on('close', () => {
        console.log('⚠️  [Compliance Monitor] Stream closed');
        this.isMonitoring = false;
      });

      console.log('✅ [Compliance Monitor] Real-time monitoring active!\n');

    } catch (error) {
      console.error('❌ [Compliance Monitor] Failed to start:', error.message);
      this.isMonitoring = false;
    }
  }

  /**
   * Process log baru yang terdeteksi
   */
  async processNewLog(change) {
    try {
      const newLog = change.fullDocument;
      const logId = newLog._id;

      console.log('\n🆕 [NEW LOG DETECTED]');
      console.log('   Log ID:', logId);
      console.log('   Patient:', newLog.patient);
      console.log('   Aksi:', newLog.aksi);
      console.log('   Waktu Seharusnya:', new Date(newLog.waktu_konsumsi_seharusnya).toLocaleString('id-ID'));
      console.log('   Waktu Aktual:', new Date(newLog.timestamp_konsumsi_aktual).toLocaleString('id-ID'));

      // Cek apakah sudah pernah diproses (double-check)
      const existingKepatuhan = await Kepatuhan.findOne({ log_id: logId });
      if (existingKepatuhan) {
        console.log('   ℹ️  Already processed, skipping...');
        return;
      }

      // Kirim ke Qualcomm AI untuk inferensi
      console.log('   🤖 Sending to Qualcomm AI for inference...');
      const startTime = Date.now();

      const aiResult = await qualcommAIService.classifyCompliance({
        waktu_konsumsi_seharusnya: newLog.waktu_konsumsi_seharusnya,
        timestamp_konsumsi_aktual: newLog.timestamp_konsumsi_aktual,
        aksi: newLog.aksi
      });

      const inferenceTime = Date.now() - startTime;

      console.log('   ✅ Inference completed in', inferenceTime, 'ms');
      console.log('   📊 Result:', aiResult.kepatuhan);
      console.log('   🎯 Confidence:', (aiResult.confidence * 100).toFixed(1) + '%');
      console.log('   🔧 Method:', aiResult.method || 'qualcomm-ai');

      // Simpan hasil ke collection kepatuhan
      const kepatuhan = new Kepatuhan({
        patient_id: newLog.patient,
        log_id: logId,
        kepatuhan: aiResult.kepatuhan,
        waktu_konsumsi_seharusnya: newLog.waktu_konsumsi_seharusnya,
        timestamp_konsumsi_aktual: newLog.timestamp_konsumsi_aktual,
        aksi: newLog.aksi,
        confidence_score: aiResult.confidence,
        created_at: new Date()
      });

      await kepatuhan.save();

      console.log('   💾 Saved to kepatuhan collection');
      console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Emit event untuk notifikasi (optional, bisa ditambahkan nanti)
      this.emitComplianceEvent(kepatuhan, aiResult);

    } catch (error) {
      console.error('\n❌ [Compliance Monitor] Error processing log:', error.message);
      console.error('   Stack:', error.stack);
      console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
  }

  /**
   * Emit event untuk sistem notifikasi atau websocket (future enhancement)
   */
  emitComplianceEvent(kepatuhan, aiResult) {
    // Placeholder untuk future implementation
    // Bisa digunakan untuk:
    // - Send notification ke family caregiver
    // - Update dashboard real-time via WebSocket
    // - Trigger alert jika "Tidak Patuh"
    
    if (kepatuhan.kepatuhan === 'Tidak Patuh' && aiResult.confidence > 0.8) {
      console.log('   ⚠️  HIGH CONFIDENCE NON-COMPLIANCE DETECTED!');
      console.log('   💡 Consider sending alert to caregiver');
      // TODO: Implement notification system
    }
  }

  /**
   * Stop monitoring
   */
  async stopMonitoring() {
    if (!this.isMonitoring) {
      console.log('⚠️  Compliance Monitor not running');
      return;
    }

    try {
      if (this.changeStream) {
        await this.changeStream.close();
        console.log('🛑 [Compliance Monitor] Stopped monitoring');
      }
      this.isMonitoring = false;
    } catch (error) {
      console.error('❌ Error stopping monitor:', error.message);
    }
  }

  /**
   * Get monitoring status
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      uptime: this.isMonitoring ? 'Active' : 'Inactive'
    };
  }
}

// Export singleton instance
const complianceMonitor = new ComplianceMonitor();
module.exports = complianceMonitor;
