const { Note } = require('../entities/Note');

class CreateNote {
  constructor(noteRepo) {
    this.noteRepo = noteRepo;
  }

  async execute({ researcherId, content }) {
    const note = new Note({ researcherId, content });
    return this.noteRepo.create(note);
  }
}

module.exports = { CreateNote };
