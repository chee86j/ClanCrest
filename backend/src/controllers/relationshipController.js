const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Get all relationships
 */
const getAllRelationships = async (req, res, next) => {
  try {
    const relationships = await prisma.relationship.findMany({
      include: {
        from: true,
        to: true,
      },
    });
    res.status(200).json(relationships);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific relationship by ID
 */
const getRelationshipById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const relationship = await prisma.relationship.findUnique({
      where: { id },
      include: {
        from: true,
        to: true,
      },
    });

    if (!relationship) {
      return res.status(404).json({ message: "Relationship not found" });
    }

    res.status(200).json(relationship);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new relationship
 */
const createRelationship = async (req, res, next) => {
  try {
    const { fromId, toId, type } = req.body;

    // Validate required fields
    if (!fromId || !toId || !type) {
      return res.status(400).json({
        message: "From ID, To ID, and relationship type are required",
      });
    }

    // Validate relationship type
    const validTypes = ["parent", "child", "spouse", "sibling"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message:
          "Invalid relationship type. Must be one of: parent, child, spouse, sibling",
      });
    }

    // Check if both persons exist
    const fromPerson = await prisma.person.findUnique({
      where: { id: fromId },
    });
    const toPerson = await prisma.person.findUnique({ where: { id: toId } });

    if (!fromPerson || !toPerson) {
      return res.status(404).json({ message: "One or both persons not found" });
    }

    // Check for existing relationship
    const existingRelationship = await prisma.relationship.findFirst({
      where: {
        fromId,
        toId,
        type,
      },
    });

    if (existingRelationship) {
      return res.status(409).json({ message: "Relationship already exists" });
    }

    // Create new relationship
    const newRelationship = await prisma.relationship.create({
      data: {
        fromId,
        toId,
        type,
      },
      include: {
        from: true,
        to: true,
      },
    });

    // If type is 'spouse', create reciprocal relationship
    if (type === "spouse") {
      await prisma.relationship.create({
        data: {
          fromId: toId,
          toId: fromId,
          type: "spouse",
        },
      });
    }

    // If type is 'parent', create reciprocal 'child' relationship
    if (type === "parent") {
      await prisma.relationship.create({
        data: {
          fromId: toId,
          toId: fromId,
          type: "child",
        },
      });
    }

    // If type is 'child', create reciprocal 'parent' relationship
    if (type === "child") {
      await prisma.relationship.create({
        data: {
          fromId: toId,
          toId: fromId,
          type: "parent",
        },
      });
    }

    // If type is 'sibling', create reciprocal 'sibling' relationship
    if (type === "sibling") {
      await prisma.relationship.create({
        data: {
          fromId: toId,
          toId: fromId,
          type: "sibling",
        },
      });
    }

    res.status(201).json(newRelationship);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a relationship
 */
const updateRelationship = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    // Check if relationship exists
    const existingRelationship = await prisma.relationship.findUnique({
      where: { id },
    });

    if (!existingRelationship) {
      return res.status(404).json({ message: "Relationship not found" });
    }

    // Validate relationship type if provided
    if (type) {
      const validTypes = ["parent", "child", "spouse", "sibling"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          message:
            "Invalid relationship type. Must be one of: parent, child, spouse, sibling",
        });
      }
    }

    // Update relationship
    const updatedRelationship = await prisma.relationship.update({
      where: { id },
      data: {
        type: type || existingRelationship.type,
      },
      include: {
        from: true,
        to: true,
      },
    });

    res.status(200).json(updatedRelationship);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a relationship
 */
const deleteRelationship = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if relationship exists
    const existingRelationship = await prisma.relationship.findUnique({
      where: { id },
    });

    if (!existingRelationship) {
      return res.status(404).json({ message: "Relationship not found" });
    }

    // Find reciprocal relationship if it exists
    const reciprocalRelationship = await prisma.relationship.findFirst({
      where: {
        fromId: existingRelationship.toId,
        toId: existingRelationship.fromId,
        type: existingRelationship.type,
      },
    });

    // Delete reciprocal relationship if it exists
    if (reciprocalRelationship) {
      await prisma.relationship.delete({
        where: { id: reciprocalRelationship.id },
      });
    }

    // Delete relationship
    await prisma.relationship.delete({
      where: { id },
    });

    res.status(200).json({ message: "Relationship deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRelationships,
  getRelationshipById,
  createRelationship,
  updateRelationship,
  deleteRelationship,
};
