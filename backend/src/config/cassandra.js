const cassandra = require("cassandra-driver");

let client;

function parseContactPoints() {
  const raw =
    process.env.CASSANDRA_CONTACT_POINTS ||
    process.env.CASSANDRA_NODES ||
    "127.0.0.1";

  const items = (raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const hosts = items.map((x) => x.split(":")[0].trim());

  const firstPort = items[0]?.includes(":")
    ? Number(items[0].split(":")[1])
    : 9042;

  return {
    hosts,
    port: Number.isFinite(firstPort) ? firstPort : 9042,
  };
}

async function initCassandra() {
  const localDataCenter =
    process.env.CASSANDRA_LOCAL_DATACENTER ||
    process.env.CASSANDRA_DC ||
    "datacenter1";

  const keyspace = process.env.CASSANDRA_KEYSPACE || "analytics";

  const { hosts, port } = parseContactPoints();
  if (!hosts.length) throw new Error("Cassandra hosts list is empty.");

  // 1) client بدون keyspace (فقط لإنشاء الـ keyspace)
  const bootstrapClient = new cassandra.Client({
    contactPoints: hosts,
    localDataCenter,
    protocolOptions: { port },
    socketOptions: { connectTimeout: 10000 },
  });

  console.log("Connecting to Cassandra (bootstrap)...");
  await bootstrapClient.connect();
  console.log("Cassandra connected (bootstrap)");

  // replication_factor=3 (مناسب لـ 3-node cluster)
  await bootstrapClient.execute(
    `CREATE KEYSPACE IF NOT EXISTS ${keyspace}
     WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 3}`
  );

  // 2) سكّري bootstrapClient
  await bootstrapClient.shutdown();

  // 3) افتحي client جديد مربوط بالـ keyspace
  client = new cassandra.Client({
    contactPoints: hosts,
    localDataCenter,
    protocolOptions: { port },
    keyspace, // ✅ أهم سطر: اربطي كل الاستعلامات بهذا الـ keyspace
    socketOptions: { connectTimeout: 10000 },
  });

  console.log(`Connecting to Cassandra (keyspace=${keyspace})...`);
  await client.connect();
  console.log("Cassandra connected");

  // 4) Create tables داخل نفس keyspace
  await client.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id uuid PRIMARY KEY,
      researcher_id text,
      content text,
      created_at timestamp
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      researcher_id text,
      year int,
      metric_type text,
      value double,
      computed_at timestamp,
      PRIMARY KEY ((researcher_id), year, metric_type)
    ) WITH CLUSTERING ORDER BY (year DESC, metric_type ASC)
  `);

  console.log("Cassandra keyspace & tables ready");
}

function getCassandraClient() {
  if (!client) throw new Error("Cassandra client not initialized");
  return client;
}

async function shutdownCassandra() {
  if (client) {
    await client.shutdown();
    console.log("Cassandra disconnected");
  }
}

module.exports = {
  initCassandra,
  getCassandraClient,
  shutdownCassandra,
};
