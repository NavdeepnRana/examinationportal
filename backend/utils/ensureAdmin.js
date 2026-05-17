const User = require('../models/User');

/**
 * Creates default admin if none exists. Safe to call on every server start.
 * Configure via ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME in .env / Render dashboard.
 */
const ensureAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || 'admin@portal.com').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'System Admin';

  const existing = await User.findOne({ email, role: 'admin' });
  if (existing) {
    console.log(`Admin account ready: ${email}`);
    return existing;
  }

  const admin = await User.create({
    name,
    email,
    password,
    role: 'admin',
    isActive: true,
  });

  console.log(`Admin created: ${email}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('Using default password "admin123" — set ADMIN_PASSWORD in production (Render env vars).');
  }

  return admin;
};

module.exports = ensureAdmin;
