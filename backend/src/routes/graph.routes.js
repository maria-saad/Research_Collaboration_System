const router = require('express').Router();
const c = require('../controllers/graph.controller');

// Sync one researcher from Mongo -> Neo4j
router.post('/researchers/:id/sync', c.syncResearcher);

// Create collaboration relation
router.post('/collaborations', c.createCollaboration);

// Get collaborators for a researcher
router.get('/researchers/:id/collaborators', c.getCollaborators);

module.exports = router;
