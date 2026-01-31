// backend/tests/analyticsEvents.service.test.js

const mockExecute = jest.fn();

jest.mock('../src/config/cassandra', () => ({
  getCassandraClient: () => ({
    execute: mockExecute,
  }),
}));

const svc = require('../src/services/analyticsEvents.service');

describe('analyticsEvents.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('upsertEvent executes INSERT/UPDATE query', async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] });

    await svc.upsertEvent({
      researcherId: 'r1',
      year: 2024,
      metricType: 'pubs',
      value: 10,
      computedAt: '2026-01-01T00:00:00Z',
    });

    expect(mockExecute).toHaveBeenCalledTimes(1);
    const [query, params, options] = mockExecute.mock.calls[0];

    expect(String(query)).toMatch(/insert|update/i);
    expect(params).toEqual(expect.any(Array));
    expect(options).toEqual(expect.objectContaining({ prepare: true }));
  });

  test('getEventsByResearcher returns rows', async () => {
    mockExecute.mockResolvedValueOnce({
      rows: [
        { researcher_id: 'r1', year: 2024, metric_type: 'pubs', value: 3 },
      ],
    });

    const res = await svc.getEventsByResearcher('r1');

    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(res).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ researcher_id: 'r1', metric_type: 'pubs' }),
      ])
    );
  });

  test('getEventsByResearcherAndYear calls cassandra with researcherId + year', async () => {
    mockExecute.mockResolvedValueOnce({ rows: [{ year: 2024 }] });

    const res = await svc.getEventsByResearcherAndYear('r1', 2024);

    expect(mockExecute).toHaveBeenCalledTimes(1);
    const [, params] = mockExecute.mock.calls[0];
    expect(params).toEqual(expect.arrayContaining(['r1', 2024]));
    expect(res).toEqual(expect.any(Array));
  });

  test('getAggregateMetric returns computed result (example shape)', async () => {
    mockExecute.mockResolvedValueOnce({
      rows: [{ metric_type: 'pubs', sum_value: 100 }],
    });

    const res = await svc.getAggregateMetric('r1', 'pubs');

    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(res).toEqual(expect.anything());
  });

  test('propagates cassandra errors', async () => {
    mockExecute.mockRejectedValueOnce(new Error('boom'));
    await expect(svc.getEventsByResearcher('r1')).rejects.toThrow('boom');
  });
});
