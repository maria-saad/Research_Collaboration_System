const { logger } = require('../logger');

function errorHandler(err, req, res, next) {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
}

module.exports = { errorHandler };
