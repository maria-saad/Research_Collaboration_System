const { v4: uuidv4 } = require('uuid');
const { getCassandraClient } = require('../config/cassandra');

async function createNote({ researcherId, content }) {
  const client = getCassandraClient();
  const id = uuidv4();
  const createdAt = new Date();

  const query = `
    INSERT INTO notes (id, researcher_id, content, created_at)
    VALUES (?, ?, ?, ?)
  `;
  await client.execute(query, [id, researcherId, content, createdAt], {
    prepare: true,
  });

  return { id, researcherId, content, createdAt };
}

async function getAllNotes(limit = 50) {
  const client = getCassandraClient();

  // Cassandra: SELECT بدون WHERE على partition key ليس ideal، لكن ok للديمو
  const query = `SELECT id, researcher_id, content, created_at FROM notes LIMIT ?`;
  const result = await client.execute(query, [Number(limit)], {
    prepare: true,
  });

  return result.rows;
}

async function getNoteById(id) {
  const client = getCassandraClient();

  const query = `SELECT id, researcher_id, content, created_at FROM notes WHERE id = ?`;
  const result = await client.execute(query, [id], { prepare: true });

  return result.rows[0] || null;
}

async function updateNote(id, { content }) {
  const client = getCassandraClient();

  // Update in Cassandra = overwrite by primary key
  const query = `UPDATE notes SET content = ? WHERE id = ?`;
  await client.execute(query, [content, id], { prepare: true });

  return true;
}

async function deleteNote(id) {
  const client = getCassandraClient();

  const query = `DELETE FROM notes WHERE id = ?`;
  await client.execute(query, [id], { prepare: true });

  return true;
}

module.exports = {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
};
