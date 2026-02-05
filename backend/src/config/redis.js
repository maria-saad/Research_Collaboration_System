const redis = require('redis');

let client = null;

// إذا في Redis مفعّل وعنا host
if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
  client = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  });

  client.on('connect', () => console.log('Redis connected'));
  client.on('error', (err) => console.error('Redis error', err));

  client.connect().catch(console.error);
} else {
  console.log('Redis is disabled (no REDIS_HOST/REDIS_PORT)');
}

module.exports = client;
