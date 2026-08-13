const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/identichain';
    console.log(`Connecting to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log('MongoDB connected successfully via URI.');
  } catch (err) {
    console.warn('Local MongoDB connection failed/timed out. Falling back to MongoMemoryServer...');
    try {
      if (!mongoMemoryServer) {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
      }
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`MongoDB connected successfully via MongoMemoryServer: ${memoryUri}`);
    } catch (memErr) {
      console.error('Failed to initialize MongoMemoryServer:', memErr);
    }
  }
};

module.exports = connectDB;

