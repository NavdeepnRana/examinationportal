const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/examinationportal';
  await mongoose.connect(uri);
  console.log('MongoDB connected:', mongoose.connection.name);
};

module.exports = connectDB;
