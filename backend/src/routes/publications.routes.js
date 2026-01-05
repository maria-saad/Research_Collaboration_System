const router = require("express").Router();
const c = require("../controllers/publication.controller");
const { validate } = require("../middlewares/validate");
const { createPublicationSchema, updatePublicationSchema } = require("../validators/publication.validator");

router.post("/", validate(createPublicationSchema), c.create);
router.get("/", c.list);
router.get("/:id", c.getById);
router.put("/:id", validate(updatePublicationSchema), c.update);
router.delete("/:id", c.remove);

module.exports = router;
