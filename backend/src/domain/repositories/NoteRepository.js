/**
 * Contract only (documentation interface).
 * Any implementation (Cassandra, InMemory, etc.) must follow it.
 */
class NoteRepository {
  async create(note) {}
  async list(limit) {}
  async getById(id) {}
  async updateContent(id, content) {}
  async remove(id) {}
}

module.exports = { NoteRepository };
