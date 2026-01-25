const router = require('express').Router();
const c = require('../controllers/researcher.controller');
const { validate } = require('../middlewares/validate');
const {
  createResearcherSchema,
  updateResearcherSchema,
} = require('../validators/researcher.validator');
router.get('/:id/projects', c.getResearcherProjects);
router.get('/:id/publications', c.getResearcherPublications);
router.post('/', validate(createResearcherSchema), c.create);
router.get('/', c.list);
router.get('/:id', c.getById);
router.put('/:id', validate(updateResearcherSchema), c.update);
router.delete('/:id', c.remove);

module.exports = router;
