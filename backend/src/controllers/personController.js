const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Get all persons
 */
const getAllPersons = async (req, res, next) => {
  try {
    const persons = await prisma.person.findMany();
    res.status(200).json(persons);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific person by ID
 */
const getPersonById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        relationshipsFrom: true,
        relationshipsTo: true,
      },
    });

    if (!person) {
      return res.status(404).json({ message: "Person not found" });
    }

    res.status(200).json(person);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new person
 */
const createPerson = async (req, res, next) => {
  try {
    const { firstName, lastName, chineseName, birthDate, gender } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !gender) {
      return res.status(400).json({
        message: "First name, last name, and gender are required",
      });
    }

    // Create new person
    const newPerson = await prisma.person.create({
      data: {
        firstName,
        lastName,
        chineseName,
        birthDate: birthDate ? new Date(birthDate) : null,
        gender,
      },
    });

    res.status(201).json(newPerson);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a person
 */
const updatePerson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, chineseName, birthDate, gender } = req.body;

    // Check if person exists
    const existingPerson = await prisma.person.findUnique({
      where: { id },
    });

    if (!existingPerson) {
      return res.status(404).json({ message: "Person not found" });
    }

    // Update person
    const updatedPerson = await prisma.person.update({
      where: { id },
      data: {
        firstName: firstName || existingPerson.firstName,
        lastName: lastName || existingPerson.lastName,
        chineseName:
          chineseName !== undefined ? chineseName : existingPerson.chineseName,
        birthDate: birthDate ? new Date(birthDate) : existingPerson.birthDate,
        gender: gender || existingPerson.gender,
      },
    });

    res.status(200).json(updatedPerson);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a person
 */
const deletePerson = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if person exists
    const existingPerson = await prisma.person.findUnique({
      where: { id },
    });

    if (!existingPerson) {
      return res.status(404).json({ message: "Person not found" });
    }

    // Delete related relationships first to avoid foreign key constraints
    await prisma.relationship.deleteMany({
      where: {
        OR: [{ fromId: id }, { toId: id }],
      },
    });

    // Delete person
    await prisma.person.delete({
      where: { id },
    });

    res.status(200).json({ message: "Person deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete all persons for the current user
 */
const deleteAllPersons = async (req, res, next) => {
  try {
    // Delete all relationships first to avoid foreign key constraints
    await prisma.relationship.deleteMany({});

    // Delete all persons
    await prisma.person.deleteMany({});

    res
      .status(200)
      .json({ message: "All family members deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  deleteAllPersons,
};
