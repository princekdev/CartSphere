/**
 * Seed script — creates or updates the admin account.
 *
 * Usage:
 *   node utils/createAdmin.js
 *
 * Reads from .env:
 *   ADMIN_EMAIL    — the Gmail address that will be the admin
 *   ADMIN_PASSWORD — password for that account
 *
 * This only needs to be run ONCE after you first deploy.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');

(async () => {
  const email    = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name     = process.env.ADMIN_NAME || 'Admin';

  if (!email || !password) {
    console.error('❌  Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file first.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected to MongoDB');

  const existing = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (existing) {
    existing.isAdmin = true;
    existing.isActive = true;
    // Only reset password if ADMIN_PASSWORD changed
    if (!(await existing.comparePassword(password))) {
      existing.password = password;
      console.log('🔑  Password updated');
    }
    await existing.save();
    console.log(`✅  Admin account already exists — synced.`);
  } else {
    await User.create({ name, email: email.toLowerCase(), password, isAdmin: true });
    console.log(`✅  Admin account created`);
  }

  console.log(`\n   Email:    ${email}`);
  console.log(`   Panel:    http://localhost:5173/login  (email auto-redirects to /admin)`);
  console.log(`\n⚠️   Keep ADMIN_EMAIL and ADMIN_PASSWORD secret — never commit .env to git!\n`);
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
