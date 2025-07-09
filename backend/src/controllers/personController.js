const { PrismaClient } = require("@prisma/client");
const {
  errorHandler,
  ValidationError,
  NotFoundError,
} = require("../utils/errorHandler");
const {
  validatePersonName,
  validateChineseName,
  validateNotes,
  validatePersonId,
  validateImageId,
  validateSearchQuery,
  validateGender,
} = require("../utils/validation");

const prisma = new PrismaClient();

/**
 * Get all persons for a user
 */
const getAllPersons = errorHandler(async (req, res) => {
  const userId = req.user.id;

  const persons = await prisma.person.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: {
      relationshipsFrom: {
        include: { to: true },
      },
      relationshipsTo: {
        include: { from: true },
      },
    },
  });

  res.json({
    success: true,
    data: persons,
    count: persons.length,
  });
});

/**
 * Get a single person by ID
 */
const getPersonById = errorHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Validate person ID
  const idValidation = validatePersonId(id);
  if (!idValidation.isValid) {
    throw new ValidationError(idValidation.error);
  }

  const person = await prisma.person.findFirst({
    where: {
      id: idValidation.value,
      userId,
    },
    include: {
      relationshipsFrom: {
        include: { to: true },
      },
      relationshipsTo: {
        include: { from: true },
      },
    },
  });

  if (!person) {
    throw new NotFoundError("Person");
  }

  res.json({
    success: true,
    data: person,
  });
});

/**
 * Create a new person
 */
const createPerson = errorHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, nameZh, notes, imageId, gender } = req.body;

  // Validate all fields
  const nameValidation = validatePersonName(name);
  const chineseNameValidation = validateChineseName(nameZh);
  const notesValidation = validateNotes(notes);
  const imageIdValidation = validateImageId(imageId);
  const genderValidation = validateGender(gender);

  if (!nameValidation.isValid) {
    throw new ValidationError(nameValidation.error);
  }

  if (!chineseNameValidation.isValid) {
    throw new ValidationError(chineseNameValidation.error);
  }

  if (!notesValidation.isValid) {
    throw new ValidationError(notesValidation.error);
  }

  if (!imageIdValidation.isValid) {
    throw new ValidationError(imageIdValidation.error);
  }

  if (!genderValidation.isValid) {
    throw new ValidationError(genderValidation.error);
  }

  const person = await prisma.person.create({
    data: {
      name: nameValidation.value,
      nameZh: chineseNameValidation.value,
      notes: notesValidation.value,
      imageId: imageIdValidation.value,
      gender: genderValidation.value,
      userId,
    },
  });

  console.log("✅ Person created:", person.name);
  res.status(201).json({
    success: true,
    data: person,
  });
});

/**
 * Update an existing person
 */
const updatePerson = errorHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { name, nameZh, notes, imageId, gender, positionX, positionY } =
    req.body;

  // Validate person ID
  const idValidation = validatePersonId(id);
  if (!idValidation.isValid) {
    throw new ValidationError(idValidation.error);
  }

  // Validate all fields
  const nameValidation = validatePersonName(name);
  const chineseNameValidation = validateChineseName(nameZh);
  const notesValidation = validateNotes(notes);
  const imageIdValidation = validateImageId(imageId);
  const genderValidation = validateGender(gender);

  if (!nameValidation.isValid) {
    throw new ValidationError(nameValidation.error);
  }

  if (!chineseNameValidation.isValid) {
    throw new ValidationError(chineseNameValidation.error);
  }

  if (!notesValidation.isValid) {
    throw new ValidationError(notesValidation.error);
  }

  if (imageId !== undefined && imageId !== null && !imageIdValidation.isValid) {
    throw new ValidationError(imageIdValidation.error);
  }

  if (!genderValidation.isValid) {
    throw new ValidationError(genderValidation.error);
  }

  // Check if person exists and belongs to user
  const existingPerson = await prisma.person.findFirst({
    where: {
      id: idValidation.value,
      userId,
    },
  });

  if (!existingPerson) {
    throw new NotFoundError("Person");
  }

  const person = await prisma.person.update({
    where: { id: idValidation.value },
    data: {
      name: nameValidation.value,
      nameZh: chineseNameValidation.value,
      notes: notesValidation.value,
      gender: genderValidation.value,
      ...(imageId !== undefined &&
        imageId !== null && { imageId: imageIdValidation.value }),
      ...(positionX !== undefined && { positionX: parseFloat(positionX) }),
      ...(positionY !== undefined && { positionY: parseFloat(positionY) }),
    },
  });

  console.log("✅ Person updated:", person.name);
  res.json({
    success: true,
    data: person,
  });
});

