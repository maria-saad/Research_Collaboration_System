const jwt = require('jsonwebtoken');

module.exports = function authenticate(req, res, next) {
  const header = req.headers.authorization;

  // لازم: Authorization: Bearer <token>
  if (!header || !header.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'missing or invalid Authorization header' });
  }

  const token = header.substring('Bearer '.length);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // payload: { sub, role, email, iat, exp }
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'invalid or expired token' });
  }
};
