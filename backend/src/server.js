require("dotenv").config();
const app = require("./app");

const { connectMongo } = require("./config/mongo");
const redisClient = require("./config/redis");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectMongo();
    await redisClient.connect();

    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
})();
const neo4jDriver = require("./config/neo4j");

process.on("SIGINT", async () => {
  try {
    await neo4jDriver.close();
  } finally {
    process.exit(0);
  }
});
