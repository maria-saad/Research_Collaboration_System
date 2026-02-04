require('dotenv').config();

const app = require('./app');
const logger = require('./logger'); // ✅ FIX: no destructuring

// ===== Database configs =====
const { connectMongo } = require('./config/mongo');
const redisClient = require('./config/redis');
const neo4jDriver = require('./config/neo4j');
const { initCassandra, shutdownCassandra } = require('./config/cassandra');

// ===== Server config =====
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    logger.info('Starting Research Collaboration Backend...');

    // 1) MongoDB
    await connectMongo();
    logger.info('MongoDB connected');

    // 2) Redis
    await redisClient.connect();
    logger.info('Redis connected');

    // 3) Cassandra (3-node cluster)
    await initCassandra();
    logger.info('Cassandra initialized');

    // 4) Start HTTP server
    app.listen(PORT, () => {
      logger.info({ url: `http://localhost:${PORT}` }, 'API server started');
    });
  } catch (err) {
    logger.error({ err }, 'Startup error');
    process.exit(1);
  }
})();

// ===== Graceful shutdown =====
process.on('SIGINT', async () => {
  logger.warn('SIGINT received. Shutting down services...');

  try {
    // Cassandra
    await shutdownCassandra();
    logger.info('Cassandra shutdown complete');

    // Redis
    if (redisClient.isOpen) {
      await redisClient.quit();
      logger.info('Redis disconnected');
    }

    // Neo4j
    await neo4jDriver.close();
    logger.info('Neo4j disconnected');

    // MongoDB
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    logger.info('MongoDB disconnected');
  } catch (err) {
    logger.error({ err }, 'Error during shutdown');
  } finally {
    process.exit(0);
  }
});

process.on('unhandledRejection', (reason) => {
  // reason ممكن يكون Error أو أي شيء
  logger.error({ err: reason }, 'unhandledRejection');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'uncaughtException');
  // في production غالبًا الأفضل:
  // process.exit(1);
});
