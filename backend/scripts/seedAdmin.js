require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/examinationportal');

  const exists = await User.findOne({ email: 'admin@portal.com' });
  if (exists) {
    console.log('Admin already exists: admin@portal.com');
  } else {
    await User.create({
      name: 'System Admin',
      email: 'admin@portal.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Admin created: admin@portal.com / admin123');
  }

  await mongoose.disconnect();
};

seed().catch(console.error);
