const { asyncHandler } = require("../utils/asyncHandler");
const { runQuery } = require("../services/neo4j.service");
const Researcher = require("../models/Researcher");

// 1) Sync researcher from Mongo -> Neo4j
// Creates/updates (:Researcher {id: <mongoId>, name, email})
const syncResearcher = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const researcher = await Researcher.findById(id).lean();
  if (!researcher) {
    return res.status(404).json({ error: { message: "Researcher not found" } });
  }

  const cypher = `
    MERGE (r:Researcher {id: $id})
    SET r.name = $name,
        r.email = $email
    RETURN r.id AS id, r.name AS name, r.email AS email
  `;

  const result = await runQuery(cypher, {
    id: String(researcher._id),
    name: researcher.name,
    email: researcher.email,
  });

  const record = result.records[0];
  res.json({
    synced: true,
    researcher: {
      id: record.get("id"),
      name: record.get("name"),
      email: record.get("email"),
    },
  });
});

// 2) Create collaboration relationship
// Creates (a)-[:COLLABORATES_WITH {weight}]->(b) and reverse, so it’s undirected in practice
const createCollaboration = asyncHandler(async (req, res) => {
  const { fromId, toId, weight } = req.body;

  if (!fromId || !toId) {
    return res.status(400).json({ error: { message: "fromId and toId are required" } });
  }
  if (fromId === toId) {
    return res.status(400).json({ error: { message: "fromId and toId must be different" } });
  }

  const w = typeof weight === "number" ? weight : 1;

  const cypher = `
    MERGE (a:Researcher {id: $fromId})
    MERGE (b:Researcher {id: $toId})
    MERGE (a)-[r1:COLLABORATES_WITH]->(b)
    SET r1.weight = $weight
    MERGE (b)-[r2:COLLABORATES_WITH]->(a)
    SET r2.weight = $weight
    RETURN a.id AS fromId, b.id AS toId, r1.weight AS weight
  `;

  const result = await runQuery(cypher, { fromId, toId, weight: w });
  const record = result.records[0];

  res.status(201).json({
    created: true,
    fromId: record.get("fromId"),
    toId: record.get("toId"),
    weight: record.get("weight"),
  });
});

// 3) Get collaborators for researcher
const getCollaborators = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const cypher = `
    MATCH (r:Researcher {id: $id})-[:COLLABORATES_WITH]->(c:Researcher)
    RETURN c.id AS collaboratorId, c.name AS collaboratorName, c.email AS collaboratorEmail
    ORDER BY collaboratorName
  `;

  const result = await runQuery(cypher, { id });

  const collaborators = result.records.map((rec) => ({
    id: rec.get("collaboratorId"),
    name: rec.get("collaboratorName"),
    email: rec.get("collaboratorEmail"),
  }));

  res.json({ researcherId: id, collaborators });
});

module.exports = { syncResearcher, createCollaboration, getCollaborators };
