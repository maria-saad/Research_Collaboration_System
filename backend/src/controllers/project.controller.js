const Project = require('../models/Project');
const { asyncHandler } = require('../utils/asyncHandler');
const { runQuery } = require('../services/neo4j.service');

const create = asyncHandler(async (req, res) => {
  const doc = await Project.create(req.body);
  res.status(201).json(doc);
});

const list = asyncHandler(async (req, res) => {
  const docs = await Project.find()
    .populate('owner', 'name email affiliation')
    .populate('collaborators', 'name email')
    .sort({ createdAt: -1 })
    .lean();
  res.json(docs);
});

const getById = asyncHandler(async (req, res) => {
  const doc = await Project.findById(req.params.id)
    .populate('owner', 'name email affiliation')
    .populate('collaborators', 'name email')
    .lean();

  if (!doc)
    return res.status(404).json({ error: { message: 'Project not found' } });
  res.json(doc);
});

const update = asyncHandler(async (req, res) => {
  const doc = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).lean();

  if (!doc)
    return res.status(404).json({ error: { message: 'Project not found' } });
  res.json(doc);
});

const remove = asyncHandler(async (req, res) => {
  const doc = await Project.findByIdAndDelete(req.params.id).lean();
  if (!doc)
    return res.status(404).json({ error: { message: 'Project not found' } });
  res.json({ deleted: true });
});
const getTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1) MongoDB: get project + team members
  const project = await Project.findById(id)
    .populate('owner', 'name email affiliation')
    .populate('collaborators', 'name email affiliation')
    .lean();

  if (!project) {
    return res.status(404).json({ error: { message: 'Project not found' } });
  }

  // Team = owner + collaborators
  const members = [project.owner, ...(project.collaborators || [])].filter(
    Boolean
  );

  const memberIds = members.map((m) => String(m._id));

  // 2) Neo4j: get collaborations inside the team (best-effort)
  let collaborations = [];
  try {
    const cypher = `
      UNWIND $ids AS id
      MATCH (a:Researcher {id: id})
      MATCH (a)-[rel:COLLABORATES_WITH]->(b:Researcher)
      WHERE b.id IN $ids
      RETURN a.id AS fromId, b.id AS toId, coalesce(rel.weight, 1) AS weight
    `;

    const result = await runQuery(cypher, { ids: memberIds });

    collaborations = result.records.map((r) => ({
      fromId: r.get('fromId'),
      toId: r.get('toId'),
      weight: r.get('weight').toNumber
        ? r.get('weight').toNumber()
        : Number(r.get('weight')),
    }));
  } catch {
    // Neo4j optional: MongoDB part still valid
    collaborations = [];
  }

  res.json({
    projectId: id,
    title: project.title,
    teamCount: members.length,
    members,
    collaborations,
  });
});

module.exports = { create, list, getById, update, remove, getTeam };
