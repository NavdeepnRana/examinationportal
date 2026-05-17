const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load .env before reading connection string (safe if server.js already called config)
dotenv.config({ path: path.join(__dirname, '../.env') });

const getMongoUri = () =>
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/examinationportal';

const connectDB = async () => {
  const uri = getMongoUri();

  if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
    console.warn('Warning: MONGO_URI / MONGODB_URI not set in .env — using localhost fallback');
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected:', mongoose.connection.name);
};

module.exports = connectDB;
