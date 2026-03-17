const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 5;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      if (attempt >= maxRetries) {
        console.error('All connection attempts failed — exiting');
        process.exit(1);
      }
      // Exponential backoff: 2s, 4s, 6s, 8s
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
};

module.exports = connectDB;
