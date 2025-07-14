const express = require("express");
const kinshipController = require("../controllers/kinshipController");

const router = express.Router();

// POST find relationship between two persons
router.post("/find", kinshipController.findRelationship);

// POST ask AI about kinship relationships
router.post("/ask", kinshipController.askKinshipQuestion);

module.exports = router;
