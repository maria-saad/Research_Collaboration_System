const analyticsEventsService = require("../services/analyticsEvents.service");

async function upsertEvent(req, res, next) {
  try {
    const { researcherId, year, metricType, value, computedAt } = req.body;

    if (!researcherId || year === undefined || !metricType || value === undefined) {
      return res.status(400).json({
        error: "researcherId, year, metricType and value are required",
      });
    }

    await analyticsEventsService.upsertEvent({
      researcherId,
      year,
      metricType,
      value,
      computedAt,
    });

    return res.status(201).json({ message: "Analytics event recorded" });
  } catch (err) {
    next(err);
  }
}

async function getEventsByResearcher(req, res, next) {
  try {
    const { researcherId } = req.params;
    const events = await analyticsEventsService.getEventsByResearcher(researcherId);
    return res.json(events);
  } catch (err) {
    next(err);
  }
}

async function getEventsByResearcherAndYear(req, res, next) {
  try {
    const { researcherId, year } = req.params;
    const events = await analyticsEventsService.getEventsByResearcherAndYear(
      researcherId,
      Number(year)
    );
    return res.json(events);
  } catch (err) {
    next(err);
  }
}

async function getAggregateMetric(req, res, next) {
  try {
    const { researcherId, metricType } = req.params;
    const result = await analyticsEventsService.getAggregateMetric(
      researcherId,
      metricType
    );
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  upsertEvent,
  getEventsByResearcher,
  getEventsByResearcherAndYear,
  getAggregateMetric,
};
