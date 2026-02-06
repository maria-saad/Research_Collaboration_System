// backend/tests/cache.service.test.js

const mockRedisClient = {
  get: jest.fn(),
  setEx: jest.fn(),
  isOpen: true,
};

jest.mock('../src/config/redis', () => ({
  getRedis: jest.fn(() => mockRedisClient),
}));

const {
  getCachedData,
  setCachedData,
} = require('../src/services/cache.service');

describe('cache.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisClient.isOpen = true;
  });

  test('getCachedData returns null when redis returns null/empty', async () => {
    mockRedisClient.get.mockResolvedValueOnce(null);

    const result = await getCachedData('k1');

    expect(result).toBeNull();
    expect(mockRedisClient.get).toHaveBeenCalledWith('k1');
  });

  test('getCachedData parses JSON when value exists', async () => {
    mockRedisClient.get.mockResolvedValueOnce(JSON.stringify({ a: 1 }));

    const result = await getCachedData('k2');

    expect(result).toEqual({ a: 1 });
    expect(mockRedisClient.get).toHaveBeenCalledWith('k2');
  });

  test('setCachedData stores stringified value with default TTL 60', async () => {
    await setCachedData('k3', { ok: true });

    expect(mockRedisClient.setEx).toHaveBeenCalledWith(
      'k3',
      60,
      JSON.stringify({ ok: true })
    );
  });

  test('setCachedData stores with provided TTL', async () => {
    await setCachedData('k4', { x: 10 }, 30);

    expect(mockRedisClient.setEx).toHaveBeenCalledWith(
      'k4',
      30,
      JSON.stringify({ x: 10 })
    );
  });

  test('returns null when redis client not open', async () => {
    mockRedisClient.isOpen = false;
    mockRedisClient.get.mockResolvedValueOnce(JSON.stringify({ a: 1 }));

    const result = await getCachedData('k5');

    expect(result).toBeNull();
    expect(mockRedisClient.get).not.toHaveBeenCalled();
  });
});
