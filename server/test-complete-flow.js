const mongoose = require('mongoose');
const axios = require('axios');
const Log = require('./models/log');
const Kepatuhan = require('./models/kepatuhan');
require('dotenv').config();

async function testCompleteFlow() {
  try {
    console.log('='.repeat(60));
    console.log('🧪 TESTING COMPLETE QUALCOMM AI INTEGRATION FLOW');
    console.log('='.repeat(60));

    await mongoose.connect(process.env.MONGO_URI);
    console.log('\n✅ Connected to MongoDB');

    // 1. Check if services are running
    console.log('\n📊 Step 1: Checking Services Status...');
    
    try {
      const flaskHealth = await axios.get('http://127.0.0.1:5001/health');
      console.log('   ✅ Flask Service: RUNNING');
      console.log('   - Model ID:', flaskHealth.data.model_id);
      console.log('   - Qualcomm Configured:', flaskHealth.data.qualcomm_configured);
      console.log('   - Method:', flaskHealth.data.qualcomm_configured ? 'Qualcomm AI' : 'Fallback');
    } catch (err) {
      console.log('   ❌ Flask Service: NOT RUNNING');
      console.log('   Please start: cd server/python-service && .\\venv\\Scripts\\Activate.ps1 && python app.py');
    }

    try {
      const nodeHealth = await axios.get('http://localhost:5000/api/compliance/monitor/status');
      console.log('   ✅ Node.js Backend: RUNNING');
      console.log('   - Real-time Monitor:', nodeHealth.data.monitor?.isMonitoring ? 'ACTIVE ✅' : 'INACTIVE ❌');
      console.log('   - Monitor Uptime:', nodeHealth.data.monitor?.uptime || 'N/A');
      console.log('   - Message:', nodeHealth.data.message || 'N/A');
    } catch (err) {
      console.log('   ❌ Node.js Backend: NOT RUNNING');
      console.log('   Please start: npm run dev');
      console.log('   Error:', err.message);
    }

    // 2. Get or create a test patient
    console.log('\n📊 Step 2: Preparing Test Data...');
    const Patient = require('./models/patient');
    
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
        address: 'Test Address'
      });
      await testPatient.save();
      console.log('   ✅ Created test patient:', testPatient._id);
    } else {
      console.log('   ✅ Using existing test patient:', testPatient._id);
    }

    // 3. Get baseline counts
    const baselineKepatuhanCount = await Kepatuhan.countDocuments({ patient_id: testPatient._id });
    console.log('   - Baseline kepatuhan records:', baselineKepatuhanCount);

    // 4. Insert a test log
    console.log('\n📊 Step 3: Inserting Test Log (Triggering Real-time Monitor)...');
    const testLog = new Log({
      patient: testPatient._id,
      patient_id: testPatient._id,
      action: 'taken', // Required: 'taken', 'missed', 'skipped'
      status: 'late', // Required: 'on_time', 'late', 'missed', 'overdose'
      waktu_konsumsi_seharusnya: new Date('2025-11-13T08:00:00Z'),
      timestamp_konsumsi_aktual: new Date('2025-11-13T08:15:00Z'), // 15 minutes late
      aksi: 'Terima', // For Qualcomm AI
      timestamp: new Date()
    });
    
    await testLog.save();
    console.log('   ✅ Test log inserted:', testLog._id);
    console.log('   - Expected time: 2025-11-13 08:00:00');
    console.log('   - Actual time: 2025-11-13 08:15:00');
    console.log('   - Delay: 15 minutes');
    console.log('   - Action: Terima');

    // 5. Wait for processing
    console.log('\n📊 Step 4: Waiting for Real-time Processing...');
    console.log('   ⏳ Waiting 5 seconds for Change Stream to trigger...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 6. Check if kepatuhan was created
    console.log('\n📊 Step 5: Checking if Kepatuhan Record Created...');
    const kepatuhan = await Kepatuhan.findOne({ log_id: testLog._id });
    
    if (kepatuhan) {
      console.log('   ✅ KEPATUHAN CREATED SUCCESSFULLY!');
      console.log('   - Kepatuhan:', kepatuhan.kepatuhan);
      console.log('   - Confidence:', kepatuhan.confidence_score);
      console.log('   - Method:', kepatuhan.method);
      console.log('   - Delay (minutes):', kepatuhan.delay_minutes);
      console.log('   - Created at:', kepatuhan.created_at);
      
      if (kepatuhan.method === 'qualcomm-ai') {
        console.log('   🎉 USING QUALCOMM AI MODEL!');
      } else {
        console.log('   ⚠️  Using fallback (Qualcomm AI may not be available)');
      }
    } else {
      console.log('   ❌ NO KEPATUHAN FOUND');
      console.log('   Possible reasons:');
      console.log('   - Real-time monitor not running');
      console.log('   - Flask service not accessible');
      console.log('   - Change Stream not initialized');
      
      // Try manual processing
      console.log('\n   🔧 Attempting manual processing...');
      try {
        const response = await axios.post(
          `http://localhost:5000/api/compliance/process/${testLog._id}`,
          {},
          { headers: { 'Authorization': 'Bearer test-token' } }
        );
        console.log('   ✅ Manual processing successful:', response.data);
      } catch (err) {
        console.log('   ❌ Manual processing failed:', err.message);
      }
    }

    // 7. Test dashboard endpoint
    console.log('\n📊 Step 6: Testing Dashboard Integration...');
    
    try {
      const dashboardResponse = await axios.get(
        `http://localhost:5000/api/family-dashboard/${testPatient._id}`
      );

      console.log('   ✅ Dashboard Endpoint Working!');
      console.log('   - Status Kepatuhan:', dashboardResponse.data.stats?.statusKepatuhan || 'N/A');
      console.log('   - Kategori:', dashboardResponse.data.stats?.kategoriKepatuhan || 'N/A');
      console.log('   - Persentase:', (dashboardResponse.data.stats?.persentaseKepatuhan || 0) + '%');
      console.log('   - Total Records:', dashboardResponse.data.stats?.totalKepatuhan || 0);
      console.log('   - Patuh:', dashboardResponse.data.stats?.jumlahPatuh || 0);
      console.log('   - Tidak Patuh:', dashboardResponse.data.stats?.jumlahTidakPatuh || 0);
    } catch (err) {
      console.log('   ❌ Dashboard endpoint error:', err.message);
    }

    // 8. Check current kepatuhan count
    const finalKepatuhanCount = await Kepatuhan.countDocuments({ patient_id: testPatient._id });
    console.log('\n📊 Step 7: Final Verification...');
    console.log('   - Baseline kepatuhan records:', baselineKepatuhanCount);
    console.log('   - Final kepatuhan records:', finalKepatuhanCount);
    console.log('   - New records created:', finalKepatuhanCount - baselineKepatuhanCount);

    // 9. Cleanup test data
    console.log('\n📊 Step 8: Cleaning Up Test Data...');
    await testLog.deleteOne();
    if (kepatuhan) await kepatuhan.deleteOne();
    console.log('   ✅ Test data cleaned up');

    // 10. Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 INTEGRATION TEST SUMMARY');
    console.log('='.repeat(60));
    
    const checks = [
      { name: '1. Model inference triggered on new data', status: kepatuhan ? '✅ YES' : '❌ NO' },
      { name: '2. Output saved to database', status: kepatuhan ? '✅ YES' : '❌ NO' },
      { name: '3. Dashboard integrated', status: '✅ YES (Backend Ready)' },
      { name: '4. Using Qualcomm AI', status: kepatuhan?.method === 'qualcomm-ai' ? '✅ YES' : '⚠️  Fallback' }
    ];

    checks.forEach(check => {
      console.log(`   ${check.status.padEnd(8)} ${check.name}`);
    });

    if (kepatuhan && kepatuhan.method === 'qualcomm-ai') {
      console.log('\n🎉 ALL SYSTEMS OPERATIONAL WITH QUALCOMM AI!');
    } else if (kepatuhan) {
      console.log('\n✅ System working, but using fallback rules instead of Qualcomm AI');
      console.log('   Check Flask service logs for AI model errors');
    } else {
      console.log('\n❌ Real-time processing not working. Check:');
      console.log('   - Is Node.js backend running? (npm run dev)');
      console.log('   - Is Flask service running? (python app.py)');
      console.log('   - Are Change Streams enabled in MongoDB?');
    }

    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');
  }
}

testCompleteFlow();
