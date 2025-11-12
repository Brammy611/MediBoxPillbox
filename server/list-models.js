// List available models
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const LIST_MODELS_URL = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;

console.log('=== LISTING AVAILABLE MODELS ===\n');

fetch(LIST_MODELS_URL)
.then(response => {
  console.log('Status:', response.status, response.statusText);
  return response.json();
})
.then(data => {
  if (data.error) {
    console.error('❌ Error:', data.error.message);
    console.error('\nPossible reasons:');
    console.error('1. API Key might be invalid or expired');
    console.error('2. API Key might not have proper permissions');
    console.error('3. Gemini API might not be enabled for this key');
    console.error('\nPlease check: https://makersuite.google.com/app/apikey');
  } else if (data.models) {
    console.log('✅ Available models:\n');
    data.models.forEach(model => {
      console.log(`- ${model.name}`);
      console.log(`  Display Name: ${model.displayName}`);
      console.log(`  Supported methods: ${model.supportedGenerationMethods.join(', ')}\n`);
    });
  } else {
    console.log('Response:', JSON.stringify(data, null, 2));
  }
})
.catch(error => {
  console.error('❌ Request failed:', error.message);
});
