/**
 * Maps relationship types to their inverse relationships
 */
const INVERSE_RELATIONSHIPS = {
  parent: "child",
  child: "parent",
  spouse: "spouse",
  sibling: "sibling",
};

/**
 * Maps relationship paths to English kinship terms
 */
const KINSHIP_TERMS = {
  parent: "Parent",
  child: "Child",
  spouse: "Spouse",
  sibling: "Sibling",
  "parent.parent": "Grandparent",
  "child.child": "Grandchild",
  "parent.child": "Sibling",
  "parent.spouse": "Step-parent",
  "spouse.child": "Step-child",
  "parent.parent.child": "Aunt/Uncle",
  "parent.child.child": "Niece/Nephew",
  "spouse.parent": "Parent-in-law",
  "spouse.sibling": "Sibling-in-law",
  "sibling.spouse": "Sibling-in-law",
  "child.spouse": "Child-in-law",
};

/**
 * Maps English kinship terms to Mandarin terms
 */
const MANDARIN_TERMS = {
  Parent: "父母",
  Child: "子女",
  Spouse: "配偶",
  Sibling: "兄弟姐妹",
  Grandparent: "祖父母",
  Grandchild: "孙子女",
  "Step-parent": "继父母",
  "Step-child": "继子女",
  "Aunt/Uncle": "姑姨叔舅",
  "Niece/Nephew": "侄子女",
  "Parent-in-law": "公婆/岳父母",
  "Sibling-in-law": "姻亲兄弟姐妹",
  "Child-in-law": "儿媳/女婿",
};

/**
 * Finds the shortest path between two people in the family tree using BFS
 * @param {number} fromId - Starting person ID
 * @param {number} toId - Target person ID
 * @param {PrismaClient} prisma - Prisma client instance
 * @returns {Promise<{path: string[], english: string, mandarin: string}>}
 */
async function findKinshipPath(fromId, toId, prisma) {
  // Early return if same person
  if (fromId === toId) {
    return { path: [], english: "Self", mandarin: "自己" };
  }

  const visited = new Set();
  const queue = [
    {
      id: fromId,
      path: [],
    },
  ];
  visited.add(fromId);

  while (queue.length > 0) {
    const current = queue.shift();

    // Get all relationships for current person
    const relationships = await prisma.relationship.findMany({
      where: {
        OR: [{ fromId: current.id }, { toId: current.id }],
      },
      include: {
        from: true,
        to: true,
      },
    });

    for (const rel of relationships) {
      const nextId = rel.fromId === current.id ? rel.toId : rel.fromId;
      const relType =
        rel.fromId === current.id ? rel.type : INVERSE_RELATIONSHIPS[rel.type];

      if (!visited.has(nextId)) {
        const newPath = [...current.path, relType];

        if (nextId === toId) {
          const pathKey = newPath.join(".");
          const english = KINSHIP_TERMS[pathKey] || "Extended Family";
          const mandarin = MANDARIN_TERMS[english] || "亲戚";

          return {
            path: newPath,
            english,
            mandarin,
          };
        }

        visited.add(nextId);
        queue.push({
          id: nextId,
          path: newPath,
        });
      }
    }
  }

  return {
    path: [],
    english: "No Relation Found",
    mandarin: "无亲属关系",
  };
}

module.exports = {
  findKinshipPath,
};
