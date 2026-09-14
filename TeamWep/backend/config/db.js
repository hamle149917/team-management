const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.includes('PASTE_YOUR_MONGODB_URL_HERE')) {
    console.warn('MongoDB URI is not configured. Starting in demo mode without database connection.');
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      dbName: 'team-management',
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
  }
};

module.exports = connectDB;
