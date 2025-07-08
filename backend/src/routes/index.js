const express = require("express");
const router = express.Router();
const { errorHandler, NotFoundError } = require("../utils/errorHandler");
const { PrismaClient } = require("@prisma/client");
const { validateRequiredFields } = require("../utils/validation");
const { getKinship } = require("../controllers/kinshipController");
const {
  handleGoogleAuth,
  getProfile,
} = require("../controllers/authController");
const {
  createRelationship,
  updateRelationship,
  deleteRelationship,
  getPersonRelationships,
} = require("../controllers/relationshipController");
const authMiddleware = require("../middleware/auth");
const personRoutes = require("./personRoutes");

const prisma = new PrismaClient();

// Public routes
router.get("/status", (req, res) => {
  res.json({ status: "API is running" });
});

// Auth routes
router.post("/auth/google", handleGoogleAuth);
router.get("/auth/profile", authMiddleware, getProfile);

// Person routes
router.use("/persons", personRoutes);

// Relationship routes
router.post("/relationships", authMiddleware, createRelationship);
router.put("/relationships/:id", authMiddleware, updateRelationship);
router.delete("/relationships/:id", authMiddleware, deleteRelationship);
router.get(
  "/persons/:id/relationships",
  authMiddleware,
  getPersonRelationships
);

// Get all relationships for the user
router.get(
  "/relationships",
  authMiddleware,
  errorHandler(async (req, res) => {
    console.log("🔗 Fetching relationships for user:", req.user.id);

    const relationships = await prisma.relationship.findMany({
      where: {
        OR: [
          { from: { userId: req.user.id } },
          { to: { userId: req.user.id } },
        ],
      },
      include: {
        from: true,
        to: true,
      },
    });

    console.log(`✅ Found ${relationships.length} relationships`);
    res.json({
      success: true,
      data: relationships,
      count: relationships.length,
    });
  })
);

// Kinship route
router.get("/kinship", authMiddleware, getKinship);

// Health check
router.get(
  "/health",
  errorHandler(async (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  })
);

// Error route for testing error handling
router.get(
  "/error",
  errorHandler(async (req, res) => {
    throw new Error("Test error");
  })
);

module.exports = router;
