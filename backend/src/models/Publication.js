const mongoose = require('mongoose');

const PublicationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1900, max: 2100 },
    venue: { type: String, default: '' }, // journal/conference
    keywords: { type: [String], default: [] },

    // authors: list of researchers
    authors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Researcher',
        required: true,
      },
    ],

    // optional: link to project
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Publication', PublicationSchema);
