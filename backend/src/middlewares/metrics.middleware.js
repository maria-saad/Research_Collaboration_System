const { httpRequestsTotal, httpRequestDurationMs } = require("../metrics");

module.exports = function metricsMiddleware(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    const path = req.route?.path
      ? req.baseUrl + req.route.path
      : req.path;

    const labels = {
      method: req.method,
      path,
      status: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels, 1);
    httpRequestDurationMs.observe(labels, duration);
  });

  next();
};
