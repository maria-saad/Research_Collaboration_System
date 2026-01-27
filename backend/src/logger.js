const { createLogger, format, transports } = require('winston');

const isProd = process.env.NODE_ENV === 'production';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    isProd
      ? format.json()
      : format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr =
            meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
        })
  ),
  transports: [new transports.Console()],
});

module.exports = { logger };
