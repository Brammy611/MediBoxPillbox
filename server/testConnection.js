const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Testing MongoDB Connection...');
console.log('📍 MONGO_URI:', process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@')); // Hide password

const testConnection = async () => {
  try {
    console.log('\n⏳ Attempting to connect...');
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB Connection Successful!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    
    // Test query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Collections found: ${collections.length}`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed!');
    console.error('Error:', error.message);
    
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Check your internet connection');
    console.log('2. Verify MongoDB Atlas credentials');
    console.log('3. Whitelist your IP address in MongoDB Atlas:');
    console.log('   - Go to: https://cloud.mongodb.com');
    console.log('   - Navigate to: Network Access');
    console.log('   - Add IP Address: 0.0.0.0/0 (Allow all IPs for testing)');
    console.log('4. Check if username/password contains special characters');
    console.log('   - If yes, URL encode them');
    
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed.');
  }
};

testConnection();
