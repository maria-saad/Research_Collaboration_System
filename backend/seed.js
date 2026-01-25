require('dotenv').config();
const mongoose = require('mongoose');
const neo4j = require('neo4j-driver');

const Researcher = require('./src/models/Researcher');
const Project = require('./src/models/Project');
const Publication = require('./src/models/Publication');

async function seed() {
  try {
    // 1) الاتصال بـ MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // 2) تنظيف البيانات القديمة
    await Researcher.deleteMany({});
    await Project.deleteMany({});
    await Publication.deleteMany({});
    console.log('🧹 Old data cleared');

    // 3) إنشاء الباحثين (8 باحثين لتنويع الشبكة)
    const researchersData = [
      {
        name: 'Alice Smith',
        email: 'alice@uni.edu',
        affiliation: 'AI Lab',
        interests: ['AI', 'Machine Learning'],
      },
      {
        name: 'Bob Johnson',
        email: 'bob@uni.edu',
        affiliation: 'Data Science Dept',
        interests: ['Graphs', 'Big Data'],
      },
      {
        name: 'Carol White',
        email: 'carol@uni.edu',
        affiliation: 'Software Engineering',
        interests: ['Architecture', 'Cloud'],
      },
      {
        name: 'David Brown',
        email: 'david@uni.edu',
        affiliation: 'AI Lab',
        interests: ['AI', 'NLP'],
      },
      {
        name: 'Eve Davis',
        email: 'eve@uni.edu',
        affiliation: 'Cybersecurity',
        interests: ['Security', 'Blockchain'],
      },
      {
        name: 'Frank Miller',
        email: 'frank@uni.edu',
        affiliation: 'Data Science Dept',
        interests: ['Big Data', 'Databases'],
      },
      {
        name: 'Grace Wilson',
        email: 'grace@uni.edu',
        affiliation: 'Software Engineering',
        interests: ['Cloud', 'DevOps'],
      },
      {
        name: 'Hank Moore',
        email: 'hank@uni.edu',
        affiliation: 'Cybersecurity',
        interests: ['Blockchain', 'AI'],
      },
    ];

    const createdResearchers = await Researcher.insertMany(researchersData);
    const [alice, bob, carol, david, eve, frank, grace, hank] =
      createdResearchers;
    console.log(`👤 Created ${createdResearchers.length} researchers`);

    // 4) إنشاء المشاريع (توزيع ملكيات وتعاون مختلف)
    const projects = await Project.create([
      {
        title: 'NextGen AI Platform',
        description: 'Exploring deep learning for healthcare.',
        domain: 'Artificial Intelligence',
        owner: alice._id,
        collaborators: [david._id, bob._id, hank._id],
      },
      {
        title: 'Secure Cloud Framework',
        description: 'Security protocols for distributed cloud systems.',
        domain: 'Cybersecurity',
        owner: eve._id,
        collaborators: [carol._id, grace._id],
      },
      {
        title: 'Graph Data Analytics',
        description: 'Analyzing massive social networks using graph DBs.',
        domain: 'Data Science',
        owner: bob._id,
        collaborators: [frank._id, alice._id],
      },
    ]);
    console.log('📂 Projects created');

    // 5) إنشاء المنشورات
    await Publication.create([
      {
        title: 'Neural Networks in Medicine',
        year: 2024,
        authors: [alice._id, david._id],
      },
      {
        title: 'Scalable Graph Processing',
        year: 2023,
        authors: [bob._id, frank._id],
      },
      {
        title: 'Blockchain for IoT Security',
        year: 2024,
        authors: [eve._id, hank._id],
      },
      {
        title: 'Modern Microservices Trends',
        year: 2022,
        authors: [carol._id, grace._id, alice._id],
      },
      {
        title: 'Ethics in AI Research',
        year: 2024,
        authors: [alice._id, bob._id, eve._id],
      },
    ]);
    console.log('📝 Publications created');

    // 6) إدخال البيانات في Neo4j (العلاقات المعقدة)
    const driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
    );
    const session = driver.session();

    try {
      // حذف البيانات القديمة في Neo4j
      await session.run('MATCH (n) DETACH DELETE n');

      // أ) إنشاء عقد الباحثين والاهتمامات
      for (const res of createdResearchers) {
        await session.run(
          `
          MERGE (r:Researcher {id: $id})
          SET r.name = $name, r.affiliation = $affiliation
          WITH r
          UNWIND $interests AS interestName
          MERGE (i:Interest {name: interestName})
          MERGE (r)-[:INTERESTED_IN]->(i)
          `,
          {
            id: String(res._id),
            name: res.name,
            affiliation: res.affiliation,
            interests: res.interests,
          }
        );
      }

      // ب) إنشاء علاقات التعاون (COLLABORATES_WITH) بناءً على المشاريع والمنشورات
      // سنقوم بربط الباحثين الذين عملوا معاً في أي مشروع أو بحث
      const collaborations = [
        { from: alice, to: david, weight: 3 },
        { from: alice, to: bob, weight: 2 },
        { from: bob, to: frank, weight: 2 },
        { from: eve, to: hank, weight: 2 },
        { from: eve, to: alice, weight: 1 },
        { from: carol, to: grace, weight: 2 },
        { from: alice, to: grace, weight: 1 },
      ];

      for (const col of collaborations) {
        await session.run(
          `
          MATCH (r1:Researcher {id: $id1})
          MATCH (r2:Researcher {id: $id2})
          MERGE (r1)-[c:COLLABORATES_WITH]-(r2)
          SET c.weight = $weight
          `,
          {
            id1: String(col.from._id),
            id2: String(col.to._id),
            weight: col.weight,
          }
        );
      }

      console.log(
        '🕸️ Neo4j Graph populated with Researchers, Interests, and Collaborations'
      );
    } finally {
      await session.close();
      await driver.close();
    }

    console.log('🚀 Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
