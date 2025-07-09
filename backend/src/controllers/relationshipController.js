const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { validateRelationship } = require("../utils/validation");

/**
 * Creates a new relationship between two persons
 */
const createRelationship = async (req, res) => {
  try {
    console.log("📥 Received relationship creation request:", JSON.stringify(req.body, null, 2));
    const { fromId, toId, type, notes } = req.body;

    // Basic validation
    if (!fromId || !toId || !type) {
      console.log("❌ Missing required fields:", { fromId, toId, type });
      return res.status(400).json({
        error: "Missing required fields: fromId, toId, and type are required",
      });
    }

    // Parse IDs to integers
    const parsedFromId = parseInt(fromId);
    const parsedToId = parseInt(toId);

    if (isNaN(parsedFromId) || isNaN(parsedToId)) {
      console.log("❌ Invalid IDs:", { fromId, toId, parsedFromId, parsedToId });
      return res.status(400).json({
        error: "Invalid IDs: fromId and toId must be valid integers",
      });
    }

    // Check if persons exist
    const fromPerson = await prisma.person.findUnique({
      where: { id: parsedFromId },
    });

    const toPerson = await prisma.person.findUnique({
      where: { id: parsedToId },
    });

    if (!fromPerson || !toPerson) {
      console.log("❌ Person not found:", { fromPerson, toPerson });
      return res.status(404).json({
        error: "One or both persons not found",
      });
    }

    // Get existing relationships for validation
    const existingRelationships = await prisma.relationship.findMany();
    console.log(`📊 Found ${existingRelationships.length} existing relationships for validation`);

    // Validate the relationship
    const validationResult = validateRelationship(
      { fromId: parsedFromId, toId: parsedToId, type },
      existingRelationships
    );
    console.log("🔍 Validation result:", validationResult);

    if (!validationResult.isValid) {
      console.log("❌ Validation failed:", validationResult.error);
      return res.status(400).json({
        error: validationResult.error,
      });
    }

    // Check for existing spouse relationship in either direction
    if (type === 'spouse') {
      const existingSpouseRelationship = await prisma.relationship.findFirst({
        where: {
          type: 'spouse',
          OR: [
            { AND: [{ fromId: parsedFromId }, { toId: parsedToId }] },
            { AND: [{ fromId: parsedToId }, { toId: parsedFromId }] }
          ]
        }
      });

      if (existingSpouseRelationship) {
        console.log("⚠️ Spouse relationship already exists:", existingSpouseRelationship.id);
        return res.status(400).json({
          error: "A spouse relationship already exists between these persons",
        });
      }
    }

    // Create the relationship
    const relationship = await prisma.relationship.create({
      data: {
        fromId: parsedFromId,
        toId: parsedToId,
        type,
        notes: notes || null,
      },
      include: {
        from: true,
        to: true,
      },
    });

    console.log("✅ Relationship created successfully:", relationship.id);

    // For spouse relationships, create the reciprocal relationship automatically
    if (type === 'spouse') {
      console.log("👫 Creating reciprocal spouse relationship");
      
      // Check if the reciprocal relationship already exists
      const existingReciprocal = await prisma.relationship.findFirst({
        where: {
          fromId: parsedToId,
          toId: parsedFromId,
          type: 'spouse'
        }
      });

      if (!existingReciprocal) {
        // Create the reciprocal relationship
        await prisma.relationship.create({
          data: {
            fromId: parsedToId,
            toId: parsedFromId,
            type: 'spouse',
            notes: notes || null,
          }
        });
        console.log("✅ Reciprocal spouse relationship created");
      }
    }

    res.status(201).json({
      success: true,
      data: relationship,
    });
  } catch (error) {
    console.error("❌ Error creating relationship:", error);
    res.status(500).json({
      error: "Failed to create relationship",
      details: error.message,
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

    // If this is a spouse relationship, update or create the reciprocal relationship
    if (type === 'spouse') {
      // Find the reciprocal relationship if it exists
      const reciprocalRelationship = await prisma.relationship.findFirst({
        where: {
          fromId: existingRelationship.toId,
          toId: existingRelationship.fromId,
        },
      });

      if (reciprocalRelationship) {
        // Update the existing reciprocal relationship
        await prisma.relationship.update({
          where: { id: reciprocalRelationship.id },
          data: {
            type: 'spouse',
            notes,
          },
        });
      } else {
        // Create a new reciprocal relationship
        await prisma.relationship.create({
          data: {
            fromId: existingRelationship.toId,
            toId: existingRelationship.fromId,
            type: 'spouse',
            notes: notes || null,
          },
        });
      }
    }

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
    const relationshipId = parseInt(id);
    
    // Get the relationship before deleting it
    const relationship = await prisma.relationship.findUnique({
      where: { id: relationshipId },
    });

    if (!relationship) {
      return res.status(404).json({
        error: "Relationship not found",
      });
    }

    // Delete the relationship
    await prisma.relationship.delete({
      where: { id: relationshipId },
    });

    // If this is a spouse relationship, delete the reciprocal relationship too
    if (relationship.type === 'spouse') {
      // Find the reciprocal relationship
      const reciprocalRelationship = await prisma.relationship.findFirst({
        where: {
          fromId: relationship.toId,
          toId: relationship.fromId,
          type: 'spouse',
        },
      });

      if (reciprocalRelationship) {
        // Delete the reciprocal relationship
        await prisma.relationship.delete({
          where: { id: reciprocalRelationship.id },
        });
      }
    }

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

/**
 * Validates a relationship without creating it
 */
const validateRelationshipEndpoint = async (req, res) => {
  try {
    const { fromId, toId, type } = req.body;

    if (!fromId || !toId || !type) {
      return res.status(400).json({
        error: "Missing required fields: fromId, toId, and type are required",
      });
    }

    const existingRelationships = await prisma.relationship.findMany();
    const validationResult = validateRelationship(
      { fromId: parseInt(fromId), toId: parseInt(toId), type },
      existingRelationships
    );

    res.json({
      isValid: validationResult.isValid,
      error: validationResult.error || null,
    });
  } catch (error) {
    console.error("Error validating relationship:", error);
    res.status(500).json({
      error: "Failed to validate relationship",
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
  validateRelationshipEndpoint,
};
