const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Get family tree data in format compatible with frontend family chart library
 */
const getFamilyTreeData = async (req, res, next) => {
  try {
    // Get all persons with their relationships
    const persons = await prisma.person.findMany({
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

    // Transform data to match frontend family chart format
    const familyData = persons.map((person) => {
      const rels = {
        father: null,
        mother: null,
        spouses: [],
        children: [],
        siblings: [],
      };

      // Process relationships
      person.relationshipsFrom.forEach((rel) => {
        if (rel.type === "parent" && rel.to.gender === "male") {
          rels.father = rel.to.id;
        } else if (rel.type === "parent" && rel.to.gender === "female") {
          rels.mother = rel.to.id;
        } else if (rel.type === "spouse") {
          rels.spouses.push(rel.to.id);
        } else if (rel.type === "child") {
          rels.children.push(rel.to.id);
        } else if (rel.type === "sibling") {
          rels.siblings.push(rel.to.id);
        }
      });

      person.relationshipsTo.forEach((rel) => {
        if (rel.type === "parent" && rel.from.gender === "male") {
          rels.father = rel.from.id;
        } else if (rel.type === "parent" && rel.from.gender === "female") {
          rels.mother = rel.from.id;
        } else if (rel.type === "spouse") {
          rels.spouses.push(rel.from.id);
        } else if (rel.type === "child") {
          rels.children.push(rel.from.id);
        } else if (rel.type === "sibling") {
          rels.siblings.push(rel.from.id);
        }
      });

      return {
        id: person.id,
        name: `${person.firstName} ${person.lastName}`,
        chineseName: person.chineseName,
        birthDate: person.birthDate,
        gender: person.gender,
        rels,
      };
    });

    res.status(200).json(familyData);
  } catch (error) {
    next(error);
  }
};

/**
 * Save family tree data from frontend
 */
const saveFamilyTreeData = async (req, res, next) => {
  try {
    const { familyData } = req.body;

    if (!familyData || !Array.isArray(familyData)) {
      return res.status(400).json({
        message: "Family data array is required",
      });
    }

    // Clear existing data
    await prisma.relationship.deleteMany({});
    await prisma.person.deleteMany({});

    // Create persons first
    const personMap = new Map();

    for (const personData of familyData) {
      const [firstName, ...lastNameParts] = personData.name.split(" ");
      const lastName = lastNameParts.join(" ") || "";

      const person = await prisma.person.create({
        data: {
          firstName,
          lastName,
          chineseName: personData.chineseName,
          birthDate: personData.birthDate
            ? new Date(personData.birthDate)
            : null,
          gender: personData.gender,
        },
      });

      personMap.set(personData.id, person.id);
    }

    // Create relationships
    for (const personData of familyData) {
      const personId = personMap.get(personData.id);
      if (!personId) continue;

      const rels = personData.rels || {};

      // Create parent relationships
      if (rels.father && personMap.has(rels.father)) {
        await prisma.relationship.create({
          data: {
            fromId: personMap.get(rels.father),
            toId: personId,
            type: "parent",
          },
        });
      }

      if (rels.mother && personMap.has(rels.mother)) {
        await prisma.relationship.create({
          data: {
            fromId: personMap.get(rels.mother),
            toId: personId,
            type: "parent",
          },
        });
      }

      // Create spouse relationships
      for (const spouseId of rels.spouses || []) {
        if (personMap.has(spouseId)) {
          await prisma.relationship.create({
            data: {
              fromId: personId,
              toId: personMap.get(spouseId),
              type: "spouse",
            },
          });
        }
      }

      // Create sibling relationships
      for (const siblingId of rels.siblings || []) {
        if (personMap.has(siblingId)) {
          await prisma.relationship.create({
            data: {
              fromId: personId,
              toId: personMap.get(siblingId),
              type: "sibling",
            },
          });
        }
      }
    }

    res.status(200).json({
      message: "Family tree data saved successfully",
      count: familyData.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get family tree statistics
 */
const getFamilyTreeStats = async (req, res, next) => {
  try {
    const personCount = await prisma.person.count();
    const relationshipCount = await prisma.relationship.count();

    const genderStats = await prisma.person.groupBy({
      by: ["gender"],
      _count: {
        gender: true,
      },
    });

    const relationshipTypeStats = await prisma.relationship.groupBy({
      by: ["type"],
      _count: {
        type: true,
      },
    });

    res.status(200).json({
      personCount,
      relationshipCount,
      genderStats,
      relationshipTypeStats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFamilyTreeData,
  saveFamilyTreeData,
  getFamilyTreeStats,
};
