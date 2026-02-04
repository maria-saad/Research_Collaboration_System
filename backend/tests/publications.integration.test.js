// tests/publications.integration.test.js

// ✅ لازم يكون قبل require(app)
// 1) Mock neo4j-driver (عشان ما يعتمد على env vars)
jest.mock('neo4j-driver', () => ({
  auth: { basic: jest.fn(() => ({})) },
  driver: jest.fn(() => ({
    session: jest.fn(() => ({
      run: jest.fn(),
      close: jest.fn(),
    })),
    close: jest.fn(),
  })),
}));

// 2) Mock uuid (عشان مشكلة ESM في uuid)
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

// 3) Mock Redis cache service (used by getRecent)
const mockGetCachedData = jest.fn();
const mockSetCachedData = jest.fn();

jest.mock('../src/services/cache.service', () => ({
  getCachedData: (...args) => mockGetCachedData(...args),
  setCachedData: (...args) => mockSetCachedData(...args),
}));

// 4) Mock Publication model (Mongoose style chains)
const mockFind = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();

jest.mock('../src/models/Publication', () => ({
  find: (...args) => mockFind(...args),
  findById: (...args) => mockFindById(...args),
  create: (...args) => mockCreate(...args),
  findByIdAndUpdate: (...args) => mockFindByIdAndUpdate(...args),
  findByIdAndDelete: (...args) => mockFindByIdAndDelete(...args),
}));

const request = require('supertest');
const app = require('../src/app');

describe('Publications API (integration) - mocked Mongo & Redis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/publications returns list', async () => {
    const docs = [
      { _id: 'pub1', title: 'P1', year: 2024, authors: ['r1'] },
      { _id: 'pub2', title: 'P2', year: 2023, authors: ['r2'] },
    ];

    // Publication.find().populate().populate().sort().lean()
    mockFind.mockReturnValue({
      populate: () => ({
        populate: () => ({
          sort: () => ({
            lean: async () => docs,
          }),
        }),
      }),
    });

    const res = await request(app).get('/api/publications');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
  });

  test('GET /api/publications/:id returns single publication or 404', async () => {
    const doc = { _id: 'pub1', title: 'P1', year: 2024, authors: ['r1'] };

    // findById().populate().populate().lean()
    mockFindById.mockImplementation((id) => ({
      populate: () => ({
        populate: () => ({
          lean: async () => (id === 'pub1' ? doc : null),
        }),
      }),
    }));

    const ok = await request(app).get('/api/publications/pub1');
    expect(ok.statusCode).toBe(200);
    expect(ok.body).toEqual(expect.objectContaining({ _id: 'pub1' }));

    const notFound = await request(app).get('/api/publications/does-not-exist');
    expect(notFound.statusCode).toBe(404);
  });

  test('POST /api/publications creates publication (valid body)', async () => {
    // ✅ لازم authors array فيها عنصر
    const created = {
      _id: 'pub3',
      title: 'New Pub',
      year: 2025,
      authors: ['r1'],
    };
    mockCreate.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/publications')
      .send({
        title: 'New Pub',
        year: 2025,
        authors: ['r1'], // ✅ required by schema
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(expect.objectContaining({ _id: 'pub3' }));
  });

  test('POST /api/publications returns 400 when invalid (missing authors)', async () => {
    const res = await request(app).post('/api/publications').send({
      title: 'Xx',
      year: 2025,
      // authors missing => 400
    });

    expect(res.statusCode).toBe(400);
  });

  test('PUT /api/publications/:id updates publication', async () => {
    const updated = {
      _id: 'pub1',
      title: 'Updated',
      year: 2024,
      authors: ['r1'],
    };

    mockFindByIdAndUpdate.mockImplementation((id) => ({
      lean: async () => (id === 'pub1' ? updated : null),
    }));

    const res = await request(app).put('/api/publications/pub1').send({
      title: 'Updated', // ✅ valid for update schema (min 2)
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ title: 'Updated' }));
  });

  test('PUT /api/publications/:id returns 404 if not found (but valid body)', async () => {
    mockFindByIdAndUpdate.mockImplementation(() => ({
      lean: async () => null,
    }));

    const res = await request(app)
      .put('/api/publications/does-not-exist')
      .send({
        title: 'Valid Title', // ✅ لازم valid عشان ما يرجع 400
      });

    expect(res.statusCode).toBe(404);
  });

  test('DELETE /api/publications/:id deletes publication or 404', async () => {
    mockFindByIdAndDelete.mockImplementation((id) => ({
      lean: async () => (id === 'pub1' ? { _id: 'pub1' } : null),
    }));

    const ok = await request(app).delete('/api/publications/pub1');
    expect([200, 204]).toContain(ok.statusCode);

    const notFound = await request(app).delete('/api/publications/x');
    expect(notFound.statusCode).toBe(404);
  });

  test('GET /api/publications/recent returns from cache when cached', async () => {
    mockGetCachedData.mockResolvedValue([
      { _id: 'pub1', title: 'Cached', year: 2024 },
    ]);

    const res = await request(app).get('/api/publications/recent?limit=5');

    expect(res.statusCode).toBe(200);
    expect(res.body.source).toBe('cache');
    expect(Array.isArray(res.body.publications)).toBe(true);
  });

  test('GET /api/publications/recent returns from db when not cached', async () => {
    mockGetCachedData.mockResolvedValue(null);

    // Publication.find().sort().limit().populate().lean()
    mockFind.mockReturnValue({
      sort: () => ({
        limit: () => ({
          populate: () => ({
            lean: async () => [{ _id: 'pub2', title: 'DB', year: 2023 }],
          }),
        }),
      }),
    });

    const res = await request(app).get('/api/publications/recent?limit=3');

    expect(res.statusCode).toBe(200);
    expect(res.body.source).toBe('db');
    expect(res.body.limit).toBe(3);
    expect(mockSetCachedData).toHaveBeenCalled();
  });
});
