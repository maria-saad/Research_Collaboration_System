const neo4j = require('neo4j-driver');

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

// إذا مش معرفين على Azure → عطّلي Neo4j بدل ما يوقع السيرفر
if (!uri || !user || !password) {
  console.log('Neo4j disabled (missing NEO4J_URI/NEO4J_USER/NEO4J_PASSWORD).');
  module.exports = null;
  return;
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

module.exports = driver;
