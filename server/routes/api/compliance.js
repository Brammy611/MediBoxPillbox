const express = require('express');
const router = express.Router();
const complianceController = require('../../controllers/complianceController');
const auth = require('../../middleware/auth');

/**
 * Routes untuk Qualcomm AI Compliance Processing
 * Base URL: /api/compliance
 */

// Test koneksi Qualcomm AI
router.get('/test', complianceController.testQualcommAI);

// Get real-time monitor status
router.get('/monitor/status', complianceController.getMonitorStatus);

// Start/Stop real-time monitor manually
router.post('/monitor/toggle', auth, complianceController.toggleMonitor);

// Proses satu log untuk mendapatkan klasifikasi kepatuhan
router.post('/process/:logId', auth, complianceController.processLogCompliance);

// Proses batch semua logs yang belum diproses
router.post('/process-batch', auth, complianceController.processBatchCompliance);

// Get statistik kepatuhan untuk patient tertentu
router.get('/stats/:patientId', auth, complianceController.getComplianceStats);

// Get all compliance data untuk patient
router.get('/patient/:patientId', auth, complianceController.getPatientCompliance);

// Reset compliance data (untuk testing) - with patientId
router.delete('/reset/:patientId', auth, complianceController.resetCompliance);

// Reset compliance data (untuk testing) - without patientId (reset all)
router.delete('/reset', auth, complianceController.resetCompliance);

module.exports = router;
