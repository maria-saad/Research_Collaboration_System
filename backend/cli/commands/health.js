const chalk = require('chalk');

module.exports = function registerHealth(program) {
  program
    .command('health')
    .description('Check health of system dependencies')
    .action(async () => {
      console.log(chalk.cyan('Running health checks...\n'));

      await checkMongo();
      await checkRedis();
      await checkNeo4j();
      await checkCassandra();

      console.log(chalk.green('\nHealth check completed.'));
    });
};

// -------- Checks --------

async function checkMongo() {
  try {
    const mongoose = require('mongoose');
    const { connectMongo } = require('../../src/config/mongo');

    await connectMongo();
    await mongoose.disconnect();

    console.log(chalk.green('MongoDB     : OK'));
  } catch {
    console.log(chalk.red('MongoDB     : FAIL'));
  }
}

async function checkRedis() {
  try {
    const client = require('../../src/config/redis');

    if (!client.isOpen) await client.connect();
    await client.ping();
    await client.quit();

    console.log(chalk.green('Redis       : OK'));
  } catch {
    console.log(chalk.red('Redis       : FAIL'));
  }
}

async function checkNeo4j() {
  try {
    const driver = require('../../src/config/neo4j');

    const session = driver.session();
    await session.run('RETURN 1');
    await session.close();
    await driver.close();

    console.log(chalk.green('Neo4j       : OK'));
  } catch {
    console.log(chalk.red('Neo4j       : FAIL'));
  }
}

async function checkCassandra() {
  try {
    const client = require('../../src/config/cassandra');

    await client.execute('SELECT now() FROM system.local');

    console.log(chalk.green('Cassandra   : OK'));
  } catch {
    console.log(chalk.red('Cassandra   : FAIL'));
  }
}
