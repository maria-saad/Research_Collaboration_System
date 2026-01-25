const router = require('express').Router();
const { getCombinedProfile } = require('../controllers/profile.controller');

router.get('/researchers/:id/profile', getCombinedProfile);

module.exports = router;
