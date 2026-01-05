const Publication = require("../models/Publication");
const { asyncHandler } = require("../utils/asyncHandler");

const create = asyncHandler(async (req, res) => {
  const doc = await Publication.create(req.body);
  res.status(201).json(doc);
});

const list = asyncHandler(async (req, res) => {
  const docs = await Publication.find()
    .populate("authors", "name email")
    .populate("project", "title domain")
    .sort({ createdAt: -1 })
    .lean();
  res.json(docs);
});

const getById = asyncHandler(async (req, res) => {
  const doc = await Publication.findById(req.params.id)
    .populate("authors", "name email")
    .populate("project", "title domain")
    .lean();

  if (!doc) return res.status(404).json({ error: { message: "Publication not found" } });
  res.json(doc);
});

const update = asyncHandler(async (req, res) => {
  const doc = await Publication.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).lean();

  if (!doc) return res.status(404).json({ error: { message: "Publication not found" } });
  res.json(doc);
});

const remove = asyncHandler(async (req, res) => {
  const doc = await Publication.findByIdAndDelete(req.params.id).lean();
  if (!doc) return res.status(404).json({ error: { message: "Publication not found" } });
  res.json({ deleted: true });
});

module.exports = { create, list, getById, update, remove };
