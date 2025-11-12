const axios = require('axios');
require('dotenv').config();

class QualcommAIService {
  constructor() {
    // Flask Python service endpoint (local microservice)
    this.flaskUrl = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:5001';
    this.useFlask = process.env.USE_PYTHON_SERVICE !== 'false'; // Default to true
  }

  async classifyCompliance(logData) {
    try {
      const { waktu_konsumsi_seharusnya, timestamp_konsumsi_aktual, aksi } = logData;

      const payload = {
        waktu_konsumsi_seharusnya: new Date(waktu_konsumsi_seharusnya).toISOString(),
        timestamp_konsumsi_aktual: new Date(timestamp_konsumsi_aktual).toISOString(),
        aksi: aksi
      };

      // Call Flask Python microservice
      // Timeout set to 10 minutes (600 seconds) to allow Qualcomm AI Hub inference to complete
      // Qualcomm AI Hub inference jobs can take several minutes depending on queue and device availability
      const response = await axios.post(
        `${this.flaskUrl}/predict`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 600000 // 10 minutes - Wait for Qualcomm AI Hub inference to complete
        }
      );

      if (response.data && response.data.success) {
        return {
          success: true,
          kepatuhan: response.data.kepatuhan,
          confidence: response.data.confidence,
          method: response.data.method,
          delayMinutes: response.data.delayMinutes,
          job_id: response.data.job_id, // Qualcomm AI Hub job ID
          rawResponse: response.data
        };
      } else {
        throw new Error('Invalid response from Python service');
      }

    } catch (error) {
      // If Flask service is down or unreachable, use fallback
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        console.error('⚠️  Python service unavailable, using fallback');
      } else {
        console.error('❌ Qualcomm AI Error:', error.message);
      }
      return this.fallbackClassification(logData);
    }
  }

  parseAIResponse(response) {
    if (response.prediction) {
      return { label: response.prediction, confidence: response.confidence || 0.5 };
    }
    if (response.output) {
      return { label: response.output, confidence: response.score || response.confidence || 0.5 };
    }
    if (response.data && response.data.prediction) {
      return { label: response.data.prediction, confidence: response.data.confidence || 0.5 };
    }
    return { label: 'Tidak Patuh', confidence: 0.5 };
  }

  fallbackClassification(logData) {
    console.log('⚠️ Using fallback rule-based classification');
    const { waktu_konsumsi_seharusnya, timestamp_konsumsi_aktual, aksi } = logData;

    if (aksi === 'Tolak') {
      return { success: true, kepatuhan: 'Tidak Patuh', confidence: 1.0, method: 'fallback' };
    }

    const scheduledTime = new Date(waktu_konsumsi_seharusnya);
    const actualTime = new Date(timestamp_konsumsi_aktual);
    const delayMinutes = (actualTime - scheduledTime) / (1000 * 60);
    const kepatuhan = (Math.abs(delayMinutes) <= 30) ? 'Patuh' : 'Tidak Patuh';

    return {
      success: true,
      kepatuhan,
      confidence: 0.8,
      method: 'fallback',
      delayMinutes: Math.round(delayMinutes)
    };
  }

  async batchClassify(logsData) {
    const results = [];
    for (const log of logsData) {
      const result = await this.classifyCompliance(log);
      results.push({ log_id: log.log_id, ...result });
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return results;
  }

  async testConnection() {
    try {
      const testData = {
        waktu_konsumsi_seharusnya: new Date().toISOString(),
        timestamp_konsumsi_aktual: new Date().toISOString(),
        aksi: 'Terima'
      };
      const result = await this.classifyCompliance(testData);
      return {
        success: true,
        message: 'Koneksi ke Qualcomm AI Hub berhasil',
        method: result.method || 'qualcomm-ai'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Koneksi ke Qualcomm AI Hub gagal',
        error: error.message
      };
    }
  }
}

module.exports = new QualcommAIService();