const client = require("prom-client");

client.collectDefaultMetrics({ prefix: "rcs_" });

const httpRequestsTotal = new client.Counter({
  name: "rcs_http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "path", "status"],
});

const httpRequestDurationMs = new client.Histogram({
  name: "rcs_http_request_duration_ms",
  help: "HTTP request duration in ms",
  labelNames: ["method", "path", "status"],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
});

module.exports = { client, httpRequestsTotal, httpRequestDurationMs };
