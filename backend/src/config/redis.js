const redis = require('redis');

let client = null;

async function initRedis() {
  // إذا ما في إعدادات Redis أصلاً → skip
  if (!process.env.REDIS_HOST && !process.env.REDIS_URL) {
    console.log('Redis disabled (no env vars).');
    return null;
  }

  try {
    client = process.env.REDIS_URL
      ? redis.createClient({ url: process.env.REDIS_URL })
      : redis.createClient({
          password: process.env.REDIS_PASSWORD,
          socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT || 6380),
            tls: true,
            reconnectStrategy: false, // مهم: لا يعيد المحاولة للأبد
          },
        });

    client.on('error', (err) =>
      console.log('Redis (optional) error:', err?.code || err?.message)
    );

    await client.connect();
    console.log('Redis connected (optional).');
    return client;
  } catch (e) {
    console.log('Redis disabled (connect failed):', e?.code || e?.message);
    client = null;
    return null;
  }
}

function getRedis() {
  return client; // ممكن تكون null
}

module.exports = { initRedis, getRedis };
