const mongoose = require('mongoose');
const Log = require('./models/log');
const Patient = require('./models/patient');
const Kepatuhan = require('./models/kepatuhan');
const qualcommAIService = require('./services/qualcommAIService');
require('dotenv').config();

/**
 * Test Qualcomm AI Inference with 10-minute timeout
 * Watch your Qualcomm AI Hub dashboard: https://app.aihub.qualcomm.com/jobs
 */

async function testQualcommInference() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 QUALCOMM AI INFERENCE TEST - WITH 10 MINUTE TIMEOUT');
    console.log('='.repeat(80));

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get test patient
    let testPatient = await Patient.findOne({ name: 'Test Patient AI' });
    if (!testPatient) {
      console.log('❌ Test patient not found. Creating one...');
      const timestamp = Date.now();
      testPatient = new Patient({
        name: 'Test Patient AI',
        username: `testpatient_${timestamp}`,
        email: `test_${timestamp}@test.com`,
        birthDate: new Date('1990-01-01'),
        age: 35,
        gender: 'Laki-laki',
        caregiver_id: new mongoose.Types.ObjectId(),
        address: 'Test Address for Qualcomm AI'
      });
      await testPatient.save();
    }
    console.log('✅ Using patient:', testPatient._id);

    // Create test log
    const now = new Date();
    const expectedTime = new Date(now.getTime() - 12 * 60 * 1000); // 12 minutes ago
    
    const testLog = new Log({
      patient: testPatient._id,
      patient_id: testPatient._id,
      action: 'taken',
      status: 'late',
      waktu_konsumsi_seharusnya: expectedTime,
      timestamp_konsumsi_aktual: now,
      aksi: 'Terima',
      description: 'Qualcomm AI inference test with 10-min timeout',
      timestamp: now
    });

    await testLog.save();
    console.log('✅ Test log created:', testLog._id);
    console.log('   Expected time:', expectedTime.toISOString());
    console.log('   Actual time:  ', now.toISOString());
    console.log('   Delay: 12 minutes');
    console.log('   Action: Terima');

    console.log('\n' + '─'.repeat(80));
    console.log('🤖 CALLING QUALCOMM AI HUB...');
    console.log('─'.repeat(80));
    console.log('⏳ This may take several minutes (up to 10 minutes timeout)');
    console.log('👀 WATCH YOUR DASHBOARD: https://app.aihub.qualcomm.com/jobs');
    console.log('📊 Look for model: mq885klzq');
    console.log('─'.repeat(80));

    const startTime = Date.now();
    
    // Call Qualcomm AI with extended timeout
    const result = await qualcommAIService.classifyCompliance({
      waktu_konsumsi_seharusnya: testLog.waktu_konsumsi_seharusnya,
      timestamp_konsumsi_aktual: testLog.timestamp_konsumsi_aktual,
      aksi: testLog.aksi
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(80));
    console.log('✅ INFERENCE COMPLETE!');
    console.log('='.repeat(80));
    console.log('⏱️  Duration:', duration, 'seconds');
    console.log('\n📊 RESULT:');
    console.log('   Kepatuhan:  ', result.kepatuhan);
    console.log('   Confidence: ', (result.confidence * 100).toFixed(1) + '%');
    console.log('   Method:     ', result.method);
    console.log('   Delay:      ', result.delayMinutes, 'minutes');
    
    if (result.job_id) {
      console.log('   Job ID:     ', result.job_id);
      console.log('\n🔗 View job: https://app.aihub.qualcomm.com/jobs/' + result.job_id);
    }

    if (result.method === 'qualcomm-ai') {
      console.log('\n🎉 SUCCESS! USING QUALCOMM AI MODEL!');
    } else if (result.method === 'fallback') {
      console.log('\n⚠️  FALLBACK METHOD USED');
      console.log('   Possible reasons:');
      console.log('   - Flask service not running');
      console.log('   - Qualcomm AI Hub API error');
      console.log('   - Model inference failed');
    }

    // Save to database
    console.log('\n💾 Saving to database...');
    const kepatuhan = new Kepatuhan({
      log_id: testLog._id,
      patient_id: testLog.patient,
      kepatuhan: result.kepatuhan,
      confidence_score: result.confidence,
      method: result.method,
      delay_minutes: result.delayMinutes,
      aksi: testLog.aksi,
      waktu_konsumsi_seharusnya: testLog.waktu_konsumsi_seharusnya,
      timestamp_konsumsi_aktual: testLog.timestamp_konsumsi_aktual,
      raw_ai_response: result.rawResponse,
      created_at: new Date()
    });

    await kepatuhan.save();
    console.log('✅ Kepatuhan record saved:', kepatuhan._id);

    console.log('\n' + '='.repeat(80));
    console.log('🏁 TEST COMPLETE!');
    console.log('='.repeat(80));

    // Cleanup
    await testLog.deleteOne();
    await kepatuhan.deleteOne();
    console.log('🧹 Test data cleaned up');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.code === 'ETIMEDOUT') {
      console.error('\n⏱️  TIMEOUT: Inference took longer than 10 minutes');
      console.error('   The Qualcomm AI Hub queue might be busy');
      console.error('   Check your dashboard for the job status');
    } else {
      console.error(error.stack);
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 MongoDB connection closed');
  }
}

// Run the test
console.log('\n🚀 Starting Qualcomm AI Inference Test...');
console.log('⚠️  Note: This test will wait up to 10 minutes for inference to complete');
console.log('');

testQualcommInference();
