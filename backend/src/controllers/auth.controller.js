const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Researcher = require('../models/Researcher');

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ✅ REGISTER: creates User + linked Researcher
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // 1) Validation
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

  const normalizedEmail = email.toLowerCase();

  // 2) Check user unique
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ message: 'email already in use' });
  }

  // 3) Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // 4) Create user (prevent admin via register)
  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: 'researcher',
  });

  try {
    // 5) Create linked researcher
    // Researcher schema requires name + email only; others have defaults ✅
    const researcher = await Researcher.create({
      name,
      email: normalizedEmail,
      affiliation: '',
      interests: [],
      neo4jId: '',
    });

    // 6) Link user -> researcher
    user.researcherId = researcher._id;
    await user.save();

    // 7) Token
    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        researcherId: user.researcherId,
      },
    });
  } catch (err) {
    // ✅ rollback: if researcher creation failed, remove the user to keep consistency
    await User.deleteOne({ _id: user._id });
    // NOTE: avoid leaking internal errors
    return res
      .status(500)
      .json({ message: 'failed to create researcher profile' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(401).json({ message: 'invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'invalid credentials' });

  const token = signToken(user);

  return res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      researcherId: user.researcherId || null,
    },
  });
};

// ✅ GET /api/auth/me
exports.me = async (req, res) => {
  // req.user set by authenticate middleware
  const user = await User.findById(req.user.id)
    .select('-passwordHash')
    .populate('researcherId', 'name email affiliation interests neo4jId');

  if (!user) return res.status(404).json({ message: 'user not found' });

  return res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      researcher: user.researcherId || null, // populated object or null
      createdAt: user.createdAt,
    },
  });
};