/**
 * Delete a person
 */
const deletePerson = errorHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Validate person ID
  const idValidation = validatePersonId(id);
  if (!idValidation.isValid) {
    throw new ValidationError(idValidation.error);
  }

  // Check if person exists and belongs to user
  const existingPerson = await prisma.person.findFirst({
    where: {
      id: idValidation.value,
      userId,
    },
  });

  if (!existingPerson) {
    throw new NotFoundError("Person");
  }

  await prisma.person.delete({
    where: { id: idValidation.value },
  });

  console.log("✅ Person deleted:", existingPerson.name);
  res.json({
    success: true,
    message: "Person deleted successfully",
  });
});

/**
 * Search persons by name
 */
const searchPersons = errorHandler(async (req, res) => {
  const { query } = req.query;
  const userId = req.user.id;

  // Validate search query
  const queryValidation = validateSearchQuery(query);
  if (!queryValidation.isValid) {
    throw new ValidationError(queryValidation.error);
  }

  const persons = await prisma.person.findMany({
    where: {
      userId,
      OR: [
        { name: { contains: queryValidation.value, mode: "insensitive" } },
        { nameZh: { contains: queryValidation.value } },
      ],
    },
    orderBy: { name: "asc" },
  });

  console.log(`✅ Found ${persons.length} matches for "${query}"`);
  res.json({
    success: true,
    data: persons,
    count: persons.length,
  });
});

/**
 * Update a person's position in the family tree
 */
const updatePersonPosition = errorHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { positionX, positionY } = req.body;

  // Validate person ID
  const idValidation = validatePersonId(id);
  if (!idValidation.isValid) {
    throw new ValidationError(idValidation.error);
  }

  // Check if person exists and belongs to user
  const existingPerson = await prisma.person.findFirst({
    where: {
      id: idValidation.value,
      userId,
    },
  });

  if (!existingPerson) {
    throw new NotFoundError("Person");
  }

  // Update only position fields
  const person = await prisma.person.update({
    where: { id: idValidation.value },
    data: {
      positionX: parseFloat(positionX),
      positionY: parseFloat(positionY),
    },
  });

  res.json({
    success: true,
    data: person,
  });
});

/**
 * Save layout data
 */
const saveLayout = errorHandler(async (req, res) => {
  const { positions } = req.body;
  const userId = req.user.id;

  if (!positions || typeof positions !== 'object') {
    throw new ValidationError('Invalid positions data');
  }

  // Update or create layout data
  const layout = await prisma.layoutData.upsert({
    where: { userId },
    update: { positions },
    create: {
      userId,
      positions
    }
  });

  res.status(200).json({
    success: true,
    message: 'Layout saved successfully',
    layout
  });
});

/**
 * Get layout data
 */
const getLayout = errorHandler(async (req, res) => {
  const userId = req.user.id;

  const layout = await prisma.layoutData.findUnique({
    where: { userId }
  });

  if (!layout) {
    return res.status(200).json({ positions: {} });
  }

  res.status(200).json({
    success: true,
    positions: layout.positions
  });
});

module.exports = {
  createPerson,
  getPersons: getAllPersons,
  getPerson: getPersonById,
  updatePerson,
  deletePerson,
  searchPersons,
  updatePersonPosition,
  saveLayout,
  getLayout
};
