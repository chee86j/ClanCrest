const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Placeholder route
router.get("/status", (req, res) => {
  res.json({ status: "API is running" });
});

// Person routes
router.get("/persons", async (req, res) => {
  try {
    const persons = await prisma.person.findMany({
      include: {
        relationshipsFrom: true,
        relationshipsTo: true,
      },
    });
    res.json(persons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/persons", async (req, res) => {
  try {
    const person = await prisma.person.create({
      data: req.body,
    });
    res.json(person);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Relationship routes
router.post("/relationships", async (req, res) => {
  try {
    const relationship = await prisma.relationship.create({
      data: req.body,
    });
    res.json(relationship);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/relationships", async (req, res) => {
  try {
    const relationships = await prisma.relationship.findMany({
      include: {
        from: true,
        to: true,
      },
    });
    res.json(relationships);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
