// backend/cli/commands/health.js
const colors = require('../utils/colors');

module.exports = function registerHealth(program) {
  program
    .command('health')
    .description('Check health of system dependencies')
    .action(async () => {
      console.log(colors.cyan('Running health checks...\n'));

      await checkMongo();
      await checkRedis();
      await checkNeo4j();
      await checkCassandra();

      console.log(colors.green('\nHealth check completed.'));
    });
};

// -------- Checks --------

async function checkMongo() {
  try {
    const mongoose = require('mongoose');
    const { connectMongo } = require('../../src/config/mongo');

    await connectMongo();
    await mongoose.disconnect();

    console.log(colors.green('MongoDB     : OK'));
  } catch (e) {
    console.log(colors.red('MongoDB     : FAIL'));
  }
}

async function checkRedis() {
  try {
    const client = require('../../src/config/redis');

    if (!client.isOpen) await client.connect();
    await client.ping();
    await client.quit();

    console.log(colors.green('Redis       : OK'));
  } catch (e) {
    console.log(colors.red('Redis       : FAIL'));
  }
}

async function checkNeo4j() {
  try {
    const driver = require('../../src/config/neo4j');

    const session = driver.session();
    await session.run('RETURN 1');
    await session.close();
    await driver.close();

    console.log(colors.green('Neo4j       : OK'));
  } catch (e) {
    console.log(colors.red('Neo4j       : FAIL'));
  }
}

async function checkCassandra() {
  try {
    const cassandra = require('../../src/config/cassandra');

    // Your cassandra module exports init/get/shutdown, not the raw client.
    if (typeof cassandra.initCassandra === 'function') {
      await cassandra.initCassandra();
    }

    const client =
      typeof cassandra.getCassandraClient === 'function'
        ? cassandra.getCassandraClient()
        : null;

    if (!client || typeof client.execute !== 'function') {
      throw new Error(
        'Cassandra client not available (getCassandraClient returned null)'
      );
    }

    await client.execute('SELECT now() FROM system.local');

    // Avoid leaving open sockets in a CLI command.
    if (typeof cassandra.shutdownCassandra === 'function') {
      await cassandra.shutdownCassandra();
    }

    console.log(colors.green('Cassandra   : OK'));
  } catch (e) {
    console.log(colors.red('Cassandra   : FAIL'));
    // إذا بدك تشخيص أثناء التطوير، افتحي التعليق:
    // console.log(colors.gray(`  reason: ${e?.message || e}`));
  }
}
