const chalk = require('chalk');
// const path = require('path');

module.exports = function registerCache(program) {
  const cache = program.command('cache').description('Cache operations');

  cache
        .command('clear')
    .description('Clear Redis cache (FLUSHDB)')
    .action(async () => {
      // ensure absolute path to backend/config/redis.js
      // const redisPath = path.resolve(process.cwd(), 'config', 'redis.js');
      const client = require('../../src/config/redis');

      try {
        if (!client.isOpen) await client.connect();

        await client.flushDb();
        console.log(chalk.green('Redis cache cleared (FLUSHDB).'));

        await client.quit();
      } catch (e) {
        console.error(chalk.red('Failed to clear Redis cache:'), e.message);
        try {
          if (client.isOpen) await client.quit();
        } catch {}
        process.exit(1);
      }
    });
};
