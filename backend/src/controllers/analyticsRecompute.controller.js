const recomputeService = require("../services/analyticsRecompute.service");

/**
 * POST /api/analytics/events/recompute?year=2024
 */
async function recomputeYear(req, res, next) {
  try {
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({ error: "year query param is required" });
    }

    const result = await recomputeService.recomputePublicationsPerYear(year);

    return res.json({
      message: "Recomputed publications per researcher and stored in Cassandra",
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { recomputeYear };
