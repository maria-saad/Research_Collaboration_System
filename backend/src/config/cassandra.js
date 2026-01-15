const cassandra = require("cassandra-driver");

let client;

function parseContactPoints(raw) {
  // input example: "127.0.0.1:9042,127.0.0.1:9043,127.0.0.1:9044"
  const items = (raw || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  // driver wants hosts only (strings)
  const hosts = items.map(x => x.split(":")[0].trim());

  // if ports are provided, take the first one as the cluster port
  const firstPort = items[0]?.includes(":") ? Number(items[0].split(":")[1]) : 9042;

  return { hosts, port: Number.isFinite(firstPort) ? firstPort : 9042 };
}

async function initCassandra() {
  const raw = process.env.CASSANDRA_CONTACT_POINTS || "127.0.0.1:9042";
  const localDataCenter = process.env.CASSANDRA_LOCAL_DATACENTER || "datacenter1";
  const keyspace = process.env.CASSANDRA_KEYSPACE || "analytics";

  const { hosts, port } = parseContactPoints(raw);

  if (!hosts.length) throw new Error("CASSANDRA_CONTACT_POINTS is empty/invalid");

  client = new cassandra.Client({
    contactPoints: hosts,                // ✅ strings only
    localDataCenter,
    protocolOptions: { port },           // ✅ port here
    socketOptions: { connectTimeout: 10000 }
  });

  console.log("🟣 Connecting to Cassandra...");
  await client.connect();
  console.log("🟣 Cassandra connected");

  await client.execute(`
    CREATE KEYSPACE IF NOT EXISTS ${keyspace}
    WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 3}
  `);

  await client.execute(`USE ${keyspace}`);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id uuid PRIMARY KEY,
      researcher_id text,
      content text,
      created_at timestamp
    )
  `);

  console.log("🟣 Cassandra keyspace & table ready");
}

function getCassandraClient() {
  if (!client) throw new Error("Cassandra client not initialized");
  return client;
}

async function shutdownCassandra() {
  if (client) {
    await client.shutdown();
    console.log("🟣 Cassandra disconnected");
  }
}

module.exports = { initCassandra, getCassandraClient, shutdownCassandra };
