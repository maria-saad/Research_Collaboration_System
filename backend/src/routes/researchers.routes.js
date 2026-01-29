const router = require('express').Router();
const c = require('../controllers/researcher.controller');
const { validate } = require('../middlewares/validate');
const {
  createResearcherSchema,
  updateResearcherSchema,
} = require('../validators/researcher.validator');

/**
 * @openapi
 * tags:
 *   - name: Researchers
 *     description: Researchers CRUD and related resources
 */

/**
 * @openapi
 * /api/researchers:
 *   get:
 *     tags: [Researchers]
 *     summary: List all researchers
 *     responses:
 *       200:
 *         description: A list of researchers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Researcher'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     tags: [Researchers]
 *     summary: Create a new researcher
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResearcherRequest'
 *     responses:
 *       201:
 *         description: Researcher created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Researcher'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/researchers/{id}:
 *   get:
 *     tags: [Researchers]
 *     summary: Get researcher by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 65f1b2c3d4e5f67890123456
 *     responses:
 *       200:
 *         description: Researcher details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Researcher'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags: [Researchers]
 *     summary: Update researcher by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateResearcherRequest'
 *     responses:
 *       200:
 *         description: Researcher updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Researcher'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags: [Researchers]
 *     summary: Delete researcher by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/researchers/{id}/projects:
 *   get:
 *     tags: [Researchers]
 *     summary: Get projects for a researcher
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of projects for the researcher
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/researchers/{id}/publications:
 *   get:
 *     tags: [Researchers]
 *     summary: Get publications for a researcher
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of publications for the researcher
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// IMPORTANT: Keep these before "/:id" to avoid route conflicts
router.get('/:id/projects', c.getResearcherProjects);
router.get('/:id/publications', c.getResearcherPublications);

router.post('/', validate(createResearcherSchema), c.create);
router.get('/', c.list);
router.get('/:id', c.getById);
router.put('/:id', validate(updateResearcherSchema), c.update);
router.delete('/:id', c.remove);

module.exports = router;
