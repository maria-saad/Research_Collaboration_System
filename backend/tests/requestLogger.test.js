const { requestLogger } = require('../src/middlewares/requestLogger');

jest.mock('../src/logger', () => ({
  logger: {
    info: jest.fn(),
  },
}));

const { logger } = require('../src/logger');

describe('requestLogger middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('logs request details on response finish and calls next()', () => {
    const next = jest.fn();

    const finishCallbacks = [];

    const req = {
      method: 'GET',
      originalUrl: '/api/test',
      ip: '127.0.0.1',
    };

    const res = {
      statusCode: 200,
      on(event, cb) {
        if (event === 'finish') {
          finishCallbacks.push(cb);
        }
      },
    };

    requestLogger(req, res, next);

    // next لازم تنادي فورًا
    expect(next).toHaveBeenCalledTimes(1);
    expect(logger.info).not.toHaveBeenCalled();

    // نحاكي انتهاء الـ response
    finishCallbacks.forEach((cb) => cb());

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      'HTTP Request',
      expect.objectContaining({
        method: 'GET',
        path: '/api/test',
        statusCode: 200,
        durationMs: expect.any(Number),
        ip: '127.0.0.1',
      })
    );
  });
});
