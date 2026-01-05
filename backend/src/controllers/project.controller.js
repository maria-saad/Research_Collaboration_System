const Project = require("../models/Project");
const { asyncHandler } = require("../utils/asyncHandler");

const create = asyncHandler(async (req, res) => {
  const doc = await Project.create(req.body);
  res.status(201).json(doc);
});

const list = asyncHandler(async (req, res) => {
  const docs = await Project.find()
    .populate("owner", "name email affiliation")
    .populate("collaborators", "name email")
    .sort({ createdAt: -1 })
    .lean();
  res.json(docs);
});

const getById = asyncHandler(async (req, res) => {
  const doc = await Project.findById(req.params.id)
    .populate("owner", "name email affiliation")
    .populate("collaborators", "name email")
    .lean();

  if (!doc) return res.status(404).json({ error: { message: "Project not found" } });
  res.json(doc);
});

const update = asyncHandler(async (req, res) => {
  const doc = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).lean();

  if (!doc) return res.status(404).json({ error: { message: "Project not found" } });
  res.json(doc);
});

const remove = asyncHandler(async (req, res) => {
  const doc = await Project.findByIdAndDelete(req.params.id).lean();
  if (!doc) return res.status(404).json({ error: { message: "Project not found" } });
  res.json({ deleted: true });
});

module.exports = { create, list, getById, update, remove };
