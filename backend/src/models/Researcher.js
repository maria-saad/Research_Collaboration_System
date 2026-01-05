const mongoose = require("mongoose");

const ResearcherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    affiliation: { type: String, default: "" },
    interests: { type: [String], default: [] },
    // optional: used later to link with Neo4j node id if needed
    neo4jId: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Researcher", ResearcherSchema);
