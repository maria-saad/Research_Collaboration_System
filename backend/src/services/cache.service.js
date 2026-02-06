// backend/src/services/cache.service.js
const { getRedis } = require('../config/redis');

const getCachedData = async (key) => {
  const client = getRedis();

  // Redis optional: إذا مش موجود/مش متصل ما نكسر الـ API
  if (!client || !client.isOpen) return null;

  const data = await client.get(key);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch (e) {
    // لو data خربانة، اعتبريه مش موجود
    return null;
  }
};

const setCachedData = async (key, value, ttlSeconds = 60) => {
  const client = getRedis();

  // Redis optional: إذا مش موجود/مش متصل تجاهلي التخزين
  if (!client || !client.isOpen) return;

  // redis v4: set with EX or use setEx
  // عندك كنتي مستخدمة setEx، تمام:
  await client.setEx(key, ttlSeconds, JSON.stringify(value));
};

module.exports = { getCachedData, setCachedData };
