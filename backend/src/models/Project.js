const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    domain: { type: String, default: '' },

    // reference to Researcher
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Researcher',
      required: true,
    },

    // optional collaborators list in Mongo (Neo4j is the main graph)
    collaborators: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Researcher' },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', ProjectSchema);
