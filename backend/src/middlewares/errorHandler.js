function errorHandler(err, req, res, _next) {
  console.error(err);

  const status = err.statusCode || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
}

module.exports = { errorHandler };
