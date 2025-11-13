/**
 * Diagnostic script untuk troubleshooting Gemini API "fetch failed" error
 * Jalankan: node diagnose-gemini-connection.js
 */

require('dotenv').config();
const https = require('https');
const dns = require('dns').promises;

console.log('\n🔍 GEMINI API CONNECTION DIAGNOSTICS\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function runDiagnostics() {
  const results = {
    apiKey: false,
    dns: false,
    https: false,
    apiEndpoint: false
  };

  // Test 1: Check API Key
  console.log('1️⃣ Checking GEMINI_API_KEY configuration...');
  if (!process.env.GEMINI_API_KEY) {
    console.log('   ❌ GEMINI_API_KEY not found in .env file');
    console.log('   💡 Add GEMINI_API_KEY=your_key_here to .env file');
    console.log('   🔗 Get key from: https://aistudio.google.com/apikey\n');
  } else {
    console.log('   ✅ API Key found:', process.env.GEMINI_API_KEY.substring(0, 15) + '...');
    console.log('   📝 Length:', process.env.GEMINI_API_KEY.length, 'characters\n');
    results.apiKey = true;
  }

  // Test 2: DNS Resolution
  console.log('2️⃣ Testing DNS resolution...');
  try {
    const addresses = await dns.resolve4('generativelanguage.googleapis.com');
    console.log('   ✅ DNS resolution successful');
    console.log('   📍 Resolved to:', addresses[0], '\n');
    results.dns = true;
  } catch (error) {
    console.log('   ❌ DNS resolution failed:', error.message);
    console.log('   💡 Solutions:');
    console.log('      - Check internet connection');
    console.log('      - Try changing DNS to Google DNS (8.8.8.8)');
    console.log('      - Check if VPN is blocking DNS\n');
  }

  // Test 3: HTTPS Connection
  console.log('3️⃣ Testing HTTPS connection to googleapis.com...');
  await new Promise((resolve) => {
    const req = https.get('https://www.googleapis.com/', (res) => {
      console.log('   ✅ HTTPS connection successful');
      console.log('   📊 Status:', res.statusCode);
      console.log('   🌐 Server:', res.headers.server || 'Unknown\n');
      results.https = true;
      resolve();
    });

    req.on('error', (error) => {
      console.log('   ❌ HTTPS connection failed:', error.message);
      console.log('   💡 Possible causes:');
      console.log('      - Firewall blocking HTTPS');
      console.log('      - Proxy configuration needed');
      console.log('      - VPN blocking Google services');
      console.log('      - Corporate network restrictions\n');
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log('   ❌ Connection timeout (5s)');
      console.log('   💡 Network is too slow or blocked\n');
      req.destroy();
      resolve();
    });
  });

  // Test 4: Gemini API Endpoint (with API key)
  if (results.apiKey) {
    console.log('4️⃣ Testing Gemini API endpoint...');
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    
    await new Promise((resolve) => {
      const req = https.get(apiUrl, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('   ✅ Gemini API is accessible');
            console.log('   📊 Status:', res.statusCode);
            try {
              const parsed = JSON.parse(data);
              if (parsed.models) {
                console.log('   🎯 Available models:', parsed.models.length);
              }
            } catch (e) {
              // Ignore parse errors
            }
            console.log('');
            results.apiEndpoint = true;
          } else {
            console.log('   ❌ Unexpected status:', res.statusCode);
            console.log('   📄 Response:', data.substring(0, 200));
            console.log('');
          }
          resolve();
        });
      });

      req.on('error', (error) => {
        console.log('   ❌ API request failed:', error.message);
        console.log('   💡 This is the same error your app is experiencing');
        console.log('');
        resolve();
      });

      req.setTimeout(10000, () => {
        console.log('   ❌ API request timeout (10s)');
        console.log('');
        req.destroy();
        resolve();
      });
    });
  } else {
    console.log('4️⃣ Skipping API endpoint test (no API key)\n');
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 DIAGNOSTIC SUMMARY\n');
  console.log('   API Key:     ', results.apiKey ? '✅ OK' : '❌ Missing');
  console.log('   DNS:         ', results.dns ? '✅ OK' : '❌ Failed');
  console.log('   HTTPS:       ', results.https ? '✅ OK' : '❌ Failed');
  console.log('   Gemini API:  ', results.apiEndpoint ? '✅ OK' : '❌ Failed');
  console.log('');

  // Recommendations
  const failedCount = Object.values(results).filter(v => !v).length;
  
  if (failedCount === 0) {
    console.log('✅ ALL TESTS PASSED!');
    console.log('   Your Gemini API connection should work.');
    console.log('   If you still get errors, check:');
    console.log('   - Node.js version (need 18+)');
    console.log('   - Server logs for detailed error messages\n');
  } else {
    console.log('⚠️  ', failedCount, 'TEST(S) FAILED\n');
    console.log('🔧 RECOMMENDED ACTIONS:\n');
    
    if (!results.apiKey) {
      console.log('   1. Get API key from https://aistudio.google.com/apikey');
      console.log('   2. Add to .env: GEMINI_API_KEY=your_key_here\n');
    }
    
    if (!results.dns) {
      console.log('   1. Check internet connection');
      console.log('   2. Change DNS to 8.8.8.8 (Google DNS)');
      console.log('   3. Disable VPN temporarily\n');
    }
    
    if (!results.https) {
      console.log('   1. Check firewall settings');
      console.log('   2. Configure proxy if behind corporate network:');
      console.log('      set HTTPS_PROXY=http://proxy:port');
      console.log('   3. Contact network administrator\n');
    }
    
    if (!results.apiEndpoint && results.https) {
      console.log('   1. Verify API key is correct');
      console.log('   2. Check if Gemini API is available in your region');
      console.log('   3. Try using VPN to different country\n');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run diagnostics
runDiagnostics().catch(err => {
  console.error('Unexpected error during diagnostics:', err);
  process.exit(1);
});
