const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { getKinship } = require("../controllers/kinshipController");
const { googleAuth, getProfile } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const {
  asyncHandler,
  validateRequiredFields,
  NotFoundError,
} = require("../utils/errorHandler");

const prisma = new PrismaClient();

// Public routes
router.get("/status", (req, res) => {
  res.json({ status: "API is running" });
});

// Auth routes
router.post("/auth/google", googleAuth);
router.get("/auth/profile", authMiddleware, getProfile);

// Protected routes
router.get(
  "/persons",
  authMiddleware,
  asyncHandler(async (req, res) => {
    console.log("📋 Fetching persons for user:", req.user.id);

    const persons = await prisma.person.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        relationshipsFrom: true,
        relationshipsTo: true,
      },
    });

    console.log(`✅ Found ${persons.length} persons`);
    res.json(persons);
  })
);

router.post(
  "/persons",
  authMiddleware,
  asyncHandler(async (req, res) => {
    validateRequiredFields(["name"], req.body);

    console.log("🆕 Creating person:", req.body.name);

    const person = await prisma.person.create({
      data: {
        ...req.body,
        userId: req.user.id,
      },
    });

    console.log("✅ Person created:", person.id);
    res.json(person);
  })
);

router.post(
  "/relationships",
  authMiddleware,
  asyncHandler(async (req, res) => {
    validateRequiredFields(["fromId", "toId", "type"], req.body);

    console.log("🔗 Creating relationship:", {
      fromId: req.body.fromId,
      toId: req.body.toId,
      type: req.body.type,
    });

    // Verify both persons belong to the user
    const [fromPerson, toPerson] = await Promise.all([
      prisma.person.findFirst({
        where: { id: req.body.fromId, userId: req.user.id },
      }),
      prisma.person.findFirst({
        where: { id: req.body.toId, userId: req.user.id },
      }),
    ]);

    if (!fromPerson || !toPerson) {
      throw new NotFoundError("One or both persons (must belong to you)");
    }

    const relationship = await prisma.relationship.create({
      data: req.body,
    });

    console.log("✅ Relationship created:", relationship.id);
    res.json(relationship);
  })
);

router.get(
  "/relationships",
  authMiddleware,
  asyncHandler(async (req, res) => {
    console.log("🔗 Fetching relationships for user:", req.user.id);

    const relationships = await prisma.relationship.findMany({
      where: {
        from: {
          userId: req.user.id,
        },
      },
      include: {
        from: true,
        to: true,
      },
    });

    console.log(`✅ Found ${relationships.length} relationships`);
    res.json(relationships);
  })
);

// Kinship route
router.get("/kinship", authMiddleware, getKinship);

module.exports = router;
