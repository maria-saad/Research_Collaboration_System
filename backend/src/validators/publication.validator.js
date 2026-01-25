const { z } = require('zod');

const createPublicationSchema = z.object({
  title: z.string().min(2),
  year: z.number().int().min(1900).max(2100),
  venue: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  authors: z.array(z.string()).min(1),
  project: z.string().optional(),
});

const updatePublicationSchema = createPublicationSchema.partial();

module.exports = { createPublicationSchema, updatePublicationSchema };
