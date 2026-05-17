const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const ensureAdmin = require('../utils/ensureAdmin');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seed = async () => {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/examinationportal';

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await ensureAdmin();

  await mongoose.disconnect();
  console.log('Seed complete.');
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
