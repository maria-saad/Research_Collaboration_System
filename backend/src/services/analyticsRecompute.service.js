const mongoose = require("mongoose");
const Publication = require("../models/Publication");
const analyticsEventsService = require("./analyticsEvents.service");

/**
 * Recompute yearly publications count per researcher from MongoDB
 * and store them as pre-computed analytics events in Cassandra.
 *
 * Metric stored:
 *  - metric_type: "publications"
 *  - value: count of publications where researcher appears in authors[]
 *
 * @param {number|string} year
 * @returns {Promise<{year:number, researchers:number, metricsWritten:number}>}
 */
async function recomputePublicationsPerYear(year) {
  const yr = Number(year);
  if (!Number.isFinite(yr)) throw new Error("Invalid year");

  // 1) Fetch publications for that year (lean for performance)
  const pubs = await Publication.find({ year: yr })
    .select("authors year") // only needed fields
    .lean();

  // 2) Count publications per researcherId
  // Use string form of ObjectId as the key
  const counts = new Map(); // researcherIdStr -> count

  for (const p of pubs) {
    const authors = Array.isArray(p.authors) ? p.authors : [];
    for (const rid of authors) {
      const key = String(rid);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  // 3) Write results to Cassandra as analytics_events
  let metricsWritten = 0;

  for (const [researcherId, count] of counts.entries()) {
    await analyticsEventsService.upsertEvent({
      researcherId,
      year: yr,
      metricType: "publications",
      value: count,
    });
    metricsWritten++;
  }

  return {
    year: yr,
    researchers: counts.size,
    metricsWritten,
  };
}

module.exports = { recomputePublicationsPerYear };
