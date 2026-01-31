// ✅ Mock ESM uuid (حتى ما يحاول Jest يقرأ export)
jest.mock('uuid', () => ({
  v4: () => '00000000-0000-0000-0000-000000000000',
}));

// ✅ Mock neo4j-driver قبل require(app)
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

const request = require('supertest');
const app = require('../src/app');

describe('Health API (integration)', () => {
  test('GET /health returns 200 and ok status', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        status: 'ok',
        service: 'research-collab-backend',
      })
    );
  });
});
