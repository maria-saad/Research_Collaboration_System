const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');
const { requestLogger } = require('./middlewares/requestLogger');

// ✅ Monitoring (Prometheus metrics)
const metricsMiddleware = require('./middlewares/metrics.middleware');
const { client } = require('./metrics');

const app = express();
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./docs/swagger');

app.use(cors());
app.use(express.json());

// ✅ لازم يكون قبل routes عشان يحسب كل الريكوستات
app.use(metricsMiddleware);

// Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

// 1) Request logger (قبل routes)
app.use(requestLogger);

// 2) Morgan (اختياري) — dev فقط عشان ما يكرر في production
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: research-collab-backend
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'research-collab-backend' });
});

// ✅ Prometheus metrics endpoint
app.get('/api/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// 3) API routes
app.use('/api', routes);

// 4) Error handler (آخر شيء)
app.use(errorHandler);

module.exports = app;
