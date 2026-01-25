const { z } = require('zod');

const createResearcherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  affiliation: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

const updateResearcherSchema = createResearcherSchema.partial();

module.exports = { createResearcherSchema, updateResearcherSchema };
