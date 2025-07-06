const { PrismaClient } = require("@prisma/client");
const { findKinshipPath } = require("../utils/kinshipResolver");
const {
  ValidationError,
  NotFoundError,
  errorHandler,
  validateNumericId,
} = require("../utils/errorHandler");

const prisma = new PrismaClient();

/**
 * Get the kinship relationship between two people
 * @param {Request} req - Express request object with fromId and toId query params
 * @param {Response} res - Express response object
 */
const getKinship = errorHandler(async (req, res) => {
  const fromId = validateNumericId(req.query.from, "from ID");
  const toId = validateNumericId(req.query.to, "to ID");

  console.log("🔍 Finding kinship between:", { fromId, toId });

  // Verify both people exist
  const [fromPerson, toPerson] = await Promise.all([
    prisma.person.findUnique({ where: { id: fromId } }),
    prisma.person.findUnique({ where: { id: toId } }),
  ]);

  if (!fromPerson || !toPerson) {
    throw new NotFoundError("One or both people");
  }

  const relationship = await findKinshipPath(fromId, toId, prisma);
  console.log("✅ Kinship found:", relationship.english);

  res.json({
    from: {
      id: fromPerson.id,
      name: fromPerson.name,
      nameZh: fromPerson.nameZh,
    },
    to: {
      id: toPerson.id,
      name: toPerson.name,
      nameZh: toPerson.nameZh,
    },
    relationship: {
      path: relationship.path,
      english: relationship.english,
      mandarin: relationship.mandarin,
    },
  });
});

module.exports = {
  getKinship,
};
