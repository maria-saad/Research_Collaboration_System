const router = require('express').Router();

const analyticsController = require('../controllers/analytics.controller');
const analyticsEventsController = require('../controllers/analyticsEvents.controller');
const recomputeController = require('../controllers/analyticsRecompute.controller');
/**
 * @openapi
 * tags:
 *   - name: Analytics
 *     description: Analytics endpoints (Neo4j + Redis)
 */

/**
 * @openapi
 * /api/analytics/top-researchers:
 *   get:
 *     tags: [Analytics]
 *     summary: Get top researchers by collaboration metrics (cached)
 *     description: Returns analytics computed from Neo4j and cached in Redis.
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Max number of researchers to return
 *     responses:
 *       200:
 *         description: Analytics result (may be cached)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TopResearchersResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

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
