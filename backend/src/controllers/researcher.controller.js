const Researcher = require("../models/Researcher");
const Project = require("../models/Project"); // ✅ مهم
const { asyncHandler } = require("../utils/asyncHandler");

const create = asyncHandler(async (req, res) => {
  const doc = await Researcher.create(req.body);
  res.status(201).json(doc);
});

const list = asyncHandler(async (req, res) => {
  const docs = await Researcher.find().sort({ createdAt: -1 }).lean();
  res.json(docs);
});

const getById = asyncHandler(async (req, res) => {
  const doc = await Researcher.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ error: { message: "Researcher not found" } });
  res.json(doc);
});

const update = asyncHandler(async (req, res) => {
  const doc = await Researcher.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).lean();

  if (!doc) return res.status(404).json({ error: { message: "Researcher not found" } });
  res.json(doc);
});

const remove = asyncHandler(async (req, res) => {
  const doc = await Researcher.findByIdAndDelete(req.params.id).lean();
  if (!doc) return res.status(404).json({ error: { message: "Researcher not found" } });
  res.json({ deleted: true });
});

// ✅ GET /api/researchers/:id/projects
const getResearcherProjects = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const projects = await Project.find({
    owner: id
  })
    .sort({ createdAt: -1 })
    .populate("owner", "name email affiliation")
    .lean();

  res.json({
    researcherId: id,
    count: projects.length,
    projects
  });
});
const Publication = require("../models/Publication");

// ✅ GET /api/researchers/:id/publications
const getResearcherPublications = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const publications = await Publication.find({
    $or: [
      { authors: id }
    ]
  })
    .sort({ year: -1, createdAt: -1 })
    .populate("authors", "name email affiliation")
    .lean();

  res.json({
    researcherId: id,
    count: publications.length,
    publications
  });
});

module.exports = {
  create,
  list,
  getById,
  update,
  remove,
  getResearcherProjects,
  getResearcherPublications
};
