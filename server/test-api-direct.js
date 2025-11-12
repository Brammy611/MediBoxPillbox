// Direct API test using fetch
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

console.log('=== TESTING GEMINI API DIRECTLY ===\n');
console.log('API Key:', API_KEY.substring(0, 10) + '...\n');

const testPrompt = {
  contents: [{
    parts: [{
      text: "Halo, ini test sederhana. Jawab singkat saja."
    }]
  }]
};

fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPrompt)
})
.then(response => {
  console.log('Status:', response.status, response.statusText);
  return response.json();
})
.then(data => {
  if (data.error) {
    console.error('❌ Error:', data.error.message);
    console.error('Details:', JSON.stringify(data.error, null, 2));
  } else {
    console.log('✅ Success!');
    console.log('Response:', data.candidates[0].content.parts[0].text);
  }
})
.catch(error => {
  console.error('❌ Request failed:', error.message);
});
