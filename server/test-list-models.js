const fetch = require('node-fetch');
require('dotenv').config({ path: __dirname + '/.env' });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Gemini API key not found in .env');
    return;
  }
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!data.models) {
      console.error('No models found or API error:', data);
      return;
    }
    data.models.forEach(model => {
      console.log('Model:', model.name);
      if (model.supportedGenerationMethods) {
        console.log('  Supported methods:', model.supportedGenerationMethods.join(', '));
      }
    });
  } catch (err) {
    console.error('Error calling ListModels:', err);
  }
}

listModels();