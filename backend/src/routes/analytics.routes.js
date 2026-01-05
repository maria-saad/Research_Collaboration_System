const router = require("express").Router();
const c = require("../controllers/analytics.controller");

router.get("/top-researchers", c.getTopResearchers);

module.exports = router;
