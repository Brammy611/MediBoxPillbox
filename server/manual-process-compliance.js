require('dotenv').config();
const mongoose = require('mongoose');

// Load all models first
require('./models/patient');
require('./models/log');
require('./models/kepatuhan');

const { processNewLogs } = require('./schedulers/complianceScheduler');

console.log('🔧 Manual Compliance Processing Trigger\n');

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
.then(async () => {
  console.log('✅ MongoDB Connected\n');
  
  console.log('🚀 Starting manual processing...\n');
  await processNewLogs();
  
  console.log('\n✅ Manual processing complete!');
  process.exit(0);
})
.catch(err => {
  console.error('❌ MongoDB Error:', err.message);
  process.exit(1);
});
