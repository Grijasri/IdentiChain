const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log(`Connecting to MongoDB...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log('MongoDB connected successfully via MONGODB_URI.');
      return;
    } catch (err) {
      console.warn('MongoDB connection error:', err.message);
    }
  }

  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/identichain', { serverSelectionTimeoutMS: 1500 });
    console.log('MongoDB connected successfully via local URI.');
    return;
  } catch (localErr) {
    // Local MongoDB unavailable
  }

  try {
    if (!mongoMemoryServer) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
    }
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`MongoDB connected successfully via MongoMemoryServer: ${memoryUri}`);
  } catch (memErr) {
    console.warn('MongoMemoryServer fallback unavailable (normal on serverless):', memErr.message);
  }
};

module.exports = connectDB;


