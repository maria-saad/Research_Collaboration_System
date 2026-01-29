const {
  CassandraNoteRepository,
} = require('../infrastructure/repositories/CassandraNoteRepository');
const { CreateNote } = require('../domain/usecases/CreateNote');

const noteRepo = new CassandraNoteRepository();
const createNoteUC = new CreateNote(noteRepo);

module.exports = { createNoteUC };
