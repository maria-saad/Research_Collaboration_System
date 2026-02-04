const express = require('express');
const request = require('supertest');

// خلينا نتحكم في verify
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const authenticate = require('../src/middlewares/authenticate');
const authorize = require('../src/middlewares/authorize');

describe('Auth middleware (authenticate/authorize)', () => {
  let app;

  beforeAll(() => {
    app = express();

    // route محمي للتست فقط
    app.get(
      '/protected',
      authenticate,
      authorize(['admin']), // بدنا role admin
      (req, res) => res.json({ ok: true })
    );

    // error handler عشان ما يصير hang
    app.use((err, req, res, next) => {
      res.status(500).json({ message: err?.message || 'test error' });
    });
  });

  test('returns 401 when no token provided', async () => {
    const res = await request(app).get('/protected');
    expect(res.statusCode).toBe(401);
  });

  test('returns 403 when role not allowed', async () => {
    jwt.verify.mockReturnValueOnce({ userId: 'u1', role: 'user' });

    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer fake.token');

    expect(res.statusCode).toBe(403);
  });

  test('returns 200 when role allowed', async () => {
    jwt.verify.mockReturnValueOnce({ userId: 'u1', role: 'admin' });

    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer fake.token');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
