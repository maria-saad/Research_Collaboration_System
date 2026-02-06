const driver = require('../config/neo4j');

// helper لتشغيل query بأمان
async function runQuery(cypher, params = {}) {
  // إذا Neo4j مطفي → رجّعي خطأ واضح (بدون crash)
  if (!driver) {
    const err = new Error('Neo4j is disabled in this deployment');
    err.statusCode = 503;
    throw err;
  }

  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result;
  } finally {
    await session.close();
  }
}

module.exports = { runQuery };
