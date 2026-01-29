const router = require('express').Router();
const c = require('../controllers/publication.controller');
const { validate } = require('../middlewares/validate');
const {
  createPublicationSchema,
  updatePublicationSchema,
} = require('../validators/publication.validator');
/**
 * @openapi
 * tags:
 *   - name: Publications
 *     description: Publications CRUD
 */

/**
 * @openapi
 * /api/publications:
 *   get:
 *     tags: [Publications]
 *     summary: List all publications
 *     responses:
 *       200:
 *         description: A list of publications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Publication'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     tags: [Publications]
 *     summary: Create a new publication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePublicationRequest'
 *     responses:
 *       201:
 *         description: Publication created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Publication'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/publications/{id}:
 *   get:
 *     tags: [Publications]
 *     summary: Get publication by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Publication details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Publication'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags: [Publications]
 *     summary: Update publication by ID
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
 *             $ref: '#/components/schemas/UpdatePublicationRequest'
 *     responses:
 *       200:
 *         description: Publication updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Publication'
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
 *     tags: [Publications]
 *     summary: Delete publication by ID
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
 * /api/publications/recent:
 *   get:
 *     tags: [Publications]
 *     summary: Get recent publications (cached)
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Recent publications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 source:
 *                   type: string
 *                   enum: [cache, db]
 *                 limit:
 *                   type: integer
 *                 publications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Publication'
 */

router.get('/recent', c.getRecent);

router.post('/', validate(createPublicationSchema), c.create);
router.get('/', c.list);
router.get('/:id', c.getById);
router.put('/:id', validate(updatePublicationSchema), c.update);
router.delete('/:id', c.remove);

module.exports = router;
