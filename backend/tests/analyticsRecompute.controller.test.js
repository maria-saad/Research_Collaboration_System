// backend/tests/analyticsRecompute.controller.test.js

const mockRecomputePublicationsPerYear = jest.fn();

jest.mock('../src/services/analyticsRecompute.service', () => ({
  recomputePublicationsPerYear: (...args) =>
    mockRecomputePublicationsPerYear(...args),
}));

const controller = require('../src/controllers/analyticsRecompute.controller');

function makeRes() {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    jsonPayload: null,
    json(payload) {
      this.jsonPayload = payload;
      return this;
    },
  };
}

describe('analyticsRecompute.controller recomputeYear', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 400 when year query param is missing', async () => {
    const req = { query: {} };
    const res = makeRes();
    const next = jest.fn();

    await controller.recomputeYear(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.jsonPayload).toEqual({ error: 'year query param is required' });
    expect(mockRecomputePublicationsPerYear).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('calls service and returns result', async () => {
    mockRecomputePublicationsPerYear.mockResolvedValueOnce({
      year: 2024,
      processed: 10,
    });

    const req = { query: { year: '2024' } };
    const res = makeRes();
    const next = jest.fn();

    await controller.recomputeYear(req, res, next);

    expect(mockRecomputePublicationsPerYear).toHaveBeenCalledWith('2024');
    expect(res.jsonPayload).toEqual({
      message: 'Recomputed publications per researcher and stored in Cassandra',
      year: 2024,
      processed: 10,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('passes error to next() on failure', async () => {
    mockRecomputePublicationsPerYear.mockRejectedValueOnce(new Error('boom'));

    const req = { query: { year: '2024' } };
    const res = makeRes();
    const next = jest.fn();

    await controller.recomputeYear(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
