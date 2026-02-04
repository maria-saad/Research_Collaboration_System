jest.setTimeout(15000);

const express = require('express');
const request = require('supertest');

jest.mock('bcryptjs', () => ({
  hash: jest.fn(async () => 'hashed_pw'),
  compare: jest.fn(async () => true),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fake.jwt.token'),
  verify: jest.fn(() => ({ userId: 'u1', role: 'researcher' })),
}));

// ✅ Mock Researcher model (لأن register يعمل Researcher.create)
jest.mock('../src/models/Researcher', () => ({
  create: jest.fn(async (data) => ({
    _id: 'r_new',
    ...data,
  })),
}));

// ✅ Mock User model بشكل مطابق لكود controller
jest.mock('../src/models/User', () => {
  return {
    findOne: jest.fn(async (q) => {
      // register: ايميل موجود => 409
      if (q?.email === 'exists@uni.edu')
        return { _id: 'u_exists', email: q.email };

      // login: موجود
      if (q?.email === 'user@uni.edu')
        return {
          _id: 'u1',
          name: 'User',
          email: 'user@uni.edu',
          role: 'researcher',
          passwordHash: 'hashed_pw',
          researcherId: 'r1',
        };

      return null;
    }),

    create: jest.fn(async (data) => {
      // لازم نرجّع object فيه save() لأن controller ينادي user.save()
      const user = {
        _id: 'u_new',
        ...data,
        researcherId: null,
        save: jest.fn(async () => user),
      };
      return user;
    }),

    deleteOne: jest.fn(async () => ({ deletedCount: 1 })),
    findById: jest.fn(async () => null), // مش ضرورية الآن بس احتياط
  };
});

describe('Auth API (integration)', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    const authRoutes = require('../src/routes/auth.routes');
    app.use('/api/auth', authRoutes);

    // ✅ مهم جدًا عشان أي error ما يعلق request
    app.use((err, req, res, next) => {
      res.status(500).json({ message: err?.message || 'test error' });
    });
  });

  test('POST /api/auth/register returns 201 and token for new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'New User',
      email: 'new@uni.edu',
      password: '12345678',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          email: 'new@uni.edu',
        }),
      })
    );
  });

  test('POST /api/auth/register returns 409 when email already exists', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Existing',
      email: 'exists@uni.edu',
      password: '12345678',
    });

    expect(res.statusCode).toBe(409);
  });

  test('POST /api/auth/login returns 200 and token when credentials valid', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'user@uni.edu',
      password: '12345678',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({ token: expect.any(String) })
    );
  });
});
