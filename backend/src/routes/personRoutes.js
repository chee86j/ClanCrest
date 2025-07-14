const express = require("express");
const personController = require("../controllers/personController");

const router = express.Router();

// GET all persons
router.get("/", personController.getAllPersons);

// GET a specific person by ID
router.get("/:id", personController.getPersonById);

// POST create a new person
router.post("/", personController.createPerson);

// PATCH update a person
router.patch("/:id", personController.updatePerson);

// DELETE a person
router.delete("/:id", personController.deletePerson);

module.exports = router;
