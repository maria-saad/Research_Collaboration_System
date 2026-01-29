const router = require('express').Router();
const { getCombinedProfile } = require('../controllers/profile.controller');
/**
 * @openapi
 * tags:
 *   - name: Profiles
 *     description: Cross-database combined profiles
 */

/**
 * @openapi
 * /api/researchers/{id}/profile:
 *   get:
 *     tags: [Profiles]
 *     summary: Get combined researcher profile (MongoDB + Neo4j + optional cache)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Combined profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CombinedProfileResponse'
 *       404:
 *         description: Researcher not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.get('/researchers/:id/profile', getCombinedProfile);

module.exports = router;
