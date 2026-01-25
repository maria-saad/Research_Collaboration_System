const notesService = require('../services/notes.service');

async function create(req, res, next) {
  try {
    const { researcherId, content } = req.body;

    if (!researcherId || !content) {
      return res.status(400).json({
        error: 'researcherId and content are required',
      });
    }

    const note = await notesService.createNote({ researcherId, content });
    return res.status(201).json(note);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const notes = await notesService.getAllNotes(limit);
    return res.json(notes);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;

    const note = await notesService.getNoteById(id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    return res.json(note);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: 'content is required' });

    await notesService.updateNote(id, { content });
    return res.json({ message: 'Note updated' });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await notesService.deleteNote(id);
    return res.json({ message: 'Note deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getById, update, remove };
