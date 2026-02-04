// tests/profile.integration.test.js

// ✅ حل uuid ESM قبل تحميل app
jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

// ✅ امنع أي اتصال Neo4j فعلي
jest.mock('neo4j-driver', () => ({
  auth: { basic: jest.fn(() => ({})) },
  driver: jest.fn(() => ({
    session: jest.fn(() => ({ run: jest.fn(), close: jest.fn() })),
    close: jest.fn(),
  })),
}));

// ✅ أهم سطر: mock للـ neo4j.service اللي profile.controller غالبًا بيستخدمه
jest.mock('../src/services/neo4j.service', () => ({
  runQuery: jest.fn(async () => ({ records: [] })), // ✅ حتى ما يوقع عند result.records
}));

const mockGetCachedData = jest.fn();
const mockSetCachedData = jest.fn();
jest.mock('../src/services/cache.service', () => ({
  getCachedData: (...args) => mockGetCachedData(...args),
  setCachedData: (...args) => mockSetCachedData(...args),
}));

// Mock models used by profile controller
const mockResearcherFindById = jest.fn();
jest.mock('../src/models/Researcher', () => ({
  findById: (...args) => mockResearcherFindById(...args),
}));

const mockProjectFind = jest.fn();
jest.mock('../src/models/Project', () => ({
  find: (...args) => mockProjectFind(...args),
}));

const mockPublicationFind = jest.fn();
jest.mock('../src/models/Publication', () => ({
  find: (...args) => mockPublicationFind(...args),
}));

const request = require('supertest');
const app = require('../src/app');

describe('Profile API (integration) - cached + db', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /api/researchers/:id/profile returns from cache when cached', async () => {
    mockGetCachedData.mockResolvedValue({
      source: 'cache',
      researcher: { _id: 'r1', name: 'Cached R' },
      projects: [],
      publications: [],
    });

    const res = await request(app).get('/api/researchers/r1/profile');

    expect(res.statusCode).toBe(200);
    expect(res.body.source).toBe('cache');
    expect(mockSetCachedData).not.toHaveBeenCalled();
  });

  test('GET /api/researchers/:id/profile returns from db when not cached', async () => {
    mockGetCachedData.mockResolvedValue(null);

    // researcher
    mockResearcherFindById.mockReturnValue({
      lean: async () => ({ _id: 'r1', name: 'DB R', email: 'r@x.com' }),
    });

    // projects find chain (ممكن كودك يستخدم sort/lean)
    mockProjectFind.mockReturnValue({
      sort: () => ({
        lean: async () => [{ _id: 'p1', title: 'P1' }],
      }),
    });

    // publications find chain
    mockPublicationFind.mockReturnValue({
      sort: () => ({
        lean: async () => [{ _id: 'pub1', title: 'Pub1', year: 2024 }],
      }),
    });

    const res = await request(app).get('/api/researchers/r1/profile');

    expect(res.statusCode).toBe(200);
    // حسب controller عندك ممكن يكتب source = "db" أو ما يكتب
    if (res.body.source) expect(res.body.source).toBe('db');

    expect(res.body).toEqual(
      expect.objectContaining({
        researcher: expect.objectContaining({ _id: 'r1' }),
      })
    );
    expect(mockSetCachedData).toHaveBeenCalled();
  });
});
