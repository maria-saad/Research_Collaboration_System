// --- نفس mocks لتجنب مشاكل تحميل app ---
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

// ✅ Mock Mongoose Model: Researcher
jest.mock('../src/models/Researcher', () => {
  const fakeData = [
    { _id: 'r1', name: 'Alice', email: 'alice@uni.edu', affiliation: 'CS' },
    { _id: 'r2', name: 'Bob', email: 'bob@uni.edu', affiliation: 'AI Lab' },
  ];

  return {
    find: jest.fn(() => ({
      sort: jest.fn(() => ({
        lean: jest.fn(async () => fakeData),
      })),
    })),
  };
});

const request = require('supertest');
const app = require('../src/app');

describe('Researchers API (integration)', () => {
  test('GET /api/researchers returns list of researchers (mocked DB)', async () => {
    const res = await request(app).get('/api/researchers');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);

    expect(res.body[0]).toEqual(
      expect.objectContaining({
        _id: 'r1',
        name: 'Alice',
        email: 'alice@uni.edu',
      })
    );
  });
});
