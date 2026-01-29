const router = require('express').Router();
const c = require('../controllers/graph.controller');
/**
 * @openapi
 * tags:
 *   - name: Graph
 *     description: Neo4j graph operations
 */

/**
 * @openapi
 * /api/graph/researchers/{id}/sync:
 *   post:
 *     tags: [Graph]
 *     summary: Sync one researcher from MongoDB to Neo4j
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Researcher synced
 *       404:
 *         description: Researcher not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @openapi
 * /api/graph/collaborations:
 *   post:
 *     tags: [Graph]
 *     summary: Create a collaboration relation in Neo4j
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CollaborationRequest'
 *     responses:
 *       201:
 *         description: Collaboration created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Collaboration created
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**

 * @openapi
 * /api/graph/researchers/{id}/collaborators:
 *   get:
 *     tags: [Graph]
 *     summary: Get collaborators for a researcher
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collaborators list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CollaboratorsResponse'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Sync one researcher from Mongo -> Neo4j
router.post('/researchers/:id/sync', c.syncResearcher);

// Create collaboration relation
router.post('/collaborations', c.createCollaboration);

// Get collaborators for a researcher
router.get('/researchers/:id/collaborators', c.getCollaborators);

module.exports = router;
