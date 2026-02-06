// backend/src/services/neo4j.service.js
const driver = require('../config/neo4j');

// هل Neo4j مفعّل؟
function isNeo4jEnabled() {
  return Boolean(driver);
}

// helper لتشغيل query بأمان
async function runQuery(cypher, params = {}) {
  // إذا Neo4j مطفي → خطأ واضح (لـ endpoints اللي لازم Neo4j)
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

// نسخة "اختيارية": إذا Neo4j مطفي رجّع null بدل ما ترمي error
async function runQueryOptional(cypher, params = {}) {
  if (!driver) return null;

  const session = driver.session();
  try {
    return await session.run(cypher, params);
  } catch (e) {
    // لو صار error اتصال، اعتبريه غير متاح وخلاص (ما نكسر API)
    return null;
  } finally {
    await session.close();
  }
}

module.exports = { runQuery, runQueryOptional, isNeo4jEnabled };
