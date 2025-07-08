const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  getAllPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  searchPersons,
  updatePersonPosition,
} = require("../controllers/personController");

// Apply authentication middleware to all person routes
router.use(authMiddleware);

// GET /api/persons - Get all persons for the authenticated user
router.get("/", getAllPersons);

// GET /api/persons/search - Search persons by name
router.get("/search", searchPersons);

// GET /api/persons/:id - Get a specific person by ID
router.get("/:id", getPersonById);

// POST /api/persons - Create a new person
router.post("/", createPerson);

// PUT /api/persons/:id - Update an existing person
router.put("/:id", updatePerson);

// PATCH /api/persons/:id/position - Update only a person's position
router.patch("/:id/position", updatePersonPosition);

// DELETE /api/persons/:id - Delete a person and their relationships
router.delete("/:id", deletePerson);

module.exports = router;
