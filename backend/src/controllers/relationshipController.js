const { PrismaClient } = require("@prisma/client");
const { errorHandler, ValidationError, NotFoundError } = require("../utils/errorHandler");
const {
  validatePersonId,
  validateRelationType,
  validateDnaConfirmed,
  validateNotes,
} = require("../utils/validation");

const prisma = new PrismaClient();

/**
 * Create a new relationship between two people
 */
const createRelationship = errorHandler(async (req, res) => {
  const { fromId, toId, type, dnaConfirmed, notes } = req.body;
  const userId = req.user.id;

  // Validate all fields
  const fromIdValidation = validatePersonId(fromId);
  const toIdValidation = validatePersonId(toId);
  const typeValidation = validateRelationType(type);
  const dnaConfirmedValidation = validateDnaConfirmed(dnaConfirmed);
  const notesValidation = validateNotes(notes);

  if (!fromIdValidation.isValid) {
    throw new ValidationError(fromIdValidation.error);
  }

  if (!toIdValidation.isValid) {
    throw new ValidationError(toIdValidation.error);
  }

  if (!typeValidation.isValid) {
    throw new ValidationError(typeValidation.error);
  }

  if (!dnaConfirmedValidation.isValid) {
    throw new ValidationError(dnaConfirmedValidation.error);
  }

  if (!notesValidation.isValid) {
    throw new ValidationError(notesValidation.error);
  }

  // Verify both people exist and belong to the user
  const [fromPerson, toPerson] = await Promise.all([
    prisma.person.findFirst({
      where: { id: fromIdValidation.value, userId },
    }),
    prisma.person.findFirst({
      where: { id: toIdValidation.value, userId },
    }),
  ]);

  if (!fromPerson || !toPerson) {
    throw new NotFoundError("One or both people not found or not owned by user");
  }

  // Check for existing relationship
  const existingRelationship = await prisma.relationship.findFirst({
    where: {
      OR: [
        { fromId: fromIdValidation.value, toId: toIdValidation.value },
        { fromId: toIdValidation.value, toId: fromIdValidation.value },
      ],
    },
  });

  if (existingRelationship) {
    throw new ValidationError("A relationship already exists between these people");
  }

  const relationship = await prisma.relationship.create({
    data: {
      fromId: fromIdValidation.value,
      toId: toIdValidation.value,
      type: typeValidation.value,
      dnaConfirmed: dnaConfirmedValidation.value,
      notes: notesValidation.value,
    },
    include: {
      from: true,
      to: true,
    },
  });

  console.log("✅ Relationship created:", {
    from: relationship.from.name,
    to: relationship.to.name,
    type: relationship.type,
  });

  res.status(201).json({
    success: true,
    data: relationship,
  });
});

/**
 * Update an existing relationship
 */
const updateRelationship = errorHandler(async (req, res) => {
  const { id } = req.params;
  const { type, dnaConfirmed, notes } = req.body;
  const userId = req.user.id;

  // Validate fields
  const idValidation = validatePersonId(id);
  const typeValidation = validateRelationType(type);
  const dnaConfirmedValidation = validateDnaConfirmed(dnaConfirmed);
  const notesValidation = validateNotes(notes);

  if (!idValidation.isValid) {
    throw new ValidationError(idValidation.error);
  }

  if (!typeValidation.isValid) {
    throw new ValidationError(typeValidation.error);
  }

  if (!dnaConfirmedValidation.isValid) {
    throw new ValidationError(dnaConfirmedValidation.error);
  }

  if (!notesValidation.isValid) {
    throw new ValidationError(notesValidation.error);
  }

  // Verify relationship exists and belongs to user's people
  const existingRelationship = await prisma.relationship.findFirst({
    where: {
      id: idValidation.value,
      OR: [
        { from: { userId } },
        { to: { userId } },
      ],
    },
    include: {
      from: true,
      to: true,
    },
  });

  if (!existingRelationship) {
    throw new NotFoundError("Relationship");
  }

  const relationship = await prisma.relationship.update({
    where: { id: idValidation.value },
    data: {
      type: typeValidation.value,
      dnaConfirmed: dnaConfirmedValidation.value,
      notes: notesValidation.value,
    },
    include: {
      from: true,
      to: true,
    },
  });

  console.log("✅ Relationship updated:", {
    from: relationship.from.name,
    to: relationship.to.name,
    type: relationship.type,
  });

  res.json({
    success: true,
    data: relationship,
  });
});

/**
 * Delete a relationship
 */
const deleteRelationship = errorHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Validate ID
  const idValidation = validatePersonId(id);
  if (!idValidation.isValid) {
    throw new ValidationError(idValidation.error);
  }

  // Verify relationship exists and belongs to user's people
  const existingRelationship = await prisma.relationship.findFirst({
    where: {
      id: idValidation.value,
      OR: [
        { from: { userId } },
        { to: { userId } },
      ],
    },
  });

  if (!existingRelationship) {
    throw new NotFoundError("Relationship");
  }

  await prisma.relationship.delete({
    where: { id: idValidation.value },
  });

  console.log("✅ Relationship deleted");
  res.json({
    success: true,
    message: "Relationship deleted successfully",
  });
});

/**
 * Get all relationships for a person
 */
const getPersonRelationships = errorHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Validate person ID
  const idValidation = validatePersonId(id);
  if (!idValidation.isValid) {
    throw new ValidationError(idValidation.error);
  }

  // Verify person exists and belongs to user
  const person = await prisma.person.findFirst({
    where: {
      id: idValidation.value,
      userId,
    },
  });

  if (!person) {
    throw new NotFoundError("Person");
  }

  const relationships = await prisma.relationship.findMany({
    where: {
      OR: [
        { fromId: idValidation.value },
        { toId: idValidation.value },
      ],
    },
    include: {
      from: true,
      to: true,
    },
  });

  res.json({
    success: true,
    data: relationships,
    count: relationships.length,
  });
});

module.exports = {
  createRelationship,
  updateRelationship,
  deleteRelationship,
  getPersonRelationships,
}; 