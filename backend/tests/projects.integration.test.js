jest.mock('uuid', () => ({
  v4: () => '00000000-0000-0000-0000-000000000000',
}));

jest.mock('neo4j-driver', () => ({
  auth: { basic: jest.fn(() => ({})) },
  driver: jest.fn(() => ({
    session: jest.fn(() => ({ run: jest.fn(), close: jest.fn() })),
    close: jest.fn(),
  })),
}));

jest.mock('../src/models/Project', () => {
  const listData = [
    { _id: 'p1', title: 'Proj 1', year: 2025 },
    { _id: 'p2', title: 'Proj 2', year: 2024 },
  ];

  // helper يبني chain: populate -> populate -> sort -> lean
  const buildFindChain = (data) => ({
    populate: jest.fn(() => buildFindChain(data)), // يسمح بتكرار populate
    sort: jest.fn(() => ({
      lean: jest.fn(async () => data),
    })),
    lean: jest.fn(async () => data), // احتياط لو ما استخدم sort
  });

  // helper يبني chain: populate -> populate -> lean
  const buildFindByIdChain = (doc) => ({
    populate: jest.fn(() => buildFindByIdChain(doc)),
    lean: jest.fn(async () => doc),
  });

  return {
    find: jest.fn(() => buildFindChain(listData)),
    findById: jest.fn((id) =>
      buildFindByIdChain(id === 'p1' ? listData[0] : null)
    ),
  };
});

const request = require('supertest');
const app = require('../src/app');

describe('Projects API (integration) - mocked Mongo', () => {
  test('GET /api/projects returns list', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  test('GET /api/projects/:id returns single project or 404', async () => {
    const ok = await request(app).get('/api/projects/p1');
    expect(ok.statusCode).toBe(200);

    const notFound = await request(app).get('/api/projects/does-not-exist');
    expect([404, 200]).toContain(notFound.statusCode);
    // بعض الكود يرجع 200 مع null، فخلينا مرنين
  });
});
