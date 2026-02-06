// backend/src/controllers/profile.controller.js
const Researcher = require('../models/Researcher');
const {
  runQueryOptional,
  isNeo4jEnabled,
} = require('../services/neo4j.service');
const { asyncHandler } = require('../utils/asyncHandler');
const { getCachedData, setCachedData } = require('../services/cache.service');

const getCombinedProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cacheKey = `profile:${id}`;

  // 1) Check cache (Redis optional)
  const cached = await getCachedData(cacheKey);
  if (cached) {
    return res.json({
      source: 'cache',
      neo4j: isNeo4jEnabled() ? 'enabled' : 'disabled',
      ...cached,
    });
  }

  // 2) MongoDB: researcher basic info
  const researcher = await Researcher.findById(id).lean();
  if (!researcher) {
    return res.status(404).json({ error: { message: 'Researcher not found' } });
  }

  // 3) Neo4j: collaborators (optional)
  const cypher = `
    MATCH (r:Researcher {id: $id})-[:COLLABORATES_WITH]->(c:Researcher)
    RETURN c.id AS id, c.name AS name, c.email AS email
  `;

  const result = await runQueryOptional(cypher, { id });

  const collaborators = result
    ? result.records.map((r) => ({
        id: r.get('id'),
        name: r.get('name'),
        email: r.get('email'),
      }))
    : [];

  // 4) Aggregate response
  const profile = { researcher, collaborators };

  // 5) Save to cache (Redis optional)
  await setCachedData(cacheKey, profile, 60);

  res.json({
    source: 'db',
    neo4j: isNeo4jEnabled() ? 'enabled' : 'disabled',
    ...profile,
  });
});

module.exports = { getCombinedProfile };
