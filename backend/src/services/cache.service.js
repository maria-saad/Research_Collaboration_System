const redisClient = require("../config/redis");

const getCachedData = async (key) => {
  const data = await redisClient.get(key);
  if (!data) return null;
  return JSON.parse(data);
};

const setCachedData = async (key, value, ttlSeconds = 60) => {
  await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
};

module.exports = { getCachedData, setCachedData };
