module.exports = function authorize(allowedRoles = []) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'unauthenticated' });

    if (roles.length === 0) return next(); // لو ما حددنا roles = اسمحي

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'forbidden: insufficient role' });
    }

    return next();
  };
};
