/**
 * Test script untuk endpoint /api/chatbot/ask-gemini
 * Jalankan: node test-chatbot-endpoint.js
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testChatbotEndpoint() {
  console.log('\n🧪 Testing Chatbot Endpoint...\n');
  
  // Test 1: Check server health
  console.log('1️⃣ Checking server health...');
  try {
    const healthResponse = await axios.get(`${API_BASE}/api/health/db`);
    console.log('✅ Server is running');
    console.log('   MongoDB:', healthResponse.data.mongo.connected ? '✅ Connected' : '❌ Disconnected');
  } catch (error) {
    console.error('❌ Server is NOT running or unreachable');
    console.error('   Error:', error.message);
    console.log('\n⚠️  Please start the server first: cd server && node index.js\n');
    return;
  }

  // Test 2: Check GEMINI_API_KEY
  console.log('\n2️⃣ Checking GEMINI_API_KEY configuration...');
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    return;
  }
  console.log('✅ GEMINI_API_KEY is set:', process.env.GEMINI_API_KEY.substring(0, 20) + '...');

  // Test 3: Test chatbot endpoint with sample data
  console.log('\n3️⃣ Testing /api/chatbot/ask-gemini endpoint...');
  
  // You need to replace this with a valid patientId from your database
  const testPatientId = '674eaa222222222222222222'; // Replace with actual patient ID
  const testMessage = 'Kakek mual dan tidak nafsu makan';
  
  console.log('   Request:');
  console.log('   - patientId:', testPatientId);
  console.log('   - message:', testMessage);
  
  try {
    console.log('\n   ⏳ Sending request to Gemini AI...');
    const startTime = Date.now();
    
    const response = await axios.post(`${API_BASE}/api/chatbot/ask-gemini`, {
      patientId: testPatientId,
      message: testMessage
    }, {
      timeout: 30000 // 30 second timeout
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`\n✅ Response received in ${duration}ms`);
    console.log('\n📊 Response Data:');
    console.log('   - success:', response.data.success);
    console.log('   - sender:', response.data.sender);
    console.log('   - text length:', response.data.text?.length || 0, 'characters');
    console.log('   - timestamp:', response.data.timestamp);
    
    console.log('\n📝 AI Response Preview:');
    console.log('   ' + (response.data.text?.substring(0, 200) || 'No text') + '...\n');
    
    console.log('✅ Chatbot endpoint is working correctly!\n');
    
  } catch (error) {
    console.error('\n❌ Chatbot endpoint test FAILED');
    
    if (error.response) {
      // Server responded with error status
      console.error('   Status:', error.response.status);
      console.error('   Response:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('   No response received');
      console.error('   Error:', error.message);
    } else {
      // Error setting up request
      console.error('   Error:', error.message);
    }
    
    console.log('\n🔍 Debugging tips:');
    console.log('   1. Make sure server is running: node index.js');
    console.log('   2. Check GEMINI_API_KEY in .env file');
    console.log('   3. Verify patient ID exists in database');
    console.log('   4. Check server console for detailed error logs\n');
  }
}

// Run the test
testChatbotEndpoint().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
