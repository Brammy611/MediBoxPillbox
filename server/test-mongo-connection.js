const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Testing MongoDB Connection...\n');

// Mask password in output
const maskedUri = process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@');
console.log('📍 Connection String:', maskedUri);
console.log('📁 Database Name:', process.env.MONGO_DB);
console.log('');

async function testConnection() {
  try {
    console.log('⏳ Attempting to connect...');
    
    const startTime = Date.now();
    
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Connected successfully in ${duration}ms`);
    console.log('📊 Connection Details:');
    console.log('   - State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
    console.log('   - Database:', mongoose.connection.db.databaseName);
    console.log('   - Host:', mongoose.connection.host);
    
    // Test a simple query
    console.log('\n🔍 Testing database query...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`, collections.map(c => c.name).join(', '));
    
    await mongoose.connection.close();
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
    
  } catch (err) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', err.message);
    
    if (err.name === 'MongooseServerSelectionError') {
      console.error('\n🔧 Possible causes:');
      console.error('1. MongoDB Atlas cluster is PAUSED - Go to MongoDB Atlas and resume it');
      console.error('2. Your IP address is not whitelisted - Add 0.0.0.0/0 to allow all IPs');
      console.error('3. Internet connection issues - Check your network');
      console.error('4. Wrong connection string - Verify credentials in .env');
    }
    
    process.exit(1);
  }
}

testConnection();
