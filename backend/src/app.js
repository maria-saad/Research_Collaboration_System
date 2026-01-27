const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');
const { requestLogger } = require('./middlewares/requestLogger');

const app = express();

app.use(cors());
app.use(express.json());

// 1) Winston request logger (قبل routes)
app.use(requestLogger);

// 2) Morgan (اختياري) — إذا بدك تخليه، خليّه dev فقط عشان ما يكرر في production
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'research-collab-backend' });
});

// 3) API routes
app.use('/api', routes);

// 4) Error handler (آخر شيء)
app.use(errorHandler);

module.exports = app;
