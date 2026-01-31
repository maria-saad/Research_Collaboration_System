// tests/researchers.crud.integration.test.js

// ✅ مهم جدًا: حل مشكلة uuid ESM قبل تحميل app
jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

// ✅ كمان نخلي neo4j ما يعمل اتصال
jest.mock('neo4j-driver', () => ({
  auth: { basic: jest.fn(() => ({})) },
  driver: jest.fn(() => ({
    session: jest.fn(() => ({ run: jest.fn(), close: jest.fn() })),
    close: jest.fn(),
  })),
}));

const mockCreate = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();

// ✅ Researcher model mock
jest.mock('../src/models/Researcher', () => ({
  create: (...args) => mockCreate(...args),
  findByIdAndUpdate: (...args) => mockFindByIdAndUpdate(...args),
  findByIdAndDelete: (...args) => mockFindByIdAndDelete(...args),
}));

const request = require('supertest');
const app = require('../src/app');

describe('Researchers CRUD (integration) - mocked Mongo', () => {
  beforeEach(() => jest.clearAllMocks());

  test('POST /api/researchers creates researcher', async () => {
    mockCreate.mockResolvedValue({
      _id: 'r3',
      name: 'New R',
      email: 'n@x.com',
    });

    const res = await request(app).post('/api/researchers').send({
      name: 'New R',
      email: 'n@x.com',
      affiliation: 'Uni',
    });

    // حسب كودك ممكن 201 أو 200
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toEqual(expect.objectContaining({ _id: 'r3' }));
  });

  test('PUT /api/researchers/:id returns 404 when not found', async () => {
    mockFindByIdAndUpdate.mockReturnValue({
      lean: async () => null,
    });

    const res = await request(app)
      .put('/api/researchers/does-not-exist')
      .send({ name: 'Valid Name' });

    expect(res.statusCode).toBe(404);
  });

  test('DELETE /api/researchers/:id deletes or 404', async () => {
    mockFindByIdAndDelete.mockImplementation((id) => ({
      lean: async () => (id === 'r1' ? { _id: 'r1' } : null),
    }));

    const ok = await request(app).delete('/api/researchers/r1');
    expect([200, 204]).toContain(ok.statusCode);

    const nf = await request(app).delete('/api/researchers/x');
    expect(nf.statusCode).toBe(404);
  });
});
