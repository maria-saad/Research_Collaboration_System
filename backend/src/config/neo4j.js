const neo4j = require('neo4j-driver');

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

// If any env var is missing, keep Neo4j disabled without throwing
if (!uri || !user || !password) {
  console.log('Neo4j disabled (missing NEO4J_URI/NEO4J_USER/NEO4J_PASSWORD).');
  module.exports = null;
} else {
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  module.exports = driver;
}
