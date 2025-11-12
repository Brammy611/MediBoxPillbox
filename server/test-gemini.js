// Test script untuk memastikan Gemini AI setup benar
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

console.log('=== TESTING GEMINI AI SETUP ===\n');

// Test 1: Check API Key
console.log('1. Checking API Key...');
if (process.env.GEMINI_API_KEY) {
  console.log('✅ API Key found:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
} else {
  console.log('❌ API Key NOT found in .env');
  process.exit(1);
}

// Test 2: Initialize Gemini
console.log('\n2. Initializing Gemini AI...');
try {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  console.log('✅ Gemini AI initialized successfully (model: gemini-2.0-flash)');

  // Test 3: Simple API call
  console.log('\n3. Testing API call...');
  (async () => {
    try {
      const result = await model.generateContent("Halo, ini test sederhana. Jawab dengan 'Test berhasil'");
      const response = result.response;
      const text = response.text();
      console.log('✅ API call successful!');
      console.log('Response:', text);
      console.log('\n=== ALL TESTS PASSED ===');
    } catch (error) {
      console.error('❌ API call failed:', error.message);
      process.exit(1);
    }
  })();

} catch (error) {
  console.error('❌ Failed to initialize Gemini:', error.message);
  process.exit(1);
}
