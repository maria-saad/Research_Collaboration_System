class Note {
  constructor({ id, researcherId, content, createdAt }) {
    if (!researcherId) throw new Error('researcherId is required');
    if (!content) throw new Error('content is required');

    this.id = id;
    this.researcherId = researcherId;
    this.content = content;
    this.createdAt = createdAt ?? new Date();
  }
}

module.exports = { Note };
