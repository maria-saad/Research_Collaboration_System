const router = require('express').Router();

const analyticsController = require('../controllers/analytics.controller');
const analyticsEventsController = require('../controllers/analyticsEvents.controller');
const recomputeController = require('../controllers/analyticsRecompute.controller');

// Existing route (Neo4j + Redis)
router.get('/top-researchers', analyticsController.getTopResearchers);

// ===== Cassandra Analytics Events =====

// POST /api/analytics/events
router.post('/events', analyticsEventsController.upsertEvent);
// ✅ NEW: recompute from Mongo -> Cassandra
router.post('/events/recompute', recomputeController.recomputeYear);
// GET /api/analytics/events/:researcherId/aggregate/:metricType
router.get(
  '/events/:researcherId/aggregate/:metricType',
  analyticsEventsController.getAggregateMetric
);

// GET /api/analytics/events/:researcherId/:year
router.get(
  '/events/:researcherId/:year',
  analyticsEventsController.getEventsByResearcherAndYear
);

// GET /api/analytics/events/:researcherId
router.get(
  '/events/:researcherId',
  analyticsEventsController.getEventsByResearcher
);
/////////

module.exports = router;
