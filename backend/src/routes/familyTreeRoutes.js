const express = require("express");
const {
  getFamilyTreeData,
  saveFamilyTreeData,
  getFamilyTreeStats,
} = require("../controllers/familyTreeController");

const router = express.Router();

// Get family tree data for frontend visualization
router.get("/", getFamilyTreeData);

// Save family tree data from frontend
router.post("/", saveFamilyTreeData);

// Get family tree statistics
router.get("/stats", getFamilyTreeStats);

module.exports = router;
