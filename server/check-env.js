require('dotenv').config();

console.log('\n🔍 Environment Variables Check\n');
console.log('================================');

const vars = [
  'MONGO_URI',
  'MONGO_DB',
  'PORT',
  'GEMINI_API_KEY',
  'GEMINI_MODEL',
  'QUALCOMM_AI_API_KEY'
];

vars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive data
    const maskedValue = varName.includes('KEY') || varName.includes('URI') 
      ? `${value.substring(0, 15)}...${value.substring(value.length - 5)}`
      : value;
    console.log(`✅ ${varName.padEnd(25)} : ${maskedValue}`);
  } else {
    console.log(`❌ ${varName.padEnd(25)} : NOT SET`);
  }
});

console.log('================================\n');

// Test if .env file exists
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists at:', envPath);
  const stats = fs.statSync(envPath);
  console.log('   Size:', stats.size, 'bytes');
} else {
  console.log('❌ .env file NOT FOUND at:', envPath);
}
