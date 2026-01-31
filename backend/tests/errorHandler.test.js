// tests/errorHandler.test.js
const { errorHandler } = require('../src/middlewares/errorHandler');

jest.mock('../src/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

const { logger } = require('../src/logger');

function makeRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe('errorHandler middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('logs error and returns 500 by default', () => {
    const err = new Error('boom');
    const req = { originalUrl: '/x', method: 'GET' };
    const res = makeRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(
      'Unhandled error',
      expect.objectContaining({
        message: 'boom',
        stack: expect.any(String),
        path: '/x',
        method: 'GET',
      })
    );

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      error: { message: 'boom' },
    });
  });

  test('uses err.statusCode when present', () => {
    const err = new Error('nope');
    err.statusCode = 404;

    const req = { originalUrl: '/missing', method: 'GET' };
    const res = makeRes();

    errorHandler(err, req, res, jest.fn());

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: { message: 'nope' },
    });
  });

  test('uses err.status when present', () => {
    const err = new Error('bad request');
    err.status = 400;

    const req = { originalUrl: '/api', method: 'POST' };
    const res = makeRes();

    errorHandler(err, req, res, jest.fn());

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: { message: 'bad request' },
    });
  });

  test('falls back to generic message if err.message missing', () => {
    const err = { statusCode: 500 }; // no message
    const req = { originalUrl: '/x', method: 'GET' };
    const res = makeRes();

    errorHandler(err, req, res, jest.fn());

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      error: { message: 'Internal Server Error' },
    });
  });
});
