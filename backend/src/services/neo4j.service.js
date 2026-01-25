const driver = require('../config/neo4j');

// helper لتشغيل query بأمان
async function runQuery(cypher, params = {}) {
  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result;
  } finally {
    await session.close();
  }
}

module.exports = { runQuery };
