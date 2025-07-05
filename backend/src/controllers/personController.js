const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  validatePersonName,
  validateChineseName,
  validateNotes,
  validatePersonId,
  validateSearchQuery,
} = require("../utils/validation");

/**
 * Get all persons for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllPersons = async (req, res) => {
  try {
    const userId = req.user.id;

    const persons = await prisma.person.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      include: {
        relationshipsFrom: {
          include: {
            to: true,
          },
        },
        relationshipsTo: {
          include: {
            from: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: persons,
      count: persons.length,
    });
  } catch (error) {
    console.error("❌ Error fetching persons:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch persons",
      message: error.message,
    });
  }
};

/**
 * Get a single person by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPersonById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate person ID
    const idValidation = validatePersonId(id);
    if (!idValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: idValidation.error,
      });
    }

    const person = await prisma.person.findFirst({
      where: {
        id: idValidation.value,
        userId,
      },
      include: {
        relationshipsFrom: {
          include: {
            to: true,
          },
        },
        relationshipsTo: {
          include: {
            from: true,
          },
        },
      },
    });

    if (!person) {
      return res.status(404).json({
        success: false,
        error: "Person not found",
      });
    }

    res.json({
      success: true,
      data: person,
    });
  } catch (error) {
    console.error("❌ Error fetching person:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch person",
      message: error.message,
    });
  }
};

/**
 * Create a new person
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPerson = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, nameZh, notes } = req.body;

    // Validate all fields using our validation utilities
    const nameValidation = validatePersonName(name);
    const chineseNameValidation = validateChineseName(nameZh);
    const notesValidation = validateNotes(notes);

    // Check for validation errors
    if (!nameValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: nameValidation.error,
      });
    }

    if (!chineseNameValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: chineseNameValidation.error,
      });
    }

    if (!notesValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: notesValidation.error,
      });
    }

    const person = await prisma.person.create({
      data: {
        name: nameValidation.value,
        nameZh: chineseNameValidation.value,
        notes: notesValidation.value,
        userId,
      },
    });

    console.log("✅ Person created successfully:", person.name);
    res.status(201).json({
      success: true,
      data: person,
      message: "Person created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating person:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create person",
      message: error.message,
    });
  }
};

/**
 * Update an existing person
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePerson = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, nameZh, notes } = req.body;

    // Validate person ID
    const idValidation = validatePersonId(id);
    if (!idValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: idValidation.error,
      });
    }

    // Validate all fields using our validation utilities
    const nameValidation = validatePersonName(name);
    const chineseNameValidation = validateChineseName(nameZh);
    const notesValidation = validateNotes(notes);

    // Check for validation errors
    if (!nameValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: nameValidation.error,
      });
    }

    if (!chineseNameValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: chineseNameValidation.error,
      });
    }

    if (!notesValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: notesValidation.error,
      });
    }

    // Check if person exists and belongs to user
    const existingPerson = await prisma.person.findFirst({
      where: {
        id: idValidation.value,
        userId,
      },
    });

    if (!existingPerson) {
      return res.status(404).json({
        success: false,
        error: "Person not found",
      });
    }

    const updatedPerson = await prisma.person.update({
      where: { id: idValidation.value },
      data: {
        name: nameValidation.value,
        nameZh: chineseNameValidation.value,
        notes: notesValidation.value,
      },
    });

    console.log("✅ Person updated successfully:", updatedPerson.name);
    res.json({
      success: true,
      data: updatedPerson,
      message: "Person updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating person:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update person",
      message: error.message,
    });
  }
};

/**
 * Delete a person and their relationships
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deletePerson = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate person ID
    const idValidation = validatePersonId(id);
    if (!idValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: idValidation.error,
      });
    }

    // Check if person exists and belongs to user
    const existingPerson = await prisma.person.findFirst({
      where: {
        id: idValidation.value,
        userId,
      },
    });

    if (!existingPerson) {
      return res.status(404).json({
        success: false,
        error: "Person not found",
      });
    }

    // Delete all relationships involving this person
    await prisma.relationship.deleteMany({
      where: {
        OR: [{ fromId: idValidation.value }, { toId: idValidation.value }],
      },
    });

    // Delete the person
    await prisma.person.delete({
      where: { id: idValidation.value },
    });

    console.log("✅ Person deleted successfully:", existingPerson.name);
    res.json({
      success: true,
      message: "Person deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting person:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete person",
      message: error.message,
    });
  }
};

/**
 * Search persons by name
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const searchPersons = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;

    // Validate search query
    const queryValidation = validateSearchQuery(query);
    if (!queryValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: queryValidation.error,
      });
    }

    const persons = await prisma.person.findMany({
      where: {
        userId,
        OR: [
          {
            name: {
              contains: queryValidation.value,
              mode: "insensitive",
            },
          },
          {
            nameZh: {
              contains: queryValidation.value,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      data: persons,
      count: persons.length,
    });
  } catch (error) {
    console.error("❌ Error searching persons:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search persons",
      message: error.message,
    });
  }
};

module.exports = {
  getAllPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  searchPersons,
};
