// backend/src/server.js
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = require('./app');
const { logger } = require('./logger');

// ===== Database configs =====
const { connectMongo } = require('./config/mongo');
const { initRedis, getRedis } = require('./config/redis');
const neo4jDriver = require('./config/neo4j');
const { initCassandra, shutdownCassandra } = require('./config/cassandra');

// ===== Server config =====
const PORT = process.env.PORT || 5000;

// Cassandra toggle (اختياري)
const cassandraEnabled =
  String(process.env.CASSANDRA_ENABLED).toLowerCase() === 'true';

// Redis toggle (اختياري)
const redisEnabledByEnv =
  String(process.env.REDIS_ENABLED ?? 'true').toLowerCase() === 'true';

// إذا ما عندك إعدادات Redis أصلاً، عطّليه تلقائياً
const hasRedisConfig =
  Boolean(process.env.REDIS_URL) ||
  (Boolean(process.env.REDIS_HOST) && Boolean(process.env.REDIS_PORT));

let redisEnabled = redisEnabledByEnv && hasRedisConfig;

(async () => {
  try {
    logger.info('Starting Research Collaboration Backend...');

    // 1) MongoDB
    await connectMongo();
    logger.info('MongoDB connected');

    // 2) Redis (optional)
    if (redisEnabled) {
      const client = await initRedis(); // بيرجع client أو null
      if (client) {
        logger.info('Redis connected (optional).');
      } else {
        redisEnabled = false;
        logger.warn('Redis disabled (optional). Continuing without it.');
      }
    } else {
      logger.info(
        'Redis disabled by env/config (REDIS_ENABLED=false or missing vars)'
      );
    }

    // 3) Cassandra (optional)
    if (cassandraEnabled) {
      try {
        await initCassandra();
        logger.info('Cassandra initialized');
      } catch (err) {
        logger.warn('Cassandra not ready, continuing without it', {
          message: err.message,
        });
      }
    } else {
      logger.info('Cassandra disabled by env (CASSANDRA_ENABLED=false)');
    }

    // 4) Start HTTP server
    app.listen(PORT, () => {
      logger.info('API server started', { url: `http://localhost:${PORT}` });
    });
  } catch (err) {
    logger.error('Startup error', { message: err.message, stack: err.stack });
    process.exit(1);
  }
})();

// ===== Graceful shutdown =====
process.on('SIGINT', async () => {
  logger.warn('SIGINT received. Shutting down services...');

  try {
    // Cassandra (optional)
    if (cassandraEnabled) {
      await shutdownCassandra();
      logger.info('Cassandra shutdown complete');
    }

    // Redis (optional)
    const r = getRedis();
    if (r?.isOpen) {
      await r.quit();
      logger.info('Redis disconnected');
    }

    // Neo4j
    if (neo4jDriver) {
      await neo4jDriver.close();
      logger.info('Neo4j disconnected');
    } else {
      logger.info('Neo4j was disabled');
    }

    // MongoDB
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    logger.info('MongoDB disconnected');
  } catch (err) {
    logger.error('Error during shutdown', {
      message: err.message,
      stack: err.stack,
    });
  } finally {
    process.exit(0);
  }
});

process.on('unhandledRejection', (reason) => {
  logger.error('unhandledRejection', { reason });
});

process.on('uncaughtException', (err) => {
  logger.error('uncaughtException', { message: err.message, stack: err.stack });
  // في production غالبًا الأفضل:
  // process.exit(1);
});
