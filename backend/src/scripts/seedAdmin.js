require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

async function seedAdmin() {
  const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

  if (!MONGO_URI) throw new Error('MONGO_URI missing');
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD)
    throw new Error('ADMIN_EMAIL/ADMIN_PASSWORD missing');

  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');

  const email = ADMIN_EMAIL.toLowerCase();

  const existing = await User.findOne({ email });
  if (existing) {
    // ✅ idempotent: update role to admin if needed
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`Updated existing user to admin: ${email}`);
    } else {
      console.log(`Admin already exists: ${email}`);
    }
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await User.create({
    name: ADMIN_NAME || 'Admin',
    email,
    passwordHash,
    role: 'admin',
    researcherId: null, // admin مش لازم يكون researcher
  });

  console.log(`Created admin: ${email}`);
  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error('Seed admin failed:', err);
  process.exit(1);
});
