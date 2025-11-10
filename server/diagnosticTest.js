const dns = require('dns');
const https = require('https');

console.log('🔍 Diagnostic Test untuk MongoDB Atlas Connection\n');

// Test 1: Check Internet Connection
console.log('1️⃣ Testing Internet Connection...');
https.get('https://www.google.com', (res) => {
  console.log('   ✅ Internet connection: OK');
  console.log(`   Status Code: ${res.statusCode}\n`);
  
  // Test 2: DNS Resolution
  console.log('2️⃣ Testing DNS Resolution for MongoDB Atlas...');
  dns.resolve4('cluster0.zgafu.mongodb.net', (err, addresses) => {
    if (err) {
      console.log('   ❌ DNS Resolution failed');
      console.log('   Error:', err.message);
      console.log('\n   💡 Possible solutions:');
      console.log('      - Try changing DNS to 8.8.8.8 (Google DNS)');
      console.log('      - Check firewall/antivirus settings');
      console.log('      - Try using mobile hotspot');
    } else {
      console.log('   ✅ DNS Resolution: OK');
      console.log('   Resolved IPs:', addresses);
      console.log('\n   ⚠️  DNS works but connection fails = IP Whitelist issue');
      console.log('   📝 Action Required:');
      console.log('      1. Go to: https://cloud.mongodb.com');
      console.log('      2. Select your cluster');
      console.log('      3. Click "Network Access" (left sidebar)');
      console.log('      4. Click "Add IP Address"');
      console.log('      5. Choose "Allow Access from Anywhere" (0.0.0.0/0)');
      console.log('      6. Wait 1-2 minutes for changes to propagate');
    }
  });
}).on('error', (err) => {
  console.log('   ❌ Internet connection: FAILED');
  console.log('   Error:', err.message);
  console.log('   💡 Please check your internet connection');
});
