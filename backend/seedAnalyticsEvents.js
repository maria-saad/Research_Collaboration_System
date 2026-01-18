#!/usr/bin/env node
require("dotenv").config();

const { initCassandra, shutdownCassandra } = require("./src/config/cassandra");
const { upsertEvent } = require("./src/services/analyticsEvents.service");

async function seed() {
  await initCassandra();

  const events = [
    { researcherId: "researcher1", year: 2024, metricType: "publications", value: 10 },
    { researcherId: "researcher1", year: 2024, metricType: "citations", value: 50 },
    { researcherId: "researcher1", year: 2025, metricType: "publications", value: 15 },
    { researcherId: "researcher2", year: 2024, metricType: "publications", value: 7 },
  ];

  for (const evt of events) {
    console.log(`Seeding: ${evt.researcherId} / ${evt.year} / ${evt.metricType}`);
    await upsertEvent(evt);
  }

  console.log("Done seeding analytics events.");
  await shutdownCassandra();
}

seed().catch(async (err) => {
  console.error(err);
  await shutdownCassandra();
  process.exit(1);
});
