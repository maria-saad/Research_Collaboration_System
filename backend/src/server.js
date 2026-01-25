require('dotenv').config();

const app = require('./app');
const logger = require('./logger');

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

    // 1️⃣ MongoDB
    await connectMongo();

    // 2️⃣ Redis
    await redisClient.connect();

    // 3️⃣ Cassandra (3-node cluster)
    await initCassandra();

    // 4️⃣ Start HTTP server
    app.listen(PORT, () => {
      console.log(`✅ API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error(`Startup error: ${err.message}`);
    process.exit(1);
  }
})();

// ===== Graceful shutdown =====
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down services...');

  try {
    // Cassandra
    await shutdownCassandra();

    // Redis
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log('🟥 Redis disconnected');
    }

    // Neo4j
    await neo4jDriver.close();
    console.log('🟦 Neo4j disconnected');

    // MongoDB
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('🟩 MongoDB disconnected');
  } catch (err) {
    console.error('⚠️ Error during shutdown:', err);
  } finally {
    process.exit(0);
  }
});
