require('dotenv').config(); // Load .env
const mongoose = require('mongoose');

// MongoDB Connection
const connectMongoDB = async () => {
  try {
    const mongoURI ='mongodb://'+process.env.DB_USER+":"+process.env.DB_PASSWORD+'@localhost:27017/cloudsecure?authSource=admin';
    console.log('Connecting to MongoDB at:', mongoURI); // Debug
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = {
  connectMongoDB,
};