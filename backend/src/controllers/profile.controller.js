const Researcher = require("../models/Researcher");
const { runQuery } = require("../services/neo4j.service");
const { asyncHandler } = require("../utils/asyncHandler");
const { getCachedData, setCachedData } = require("../services/cache.service");

const getCombinedProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cacheKey = `profile:${id}`;

  // 1) Check Redis cache
  const cached = await getCachedData(cacheKey);
  if (cached) {
    return res.json({
      source: "cache",
      ...cached
    });
  }

  // 2) MongoDB: researcher basic info
  const researcher = await Researcher.findById(id).lean();
  if (!researcher) {
    return res.status(404).json({ error: { message: "Researcher not found" } });
  }

  // 3) Neo4j: collaborators
  const cypher = `
    MATCH (r:Researcher {id: $id})-[:COLLABORATES_WITH]->(c:Researcher)
    RETURN c.id AS id, c.name AS name, c.email AS email
  `;

  const result = await runQuery(cypher, { id });

  const collaborators = result.records.map(r => ({
    id: r.get("id"),
    name: r.get("name"),
    email: r.get("email")
  }));

  // 4) Aggregate response
  const profile = {
    researcher,
    collaborators
  };

  // 5) Save to Redis (TTL = 60 seconds)
  await setCachedData(cacheKey, profile, 60);

  res.json({
    source: "db",
    ...profile
  });
});

module.exports = { getCombinedProfile };
