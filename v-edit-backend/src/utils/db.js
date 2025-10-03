import mongoose from 'mongoose';

async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  const isValidScheme = uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
  if (!isValidScheme) {
    throw new Error('Invalid MONGODB_URI: must start with "mongodb://" or "mongodb+srv://"');
  }

  const masked = uri.replace(/(:\/\/)([^:@/]+)(:([^@/]*))?@/, (_, p1) => `${p1}***:***@`);
  console.log('Connecting to MongoDB with URI:', masked);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default connectDb;


