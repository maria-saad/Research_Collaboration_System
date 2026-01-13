require("dotenv").config();
const mongoose = require("mongoose");
const neo4j = require("neo4j-driver");

const Researcher = require("./src/models/Researcher");
const Project = require("./src/models/Project");
const Publication = require("./src/models/Publication");

async function seed() {
  try {
    // 1) Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // 2) Clear old data (اختياري لكنه أنظف)
    await Researcher.deleteMany({});
    await Project.deleteMany({});
    await Publication.deleteMany({});
    console.log("Old data cleared");

    // 3) Create Researchers
    const alice = await Researcher.create({
      name: "Alice Smith",
      email: "alice@uni.edu",
      affiliation: "Computer Science",
      interests: ["Databases", "AI"]
    });

    const bob = await Researcher.create({
      name: "Bob Johnson",
      email: "bob@uni.edu",
      affiliation: "Information Systems",
      interests: ["Graphs", "Distributed Systems"]
    });

    const carol = await Researcher.create({
      name: "Carol White",
      email: "carol@uni.edu",
      affiliation: "Software Engineering",
      interests: ["Software Architecture", "Databases"]
    });

    console.log("Researchers created");

    // 4) Create Project
    const project = await Project.create({
      title: "Research Collaboration Platform",
      description: "A platform for managing academic collaborations",
      domain: "Software Engineering",
      owner: alice._id,
      collaborators: [bob._id, carol._id]
    });

    console.log("Project created");

    // 5) Create Publications
    await Publication.create([
      {
        title: "Using Graph Databases for Collaboration Analysis",
        year: 2024,
        authors: [alice._id, bob._id]
      },
      {
        title: "Caching Strategies in Distributed Research Systems",
        year: 2023,
        authors: [carol._id]
      }
    ]);

    console.log("Publications created");

    console.log("Seed completed successfully");
    // 6) Seed Neo4j collaborations
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const session = driver.session();

try {
  // Create researcher nodes
  await session.run(
    `
    MERGE (a:Researcher {id: $aliceId})
    SET a.name = $aliceName
    MERGE (b:Researcher {id: $bobId})
    SET b.name = $bobName
    MERGE (c:Researcher {id: $carolId})
    SET c.name = $carolName
    `,
    {
      aliceId: String(alice._id),
      aliceName: alice.name,
      bobId: String(bob._id),
      bobName: bob.name,
      carolId: String(carol._id),
      carolName: carol.name
    }
  );

  // Create collaboration relationships
  await session.run(
    `
    MATCH (a:Researcher {id: $aliceId})
    MATCH (b:Researcher {id: $bobId})
    MERGE (a)-[:COLLABORATES_WITH {weight: 2}]->(b)
    `,
    {
      aliceId: String(alice._id),
      bobId: String(bob._id)
    }
  );

  await session.run(
    `
    MATCH (b:Researcher {id: $bobId})
    MATCH (c:Researcher {id: $carolId})
    MERGE (b)-[:COLLABORATES_WITH {weight: 1}]->(c)
    `,
    {
      bobId: String(bob._id),
      carolId: String(carol._id)
    }
  );

  console.log("Neo4j collaborations created");
} finally {
  await session.close();
  await driver.close();
}

    process.exit(0);

  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();
