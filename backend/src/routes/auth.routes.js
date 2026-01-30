const router = require('express').Router();
const c = require('../controllers/auth.controller');
const auth = require('../middlewares/authenticate');

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/me', auth, c.me);

module.exports = router;
