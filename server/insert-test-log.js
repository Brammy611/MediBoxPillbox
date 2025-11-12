const mongoose = require('mongoose');
const Log = require('./models/log');
const Patient = require('./models/patient');
const Kepatuhan = require('./models/kepatuhan');
require('dotenv').config();

/**
 * Insert a test log to trigger Qualcomm AI inference
 * Watch your Qualcomm AI Hub dashboard for inference job!
 * Dashboard: https://app.aihub.qualcomm.com/jobs
 */

async function insertTestLog() {
  try {
    console.log('='.repeat(70));
    console.log('🧪 LIVE TEST: Inserting Log to Trigger Qualcomm AI Inference');
    console.log('='.repeat(70));

    await mongoose.connect(process.env.MONGO_URI);
    console.log('\n✅ Connected to MongoDB');

    // Find or create a test patient
    let testPatient = await Patient.findOne({ name: 'Test Patient AI' });
    if (!testPatient) {
      const timestamp = Date.now();
      testPatient = new Patient({
        name: 'Test Patient AI',
        username: `testpatient_${timestamp}`,
        email: `test_${timestamp}@test.com`,
        birthDate: new Date('1990-01-01'),
        age: 35,
        gender: 'Laki-laki',
        caregiver_id: new mongoose.Types.ObjectId(),
        address: 'Test Address for AI Testing'
      });
      await testPatient.save();
      console.log('✅ Created test patient:', testPatient._id);
    } else {
      console.log('✅ Using existing test patient:', testPatient._id);
    }

    // Get baseline count
    const beforeCount = await Kepatuhan.countDocuments({ patient_id: testPatient._id });
    console.log('📊 Current kepatuhan records:', beforeCount);

    console.log('\n' + '─'.repeat(70));
    console.log('📝 TEST SCENARIO:');
    console.log('─'.repeat(70));
    console.log('Patient should take medication at: 2025-11-13 14:00:00');
    console.log('Patient actually took it at:      2025-11-13 14:08:00');
    console.log('Delay: 8 minutes');
    console.log('Action: Terima (Accepted)');
    console.log('Expected Result: Patuh (within ±30 min threshold)');
    console.log('─'.repeat(70));

    // Create test log with compliance data
    const expectedTime = new Date('2025-11-13T14:00:00.000Z');
    const actualTime = new Date('2025-11-13T14:08:00.000Z');
    
    const testLog = new Log({
      patient: testPatient._id,
      patient_id: testPatient._id,
      action: 'taken',                              // Required field
      status: 'late',                               // Required field
      waktu_konsumsi_seharusnya: expectedTime,      // For Qualcomm AI
      timestamp_konsumsi_aktual: actualTime,        // For Qualcomm AI
      aksi: 'Terima',                               // For Qualcomm AI
      description: 'Live test for Qualcomm AI inference',
      timestamp: new Date()
    });

    console.log('\n🚀 INSERTING LOG INTO MONGODB...');
    console.log('   This should trigger:');
    console.log('   1. MongoDB Change Stream detection');
    console.log('   2. Node.js Real-time Monitor');
    console.log('   3. HTTP call to Flask (port 5001)');
    console.log('   4. Flask calls Qualcomm AI Hub');
    console.log('   5. Inference job appears in your dashboard!\n');

    await testLog.save();
    
    console.log('✅ LOG INSERTED SUCCESSFULLY!');
    console.log('   Log ID:', testLog._id);
    console.log('   Patient ID:', testLog.patient);
    console.log('   Expected Time:', expectedTime.toISOString());
    console.log('   Actual Time:', actualTime.toISOString());
    console.log('   Action:', testLog.aksi);

    console.log('\n⏱️  MONITORING FOR RESULTS...');
    console.log('   👀 CHECK YOUR QUALCOMM AI HUB DASHBOARD NOW!');
    console.log('   🌐 https://app.aihub.qualcomm.com/jobs');
    console.log('   📊 Look for new inference job with model ID: mq885klzq');

    // Wait and check for kepatuhan record
    console.log('\n   Waiting 10 seconds for processing...');
    
    for (let i = 10; i >= 1; i--) {
      process.stdout.write(`\r   ⏳ ${i} seconds remaining...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('\r   ✅ 10 seconds elapsed           ');

    // Check if kepatuhan was created
    console.log('\n📊 CHECKING RESULTS...');
    const kepatuhan = await Kepatuhan.findOne({ log_id: testLog._id });

    if (kepatuhan) {
      console.log('\n🎉 SUCCESS! KEPATUHAN RECORD CREATED!\n');
      console.log('┌─────────────────────────────────────────────────────────┐');
      console.log('│                   INFERENCE RESULT                       │');
      console.log('├─────────────────────────────────────────────────────────┤');
      console.log('│ Kepatuhan:        ', kepatuhan.kepatuhan.padEnd(35), '│');
      console.log('│ Confidence:       ', (kepatuhan.confidence_score * 100).toFixed(1) + '%'.padEnd(35), '│');
      console.log('│ Method:           ', (kepatuhan.method || 'N/A').padEnd(35), '│');
      console.log('│ Delay (minutes):  ', (kepatuhan.delay_minutes || 'N/A').toString().padEnd(35), '│');
      console.log('│ Created At:       ', kepatuhan.created_at.toISOString().substring(0, 19).padEnd(35), '│');
      console.log('└─────────────────────────────────────────────────────────┘');

      if (kepatuhan.method === 'qualcomm-ai') {
        console.log('\n✨ QUALCOMM AI MODEL USED! ✨');
        console.log('   Check your Qualcomm AI Hub dashboard for job details!');
      } else if (kepatuhan.method === 'fallback') {
        console.log('\n⚠️  FALLBACK METHOD USED');
        console.log('   Possible reasons:');
        console.log('   - Flask service not running or not accessible');
        console.log('   - Qualcomm AI Hub API error');
        console.log('   - Check Flask terminal for error messages');
      } else {
        console.log('\n⚠️  METHOD:', kepatuhan.method || 'UNKNOWN');
      }

      // Show raw AI response if available
      if (kepatuhan.raw_ai_response) {
        console.log('\n📄 Raw AI Response:');
        console.log(JSON.stringify(kepatuhan.raw_ai_response, null, 2));
      }

    } else {
      console.log('\n❌ NO KEPATUHAN RECORD FOUND');
      console.log('\n🔍 TROUBLESHOOTING STEPS:');
      console.log('   1. Check if Node.js server is running:');
      console.log('      cd C:\\Arib\\MediBoxPillbox\\MediBoxPillbox');
      console.log('      npm run dev');
      console.log('   ');
      console.log('   2. Check if Flask service is running:');
      console.log('      cd C:\\Arib\\MediBoxPillbox\\MediBoxPillbox\\server\\python-service');
      console.log('      .\\venv\\Scripts\\Activate.ps1');
      console.log('      python app.py');
      console.log('   ');
      console.log('   3. Check monitor status:');
      console.log('      Invoke-RestMethod http://localhost:5000/api/compliance/monitor/status');
      console.log('   ');
      console.log('   4. Check Node.js server logs for Change Stream messages');
      console.log('   ');
      console.log('   5. Try manual processing:');
      console.log(`      Invoke-RestMethod -Uri "http://localhost:5000/api/compliance/process/${testLog._id}" -Method POST`);
    }

    const afterCount = await Kepatuhan.countDocuments({ patient_id: testPatient._id });
    console.log('\n📊 FINAL STATISTICS:');
    console.log('   Before:', beforeCount, 'records');
    console.log('   After: ', afterCount, 'records');
    console.log('   New:   ', afterCount - beforeCount, 'record(s) created');

    console.log('\n' + '='.repeat(70));
    console.log('🏁 TEST COMPLETE');
    console.log('='.repeat(70));
    console.log('💡 TIP: Leave Node.js and Flask services running');
    console.log('   Real-time monitor will process future logs automatically!');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 MongoDB connection closed');
  }
}

// Run the test
insertTestLog();
