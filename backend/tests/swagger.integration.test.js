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

const request = require('supertest');
const app = require('../src/app');

describe('Swagger JSON (integration)', () => {
  test('GET /api/docs.json returns OpenAPI spec', async () => {
    const res = await request(app).get('/api/docs.json');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        openapi: expect.any(String),
        info: expect.objectContaining({
          title: expect.any(String),
          version: expect.any(String),
        }),
      })
    );
  });
});
