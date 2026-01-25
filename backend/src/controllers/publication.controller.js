const Publication = require('../models/Publication');
const { asyncHandler } = require('../utils/asyncHandler');
const { getCachedData, setCachedData } = require('../services/cache.service');

const create = asyncHandler(async (req, res) => {
  const doc = await Publication.create(req.body);
  res.status(201).json(doc);
});

const list = asyncHandler(async (req, res) => {
  const docs = await Publication.find()
    .populate('authors', 'name email')
    .populate('project', 'title domain')
    .sort({ createdAt: -1 })
    .lean();
  res.json(docs);
});

const getById = asyncHandler(async (req, res) => {
  const doc = await Publication.findById(req.params.id)
    .populate('authors', 'name email')
    .populate('project', 'title domain')
    .lean();

  if (!doc)
    return res
      .status(404)
      .json({ error: { message: 'Publication not found' } });
  res.json(doc);
});

const update = asyncHandler(async (req, res) => {
  const doc = await Publication.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).lean();

  if (!doc)
    return res
      .status(404)
      .json({ error: { message: 'Publication not found' } });
  res.json(doc);
});

const remove = asyncHandler(async (req, res) => {
  const doc = await Publication.findByIdAndDelete(req.params.id).lean();
  if (!doc)
    return res
      .status(404)
      .json({ error: { message: 'Publication not found' } });
  res.json({ deleted: true });
});

const getRecent = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '10', 10), 50); // سقف حماية
  const cacheKey = `publications:recent:limit=${limit}`;

  // 1) Try Redis
  const cached = await getCachedData(cacheKey);
  if (cached) {
    return res.json({ source: 'cache', limit, publications: cached });
  }

  // 2) Query MongoDB
  const publications = await Publication.find()
    .sort({ year: -1, createdAt: -1 }) // الأحدث
    .limit(limit)
    .populate('authors', 'name email affiliation') // إذا عندك authors ref
    .lean();

  // 3) Store in Redis (TTL 60s)
  await setCachedData(cacheKey, publications, 60);

  res.json({ source: 'db', limit, publications });
});

module.exports = { create, list, getById, update, remove, getRecent };
