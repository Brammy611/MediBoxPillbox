const fetch = require('node-fetch');

async function testGeminiEndpoint() {
  const url = 'http://localhost:5000/api/gemini/saran-pola-makan';
  const payload = {
    penyakit: 'Hipertensi',
    daftarObat: ['Amlodipine', 'Simvastatin']
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      console.log('JSON response:', json);
    } catch (err) {
      console.error('Not valid JSON! Raw response:');
      console.error(text);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testGeminiEndpoint();
