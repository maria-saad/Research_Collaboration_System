const { asyncHandler } = require("../utils/asyncHandler");
const { runQuery } = require("../services/neo4j.service");
const { getCachedData, setCachedData } = require("../services/cache.service");

function toJsNumber(v) {
  if (v && typeof v.toNumber === "function") return v.toNumber();
  return Number(v ?? 0);
}

const getTopResearchers = asyncHandler(async (req, res) => {
  const raw = req.query.limit;
  const parsed = Number.parseInt(raw ?? "5", 10);
  const limit = Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 50) : 5;

  // 1) Cache key (depends on limit)
  const cacheKey = `analytics:top-researchers:limit=${limit}`;

  // 2) Check cache
  const cached = await getCachedData(cacheKey);
  if (cached) {
    return res.json({
      source: "cache",
      ...cached
    });
  }

  // 3) Query Neo4j (force integer limit in Cypher)
  const cypher = `
    MATCH (r:Researcher)
    OPTIONAL MATCH (r)-[:COLLABORATES_WITH]->(c:Researcher)
    WITH r, count(DISTINCT c) AS collaborationsCount
    RETURN r.id AS id, r.name AS name, r.email AS email, collaborationsCount
    ORDER BY collaborationsCount DESC, name ASC
    LIMIT toInteger($limit)
  `;

  const result = await runQuery(cypher, { limit });

  const topResearchers = result.records.map((rec) => ({
    id: rec.get("id"),
    name: rec.get("name"),
    email: rec.get("email"),
    collaborationsCount: toJsNumber(rec.get("collaborationsCount")),
  }));

  const payload = { limit, topResearchers };

  // 4) Save to cache (TTL 30s مناسب للـ dashboard)
  await setCachedData(cacheKey, payload, 30);

  res.json({
    source: "db",
    ...payload
  });
});

module.exports = { getTopResearchers };
