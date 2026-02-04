// backend/tests/analytics.controller.test.js

const mockGetCachedData = jest.fn();
const mockSetCachedData = jest.fn();
const mockRunQuery = jest.fn();

jest.mock('../src/services/cache.service', () => ({
  getCachedData: (...args) => mockGetCachedData(...args),
  setCachedData: (...args) => mockSetCachedData(...args),
}));

jest.mock('../src/services/neo4j.service', () => ({
  runQuery: (...args) => mockRunQuery(...args),
}));

const analyticsController = require('../src/controllers/analytics.controller');

function makeRes() {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    jsonPayload: null,
    json(payload) {
      this.jsonPayload = payload;
      return this;
    },
  };
}

describe('analytics.controller getTopResearchers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns from cache when cached exists', async () => {
    mockGetCachedData.mockResolvedValueOnce({
      limit: 5,
      topResearchers: [{ id: 'r1' }],
    });

    const req = { query: { limit: '5' } };
    const res = makeRes();
    const next = jest.fn();

    await analyticsController.getTopResearchers(req, res, next);

    expect(mockGetCachedData).toHaveBeenCalledWith(
      'analytics:top-researchers:limit=5'
    );
    expect(mockRunQuery).not.toHaveBeenCalled();
    expect(res.jsonPayload).toEqual({
      source: 'cache',
      limit: 5,
      topResearchers: [{ id: 'r1' }],
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('queries db and caches result when not cached', async () => {
    mockGetCachedData.mockResolvedValueOnce(null);

    // Neo4j result shape: { records: [ { get: fn }, ... ] }
    const rec = (map) => ({
      get: (k) => map[k],
    });

    mockRunQuery.mockResolvedValueOnce({
      records: [
        rec({
          id: 'r1',
          name: 'Alice',
          email: 'a@a.com',
          collaborationsCount: 3,
        }),
      ],
    });

    const req = { query: { limit: '3' } };
    const res = makeRes();
    const next = jest.fn();

    await analyticsController.getTopResearchers(req, res, next);

    expect(mockRunQuery).toHaveBeenCalledTimes(1);

    expect(mockSetCachedData).toHaveBeenCalledWith(
      'analytics:top-researchers:limit=3',
      {
        limit: 3,
        topResearchers: [
          {
            id: 'r1',
            name: 'Alice',
            email: 'a@a.com',
            collaborationsCount: 3,
          },
        ],
      },
      30
    );

    expect(res.jsonPayload).toEqual({
      source: 'db',
      limit: 3,
      topResearchers: [
        {
          id: 'r1',
          name: 'Alice',
          email: 'a@a.com',
          collaborationsCount: 3,
        },
      ],
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('uses default limit 5 when limit is invalid', async () => {
    mockGetCachedData.mockResolvedValueOnce({ limit: 5, topResearchers: [] });

    const req = { query: { limit: 'abc' } };
    const res = makeRes();
    const next = jest.fn();

    await analyticsController.getTopResearchers(req, res, next);

    expect(mockGetCachedData).toHaveBeenCalledWith(
      'analytics:top-researchers:limit=5'
    );
    expect(res.jsonPayload.source).toBe('cache');
  });
});
