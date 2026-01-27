const { logger } = require('../logger');

// إخفاء حقول حساسة إن احتجنا لاحقًا
const redact = (obj = {}) => {
  const clone = { ...obj };
  const sensitiveKeys = [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'authorization',
  ];
  for (const k of sensitiveKeys) {
    if (k in clone) clone[k] = '[REDACTED]';
  }
  return clone;
};

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;

    logger.info('HTTP Request', {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      // اختياري: context إضافي بدون حساسية
      ip: req.ip,
      // لا تسجلي body بشكل افتراضي (ممكن يحتوي بيانات حساسة)
      // query: req.query,
      // body: redact(req.body),
    });
  });

  next();
};

module.exports = { requestLogger };
