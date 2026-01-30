const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // 1) Validation (خفيف)
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: 'name, email, password are required' });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: 'password must be at least 6 characters' });
  }

  // 2) Email unique
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing)
    return res.status(409).json({ message: 'email already in use' });

  // 3) Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // 4) Create user
  // ملاحظة: لتفادي إن أي شخص يسجّل حاله admin، خلّيه researcher فقط
  const safeRole = role === 'admin' ? 'researcher' : 'researcher';

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: safeRole,
  });

  // 5) Token
  const token = signToken(user);

  return res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: 'invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'invalid credentials' });

  const token = signToken(user);

  return res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};
