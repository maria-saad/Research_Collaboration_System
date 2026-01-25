const { getCassandraClient } = require('../config/cassandra');

async function upsertEvent({
  researcherId,
  year,
  metricType,
  value,
  computedAt,
}) {
  const client = getCassandraClient();

  const yr = Number(year);
  const val = Number(value);
  const ts = computedAt ? new Date(computedAt) : new Date();

  const query = `
    INSERT INTO analytics_events (researcher_id, year, metric_type, value, computed_at)
    VALUES (?, ?, ?, ?, ?)
  `;

  await client.execute(query, [researcherId, yr, metricType, val, ts], {
    prepare: true,
  });
}

async function getEventsByResearcher(researcherId) {
  const client = getCassandraClient();

  const query = `
    SELECT researcher_id, year, metric_type, value, computed_at
    FROM analytics_events
    WHERE researcher_id = ?
  `;

  const result = await client.execute(query, [researcherId], { prepare: true });
  return result.rows;
}

async function getEventsByResearcherAndYear(researcherId, year) {
  const client = getCassandraClient();
  const yr = Number(year);

  const query = `
    SELECT researcher_id, year, metric_type, value, computed_at
    FROM analytics_events
    WHERE researcher_id = ? AND year = ?
  `;

  const result = await client.execute(query, [researcherId, yr], {
    prepare: true,
  });
  return result.rows;
}

async function getAggregateMetric(researcherId, metricType) {
  const rows = await getEventsByResearcher(researcherId);
  const filtered = rows.filter((r) => r.metric_type === metricType);
  const total = filtered.reduce((acc, r) => acc + Number(r.value || 0), 0);

  return { metricType, total, count: filtered.length };
}

module.exports = {
  upsertEvent,
  getEventsByResearcher,
  getEventsByResearcherAndYear,
  getAggregateMetric,
};
