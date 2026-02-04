// backend/tests/cache.service.test.js

jest.mock('../src/config/redis', () => ({
  get: jest.fn(),
  setEx: jest.fn(),
}));

const redisClient = require('../src/config/redis');
const {
  getCachedData,
  setCachedData,
} = require('../src/services/cache.service');

describe('cache.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getCachedData returns null when redis returns null/empty', async () => {
    redisClient.get.mockResolvedValueOnce(null);

    const result = await getCachedData('k1');

    expect(result).toBeNull();
    expect(redisClient.get).toHaveBeenCalledWith('k1');
  });

  test('getCachedData parses JSON when value exists', async () => {
    redisClient.get.mockResolvedValueOnce(JSON.stringify({ a: 1 }));

    const result = await getCachedData('k2');

    expect(result).toEqual({ a: 1 });
    expect(redisClient.get).toHaveBeenCalledWith('k2');
  });

  test('setCachedData stores stringified value with default TTL 60', async () => {
    await setCachedData('k3', { ok: true });

    expect(redisClient.setEx).toHaveBeenCalledWith(
      'k3',
      60,
      JSON.stringify({ ok: true })
    );
  });

  test('setCachedData stores with provided TTL', async () => {
    await setCachedData('k4', { x: 10 }, 30);

    expect(redisClient.setEx).toHaveBeenCalledWith(
      'k4',
      30,
      JSON.stringify({ x: 10 })
    );
  });
});
