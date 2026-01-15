const router = require("express").Router();
const notesController = require("../controllers/notes.controller");

// POST /api/notes
router.post("/", notesController.create);

// GET /api/notes?limit=10
router.get("/", notesController.list);

// GET /api/notes/:id
router.get("/:id", notesController.getById);

// PUT /api/notes/:id
router.put("/:id", notesController.update);

// DELETE /api/notes/:id
router.delete("/:id", notesController.remove);

module.exports = router;
