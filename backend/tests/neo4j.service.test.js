// backend/tests/neo4j.service.test.js

const mockClose = jest.fn();
const mockRun = jest.fn();

jest.mock('../src/config/neo4j', () => ({
  session: jest.fn(() => ({
    run: mockRun,
    close: mockClose,
  })),
}));

const driver = require('../src/config/neo4j');
const { runQuery } = require('../src/services/neo4j.service');

describe('neo4j.service runQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calls session.run with cypher/params and closes session', async () => {
    mockRun.mockResolvedValueOnce({ records: [] });

    const result = await runQuery('MATCH (n) RETURN n', { a: 1 });

    expect(driver.session).toHaveBeenCalledTimes(1);
    expect(mockRun).toHaveBeenCalledWith('MATCH (n) RETURN n', { a: 1 });
    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ records: [] });
  });

  test('still closes session even if session.run throws', async () => {
    mockRun.mockRejectedValueOnce(new Error('boom'));

    await expect(runQuery('X', {})).rejects.toThrow('boom');

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
