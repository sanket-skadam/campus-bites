const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_canteen');
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Could not connect to MongoDB: ${error.message}`);
    console.log(`[Database Notice] Make sure local MongoDB is running, or provide a MongoDB Atlas cloud URI in server/.env`);
    // Do not crash the server immediately so developers can test routes
  }
};

module.exports = connectDB;

