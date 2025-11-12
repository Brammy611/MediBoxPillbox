require('dotenv').config();
const axios = require('axios');

const testQualcommAPI = async () => {
  const API_URL = process.env.QUALCOMM_AI_API_URL;
  const API_KEY = process.env.QUALCOMM_AI_API_KEY;

  console.log('🔍 Testing Qualcomm AI API...');
  console.log(`📍 URL: ${API_URL}`);
  console.log(`🔑 Key: ${API_KEY?.substring(0, 10)}...`);

  const testData = {
    waktu_konsumsi_seharusnya: new Date('2025-01-13T10:00:00Z'),
    timestamp_konsumsi_aktual: new Date('2025-01-13T10:05:00Z'),
    aksi: 'Terima'
  };

  try {
    console.log('\n📤 Sending request...');
    console.log('Data:', JSON.stringify(testData, null, 2));

    const response = await axios.post(
      API_URL,
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        timeout: 10000
      }
    );

    console.log('\n✅ Success!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.log('\n💡 Kemungkinan penyebab:');
    console.log('   1. API URL salah (cek endpoint di Qualcomm AI Hub)');
    console.log('   2. API Key tidak valid');
    console.log('   3. Model ID salah (mq885klzq)');
    console.log('   4. API memerlukan format data berbeda');
    console.log('   5. API belum diaktifkan/deployed');
  }
};

testQualcommAPI();
