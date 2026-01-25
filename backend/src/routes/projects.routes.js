const router = require('express').Router();
const c = require('../controllers/project.controller');
const { validate } = require('../middlewares/validate');
const {
  createProjectSchema,
  updateProjectSchema,
} = require('../validators/project.validator');
router.get('/:id/team', c.getTeam);
router.post('/', validate(createProjectSchema), c.create);
router.get('/', c.list);
router.get('/:id', c.getById);
router.put('/:id', validate(updateProjectSchema), c.update);
router.delete('/:id', c.remove);

module.exports = router;
