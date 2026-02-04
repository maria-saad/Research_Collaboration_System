// tests/analyticsRecompute.service.test.js
const svc = require('../src/services/analyticsRecompute.service');

const Publication = require('../src/models/Publication');
const analyticsEventsService = require('../src/services/analyticsEvents.service');

jest.mock('../src/models/Publication', () => ({
  find: jest.fn(),
}));

jest.mock('../src/services/analyticsEvents.service', () => ({
  upsertEvent: jest.fn(),
}));

describe('analyticsRecompute.service', () => {
  let selectMock;
  let leanMock;

  beforeEach(() => {
    jest.clearAllMocks();

    selectMock = jest.fn();
    leanMock = jest.fn();

    // Publication.find(...) returns { select: ... }
    Publication.find.mockReturnValue({ select: selectMock });

    // select(...) returns { lean: ... }
    selectMock.mockReturnValue({ lean: leanMock });
  });

  test('recomputePublicationsPerYear aggregates and writes events', async () => {
    // Publications in year 2024:
    // pub1 authors: r1,r2
    // pub2 authors: r1
    // => r1 = 2, r2 = 1
    leanMock.mockResolvedValueOnce([
      { authors: ['r1', 'r2'], year: 2024 },
      { authors: ['r1'], year: 2024 },
    ]);

    const result = await svc.recomputePublicationsPerYear('2024');

    expect(Publication.find).toHaveBeenCalledWith({ year: 2024 });
    expect(selectMock).toHaveBeenCalledWith('authors year');

    // upsertEvent called for each researcher in counts map
    expect(analyticsEventsService.upsertEvent).toHaveBeenCalledTimes(2);

    expect(analyticsEventsService.upsertEvent).toHaveBeenCalledWith({
      researcherId: 'r1',
      year: 2024,
      metricType: 'publications',
      value: 2,
    });

    expect(analyticsEventsService.upsertEvent).toHaveBeenCalledWith({
      researcherId: 'r2',
      year: 2024,
      metricType: 'publications',
      value: 1,
    });

    expect(result).toEqual({
      year: 2024,
      researchers: 2,
      metricsWritten: 2,
    });
  });

  test('throws if year is invalid', async () => {
    await expect(svc.recomputePublicationsPerYear('abc')).rejects.toThrow(
      'Invalid year'
    );

    expect(Publication.find).not.toHaveBeenCalled();
    expect(analyticsEventsService.upsertEvent).not.toHaveBeenCalled();
  });

  test('throws if mongo find/lean fails', async () => {
    leanMock.mockRejectedValueOnce(new Error('mongo fail'));

    await expect(svc.recomputePublicationsPerYear('2024')).rejects.toThrow(
      'mongo fail'
    );

    expect(Publication.find).toHaveBeenCalledWith({ year: 2024 });
    expect(analyticsEventsService.upsertEvent).not.toHaveBeenCalled();
  });
});
