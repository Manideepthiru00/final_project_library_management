import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'config/config.env' });

const MONGO_URI = process.env.MONGO_URI;

console.log('Testing connection to:', MONGO_URI.split('@')[1]); // Log only the host for security

async function testConnection() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'library_management' });
    console.log('✅ Success: Connected to MongoDB Atlas!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error: Could not connect to MongoDB Atlas.');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
