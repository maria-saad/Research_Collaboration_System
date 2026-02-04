// tests/notes.controller.test.js
const controller = require('../src/controllers/notes.controller');
const notesService = require('../src/services/notes.service');

jest.mock('../src/services/notes.service', () => ({
  createNote: jest.fn(),
  getAllNotes: jest.fn(),
  getNoteById: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
}));

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

describe('notes.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    test('returns 400 if missing fields', async () => {
      const req = { body: { researcherId: 'r1' } }; // missing content
      const res = makeRes();
      const next = jest.fn();

      await controller.create(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: 'researcherId and content are required',
      });
      expect(notesService.createNote).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test('returns 201 with created note', async () => {
      const req = { body: { researcherId: 'r1', content: 'hello' } };
      const res = makeRes();
      const next = jest.fn();

      const created = {
        id: 'n1',
        researcherId: 'r1',
        content: 'hello',
      };

      notesService.createNote.mockResolvedValueOnce(created);

      await controller.create(req, res, next);

      expect(notesService.createNote).toHaveBeenCalledWith({
        researcherId: 'r1',
        content: 'hello',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(created);
      expect(next).not.toHaveBeenCalled();
    });

    test('calls next(err) on service failure', async () => {
      const req = { body: { researcherId: 'r1', content: 'hello' } };
      const res = makeRes();
      const next = jest.fn();

      notesService.createNote.mockRejectedValueOnce(new Error('boom'));

      await controller.create(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.body).toBeUndefined();
    });
  });
});
