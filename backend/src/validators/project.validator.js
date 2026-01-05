const { z } = require("zod");

const createProjectSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  domain: z.string().optional(),
  owner: z.string().min(10), // ObjectId as string
  collaborators: z.array(z.string()).optional()
});

const updateProjectSchema = createProjectSchema.partial();

module.exports = { createProjectSchema, updateProjectSchema };
