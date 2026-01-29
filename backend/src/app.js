const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');
const { requestLogger } = require('./middlewares/requestLogger');

const app = express();
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./docs/swagger');

app.use(cors());
app.use(express.json());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

// 1) Winston request logger (قبل routes)
app.use(requestLogger);

// 2) Morgan (اختياري) — إذا بدك تخليه، خليّه dev فقط عشان ما يكرر في production
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

// 3) API routes
app.use('/api', routes);

// 4) Error handler (آخر شيء)
app.use(errorHandler);

module.exports = app;
