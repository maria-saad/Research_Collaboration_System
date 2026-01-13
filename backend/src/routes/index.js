const router = require("express").Router();

const researchersRoutes = require("./researchers.routes");

const projectsRoutes = require("./projects.routes");

const publicationsRoutes = require("./publications.routes");

router.use("/researchers", researchersRoutes);
router.use("/projects", projectsRoutes);
router.use("/publications", publicationsRoutes);
router.use("/graph", require("./graph.routes"));
router.use("/", require("./profile.routes"));
router.use("/analytics", require("./analytics.routes"));

module.exports = router;