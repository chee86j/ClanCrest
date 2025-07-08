const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { validateRelationship } = require("../utils/validation");

/**
 * Creates a new relationship between two persons
 */
const createRelationship = async (req, res) => {
  try {
    const { fromId, toId, type, notes } = req.body;

    // Get existing relationships for validation
    const existingRelationships = await prisma.relationship.findMany();

    // Validate the relationship
    const validationResult = validateRelationship(
      { fromId, toId, type },
      existingRelationships
    );

    if (!validationResult.isValid) {
      return res.status(400).json({
        error: validationResult.error,
      });
    }

    const relationship = await prisma.relationship.create({
      data: {
        fromId,
        toId,
        type,
        notes,
      },
      include: {
        from: true,
        to: true,
      },
    });

    res.json(relationship);
  } catch (error) {
    console.error("Error creating relationship:", error);
    res.status(500).json({
      error: "Failed to create relationship",
    });
  }
};

/**
 * Updates an existing relationship
 */
const updateRelationship = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, notes } = req.body;

    const existingRelationship = await prisma.relationship.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingRelationship) {
      return res.status(404).json({
        error: "Relationship not found",
      });
    }

    // Get all relationships for validation
    const existingRelationships = await prisma.relationship.findMany({
      where: {
        NOT: {
          id: parseInt(id),
        },
      },
    });

    // Validate the updated relationship
    const validationResult = validateRelationship(
      {
        id: parseInt(id),
        fromId: existingRelationship.fromId,
        toId: existingRelationship.toId,
        type,
      },
      existingRelationships
    );

    if (!validationResult.isValid) {
      return res.status(400).json({
        error: validationResult.error,
      });
    }

    const relationship = await prisma.relationship.update({
      where: { id: parseInt(id) },
      data: {
        type,
        notes,
      },
      include: {
        from: true,
        to: true,
      },
    });

    res.json(relationship);
  } catch (error) {
    console.error("Error updating relationship:", error);
    res.status(500).json({
      error: "Failed to update relationship",
    });
  }
};

/**
 * Deletes a relationship
 */
const deleteRelationship = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.relationship.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Relationship deleted successfully" });
  } catch (error) {
    console.error("Error deleting relationship:", error);
    res.status(500).json({
      error: "Failed to delete relationship",
    });
  }
};

/**
 * Gets all relationships
 */
const getRelationships = async (req, res) => {
  try {
    const relationships = await prisma.relationship.findMany({
      include: {
        from: true,
        to: true,
      },
    });

    res.json(relationships);
  } catch (error) {
    console.error("Error getting relationships:", error);
    res.status(500).json({
      error: "Failed to get relationships",
    });
  }
};

/**
 * Gets a specific relationship by ID
 */
const getRelationship = async (req, res) => {
  try {
    const { id } = req.params;

    const relationship = await prisma.relationship.findUnique({
      where: { id: parseInt(id) },
      include: {
        from: true,
        to: true,
      },
    });

    if (!relationship) {
      return res.status(404).json({
        error: "Relationship not found",
      });
    }

    res.json(relationship);
  } catch (error) {
    console.error("Error getting relationship:", error);
    res.status(500).json({
      error: "Failed to get relationship",
    });
  }
};

/**
 * Gets all relationships for a specific person
 */
const getPersonRelationships = async (req, res) => {
  try {
    const { id } = req.params;
    const personId = parseInt(id);

    const relationships = await prisma.relationship.findMany({
      where: {
        OR: [{ fromId: personId }, { toId: personId }],
      },
      include: {
        from: true,
        to: true,
      },
    });

    res.json(relationships);
  } catch (error) {
    console.error("Error getting person relationships:", error);
    res.status(500).json({
      error: "Failed to get person relationships",
    });
  }
};

module.exports = {
  createRelationship,
  updateRelationship,
  deleteRelationship,
  getRelationships,
  getRelationship,
  getPersonRelationships,
};
