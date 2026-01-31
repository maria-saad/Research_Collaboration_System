// tests/notes.service.test.js
const notesService = require('../src/services/notes.service');

const { getCassandraClient } = require('../src/config/cassandra');

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'uuid-123'),
}));

jest.mock('../src/config/cassandra', () => ({
  getCassandraClient: jest.fn(),
}));

describe('notes.service', () => {
  let executeMock;
  let clientMock;

  beforeEach(() => {
    jest.clearAllMocks();
    executeMock = jest.fn();
    clientMock = { execute: executeMock };
    getCassandraClient.mockReturnValue(clientMock);
  });

  test('createNote inserts and returns created note', async () => {
    executeMock.mockResolvedValueOnce({});

    const result = await notesService.createNote({
      researcherId: 'r1',
      content: 'hello',
    });

    expect(getCassandraClient).toHaveBeenCalledTimes(1);
    expect(executeMock).toHaveBeenCalledTimes(1);

    const [query, params, options] = executeMock.mock.calls[0];

    expect(query).toContain('INSERT INTO notes');
    expect(params[0]).toBe('uuid-123');
    expect(params[1]).toBe('r1');
    expect(params[2]).toBe('hello');
    expect(params[3]).toBeInstanceOf(Date);
    expect(options).toEqual({ prepare: true });

    expect(result).toEqual({
      id: 'uuid-123',
      researcherId: 'r1',
      content: 'hello',
      createdAt: expect.any(Date),
    });
  });

  test('getAllNotes returns rows', async () => {
    executeMock.mockResolvedValueOnce({
      rows: [
        { id: 'n1', researcher_id: 'r1', content: 'a', created_at: 't1' },
        { id: 'n2', researcher_id: 'r2', content: 'b', created_at: 't2' },
      ],
    });

    const rows = await notesService.getAllNotes(2);

    expect(getCassandraClient).toHaveBeenCalledTimes(1);
    expect(executeMock).toHaveBeenCalledTimes(1);

    const [query, params, options] = executeMock.mock.calls[0];
    expect(query).toContain(
      'SELECT id, researcher_id, content, created_at FROM notes'
    );
    expect(query).toContain('LIMIT ?');
    expect(params).toEqual([2]);
    expect(options).toEqual({ prepare: true });

    expect(rows).toHaveLength(2);
    expect(rows[0].id).toBe('n1');
  });

  test('getAllNotes coerces limit to number', async () => {
    executeMock.mockResolvedValueOnce({ rows: [] });

    await notesService.getAllNotes('5');

    const [, params] = executeMock.mock.calls[0];
    expect(params).toEqual([5]);
  });

  test('getNoteById returns first row', async () => {
    executeMock.mockResolvedValueOnce({
      rows: [{ id: 'n1', researcher_id: 'r1', content: 'x', created_at: 't' }],
    });

    const note = await notesService.getNoteById('n1');

    expect(executeMock).toHaveBeenCalledTimes(1);
    const [query, params, options] = executeMock.mock.calls[0];

    expect(query).toContain('WHERE id = ?');
    expect(params).toEqual(['n1']);
    expect(options).toEqual({ prepare: true });

    expect(note).toEqual({
      id: 'n1',
      researcher_id: 'r1',
      content: 'x',
      created_at: 't',
    });
  });

  test('getNoteById returns null when not found', async () => {
    executeMock.mockResolvedValueOnce({ rows: [] });

    const note = await notesService.getNoteById('missing');

    expect(note).toBeNull();
  });

  test('updateNote executes update and returns true', async () => {
    executeMock.mockResolvedValueOnce({});

    const ok = await notesService.updateNote('n1', { content: 'new' });

    expect(executeMock).toHaveBeenCalledTimes(1);
    const [query, params, options] = executeMock.mock.calls[0];

    expect(query).toContain('UPDATE notes SET content = ? WHERE id = ?');
    expect(params).toEqual(['new', 'n1']);
    expect(options).toEqual({ prepare: true });

    expect(ok).toBe(true);
  });

  test('deleteNote executes delete and returns true', async () => {
    executeMock.mockResolvedValueOnce({});

    const ok = await notesService.deleteNote('n1');

    expect(executeMock).toHaveBeenCalledTimes(1);
    const [query, params, options] = executeMock.mock.calls[0];

    expect(query).toContain('DELETE FROM notes WHERE id = ?');
    expect(params).toEqual(['n1']);
    expect(options).toEqual({ prepare: true });

    expect(ok).toBe(true);
  });
});
