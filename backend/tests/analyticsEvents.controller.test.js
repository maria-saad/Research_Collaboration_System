// backend/tests/analyticsEvents.controller.test.js

const mockUpsertEvent = jest.fn();
const mockGetEventsByResearcher = jest.fn();
const mockGetEventsByResearcherAndYear = jest.fn();
const mockGetAggregateMetric = jest.fn();

jest.mock('../src/services/analyticsEvents.service', () => ({
  upsertEvent: (...args) => mockUpsertEvent(...args),
  getEventsByResearcher: (...args) => mockGetEventsByResearcher(...args),
  getEventsByResearcherAndYear: (...args) =>
    mockGetEventsByResearcherAndYear(...args),
  getAggregateMetric: (...args) => mockGetAggregateMetric(...args),
}));

const controller = require('../src/controllers/analyticsEvents.controller');

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

describe('analyticsEvents.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('upsertEvent returns 400 when required fields missing', async () => {
    const req = { body: { researcherId: 'r1' } };
    const res = makeRes();
    const next = jest.fn();

    await controller.upsertEvent(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.jsonPayload).toEqual({
      error: 'researcherId, year, metricType and value are required',
    });
    expect(mockUpsertEvent).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('upsertEvent calls service and returns 201', async () => {
    mockUpsertEvent.mockResolvedValueOnce(undefined);

    const req = {
      body: { researcherId: 'r1', year: 2024, metricType: 'pubs', value: 10 },
    };
    const res = makeRes();
    const next = jest.fn();

    await controller.upsertEvent(req, res, next);

    expect(mockUpsertEvent).toHaveBeenCalledWith({
      researcherId: 'r1',
      year: 2024,
      metricType: 'pubs',
      value: 10,
      computedAt: undefined,
    });

    expect(res.statusCode).toBe(201);
    expect(res.jsonPayload).toEqual({ message: 'Analytics event recorded' });
    expect(next).not.toHaveBeenCalled();
  });

  test('getEventsByResearcher returns events', async () => {
    mockGetEventsByResearcher.mockResolvedValueOnce([{ a: 1 }]);

    const req = { params: { researcherId: 'r1' } };
    const res = makeRes();
    const next = jest.fn();

    await controller.getEventsByResearcher(req, res, next);

    expect(mockGetEventsByResearcher).toHaveBeenCalledWith('r1');
    expect(res.jsonPayload).toEqual([{ a: 1 }]);
    expect(next).not.toHaveBeenCalled();
  });

  test('getEventsByResearcherAndYear converts year to number', async () => {
    mockGetEventsByResearcherAndYear.mockResolvedValueOnce([{ y: 2023 }]);

    const req = { params: { researcherId: 'r1', year: '2023' } };
    const res = makeRes();
    const next = jest.fn();

    await controller.getEventsByResearcherAndYear(req, res, next);

    expect(mockGetEventsByResearcherAndYear).toHaveBeenCalledWith('r1', 2023);
    expect(res.jsonPayload).toEqual([{ y: 2023 }]);
    expect(next).not.toHaveBeenCalled();
  });

  test('getAggregateMetric returns result', async () => {
    mockGetAggregateMetric.mockResolvedValueOnce({ sum: 99 });

    const req = { params: { researcherId: 'r1', metricType: 'pubs' } };
    const res = makeRes();
    const next = jest.fn();

    await controller.getAggregateMetric(req, res, next);

    expect(mockGetAggregateMetric).toHaveBeenCalledWith('r1', 'pubs');
    expect(res.jsonPayload).toEqual({ sum: 99 });
    expect(next).not.toHaveBeenCalled();
  });

  test('if service throws, controller passes error to next()', async () => {
    mockGetAggregateMetric.mockRejectedValueOnce(new Error('fail'));

    const req = { params: { researcherId: 'r1', metricType: 'pubs' } };
    const res = makeRes();
    const next = jest.fn();

    await controller.getAggregateMetric(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.jsonPayload).toBeNull();
  });
});
