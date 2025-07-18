const express = require("express");
const personRoutes = require("./personRoutes");
const relationshipRoutes = require("./relationshipRoutes");
const kinshipRoutes = require("./kinshipRoutes");
const authRoutes = require("./authRoutes");
const familyTreeRoutes = require("./familyTreeRoutes");

const router = express.Router();

// API routes
router.use("/persons", personRoutes);
router.use("/relationships", relationshipRoutes);
router.use("/kinship", kinshipRoutes);
router.use("/auth", authRoutes);
router.use("/family-tree", familyTreeRoutes);

// API documentation route
router.get("/docs", (req, res) => {
  res.status(200).json({
    message: "ClanCrest API Documentation",
    endpoints: {
      persons: {
        GET: "/api/persons - Get all persons",
        POST: "/api/persons - Create a new person",
        GET_ONE: "/api/persons/:id - Get a specific person",
        PATCH: "/api/persons/:id - Update a specific person",
        DELETE: "/api/persons/:id - Delete a specific person",
      },
      relationships: {
        GET: "/api/relationships - Get all relationships",
        POST: "/api/relationships - Create a new relationship",
        GET_ONE: "/api/relationships/:id - Get a specific relationship",
        PATCH: "/api/relationships/:id - Update a specific relationship",
        DELETE: "/api/relationships/:id - Delete a specific relationship",
      },
      kinship: {
        POST: "/api/kinship/find - Find relationship between two persons",
        POST: "/api/kinship/ask - Ask AI about kinship relationships",
      },
      auth: {
        POST: "/api/auth/google - Authenticate with Google OAuth",
        GET: "/api/auth/me - Get current user (requires authentication)",
      },
      familyTree: {
        GET: "/api/family-tree - Get family tree data for frontend visualization",
        POST: "/api/family-tree - Save family tree data from frontend",
        GET_STATS: "/api/family-tree/stats - Get family tree statistics",
      },
    },
  });
});

module.exports = router;
