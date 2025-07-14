const express = require("express");
const relationshipController = require("../controllers/relationshipController");

const router = express.Router();

// GET all relationships
router.get("/", relationshipController.getAllRelationships);

// GET a specific relationship by ID
router.get("/:id", relationshipController.getRelationshipById);

// POST create a new relationship
router.post("/", relationshipController.createRelationship);

// PATCH update a relationship
router.patch("/:id", relationshipController.updateRelationship);

// DELETE a relationship
router.delete("/:id", relationshipController.deleteRelationship);

module.exports = router;
