/**
 * Converts API person and relationship data to react-d3-tree compatible format
 * @param {Array} persons - Array of person objects from the API
 * @param {Array} relationships - Array of relationship objects from the API
 * @param {String} rootId - ID of the person to use as the root node (optional)
 * @returns {Object} - Tree data structure compatible with react-d3-tree
 */
export const convertToTreeData = (persons, relationships, rootId = null) => {
  if (!persons || !persons.length) {
    return { name: "No Data", children: [] };
  }

  // Create a map of persons by ID for quick lookup
  const personsMap = persons.reduce((map, person) => {
    map[person.id] = { ...person, children: [] };
    return map;
  }, {});

  // If no rootId is provided, find a person with no parents
  if (!rootId) {
    // Find all persons who are parents
    const parentIds = new Set(
      relationships
        .filter((rel) => rel.type === "parent")
        .map((rel) => rel.fromId)
    );

    // Find persons who are not children in any relationship
    const potentialRoots = persons.filter(
      (person) =>
        !relationships.some(
          (rel) => rel.type === "parent" && rel.toId === person.id
        )
    );

    // Use the first potential root, or the first person if no potential roots
    rootId = potentialRoots.length > 0 ? potentialRoots[0].id : persons[0].id;
  }

  // Build the tree structure
  relationships.forEach((rel) => {
    if (
      rel.type === "parent" &&
      personsMap[rel.fromId] &&
      personsMap[rel.toId]
    ) {
      personsMap[rel.fromId].children.push(personsMap[rel.toId]);
    }
  });

  // Handle spouse relationships
  relationships
    .filter((rel) => rel.type === "spouse")
    .forEach((rel) => {
      if (personsMap[rel.fromId] && personsMap[rel.toId]) {
        // If the person already has children, add the spouse as a special attribute
        personsMap[rel.fromId].spouse = personsMap[rel.toId];
        personsMap[rel.toId].spouse = personsMap[rel.fromId];
      }
    });

  // Convert the map to the tree structure starting from the root
  const buildTree = (personId) => {
    const person = personsMap[personId];
    if (!person) return null;

    const node = {
      name: `${person.firstName || ""} ${person.lastName || ""}`.trim(),
      firstName: person.firstName,
      lastName: person.lastName,
      chineseName: person.chineseName,
      gender: person.gender,
      id: person.id,
      attributes: {
        birthDate: person.birthDate,
      },
      children: person.children
        .map((child) => buildTree(child.id))
        .filter(Boolean),
    };

    // Add spouse as a child with special marker if present
    if (person.spouse) {
      node.attributes.hasSpouse = true;
    }

    return node;
  };

  return buildTree(rootId) || { name: "No Data", children: [] };
};

/**
 * Finds the shortest relationship path between two persons
 * @param {Array} persons - Array of person objects from the API
 * @param {Array} relationships - Array of relationship objects from the API
 * @param {String} fromId - ID of the starting person
 * @param {String} toId - ID of the target person
 * @returns {Array} - Array of relationship objects representing the path
 */
export const findRelationshipPath = (persons, relationships, fromId, toId) => {
  if (!persons || !relationships || !fromId || !toId) {
    return [];
  }

  // If same person, return empty path
  if (fromId === toId) {
    return [];
  }

  // Create an adjacency list representation of the relationship graph
  const graph = {};

  // Initialize graph with all persons
  persons.forEach((person) => {
    graph[person.id] = [];
  });

  // Add all relationships to the graph (bidirectional)
  relationships.forEach((rel) => {
    if (graph[rel.fromId] && graph[rel.toId]) {
      graph[rel.fromId].push({ id: rel.toId, type: rel.type, rel });
      // Add inverse relationship
      const inverseType = getInverseRelationType(rel.type);
      graph[rel.toId].push({ id: rel.fromId, type: inverseType, rel });
    }
  });

  // Breadth-first search to find shortest path
  const queue = [{ id: fromId, path: [] }];
  const visited = new Set([fromId]);

  while (queue.length > 0) {
    const { id, path } = queue.shift();

    // Check if we reached the target
    if (id === toId) {
      return path;
    }

    // Explore neighbors
    for (const neighbor of graph[id] || []) {
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        queue.push({
          id: neighbor.id,
          path: [
            ...path,
            {
              ...neighbor.rel,
              direction: neighbor.id === neighbor.rel.toId ? "to" : "from",
            },
          ],
        });
      }
    }
  }

  return []; // No path found
};

/**
 * Gets the inverse of a relationship type
 * @param {String} relationType - The relationship type to invert
 * @returns {String} - The inverse relationship type
 */
const getInverseRelationType = (relationType) => {
  switch (relationType) {
    case "parent":
      return "child";
    case "child":
      return "parent";
    case "spouse":
      return "spouse";
    case "sibling":
      return "sibling";
    default:
      return relationType;
  }
};

/**
 * Maps a relationship path to a kinship term
 * @param {Array} path - Array of relationship objects representing the path
 * @param {String} language - Language code ('en' for English, 'zh' for Mandarin)
 * @returns {Object} - Object containing kinship term and description
 */
export const mapPathToKinshipTerm = (path, language = "en") => {
  if (!path || path.length === 0) {
    return {
      term: language === "en" ? "self" : "自己",
      description: language === "en" ? "This is you" : "这是你自己",
    };
  }

  // For direct relationships (path length 1)
  if (path.length === 1) {
    const rel = path[0];
    const type = rel.type;
    const direction = rel.direction;

    // English terms
    if (language === "en") {
      if (type === "parent" && direction === "to") {
        return {
          term: "child",
          description: "Your child",
        };
      }
      if (type === "parent" && direction === "from") {
        return {
          term: "parent",
          description: "Your parent",
        };
      }
      if (type === "spouse") {
        return {
          term: "spouse",
          description: "Your spouse",
        };
      }
      if (type === "sibling") {
        return {
          term: "sibling",
          description: "Your sibling",
        };
      }
    }
    // Chinese terms
    else if (language === "zh") {
      if (type === "parent" && direction === "to") {
        return {
          term: "子女",
          description: "你的子女",
        };
      }
      if (type === "parent" && direction === "from") {
        return {
          term: "父母",
          description: "你的父母",
        };
      }
      if (type === "spouse") {
        return {
          term: "配偶",
          description: "你的配偶",
        };
      }
      if (type === "sibling") {
        return {
          term: "兄弟姐妹",
          description: "你的兄弟姐妹",
        };
      }
    }
  }

  // For two-step relationships (path length 2)
  if (path.length === 2) {
    const rel1 = path[0];
    const rel2 = path[1];
    const type1 = rel1.type;
    const dir1 = rel1.direction;
    const type2 = rel2.type;
    const dir2 = rel2.direction;

    // English terms
    if (language === "en") {
      // Grandparent relationship
      if (
        type1 === "parent" &&
        dir1 === "from" &&
        type2 === "parent" &&
        dir2 === "from"
      ) {
        return {
          term: "grandparent",
          description: "Your grandparent",
        };
      }
      // Grandchild relationship
      if (
        type1 === "parent" &&
        dir1 === "to" &&
        type2 === "parent" &&
        dir2 === "to"
      ) {
        return {
          term: "grandchild",
          description: "Your grandchild",
        };
      }
      // Aunt/Uncle relationship
      if (
        type1 === "parent" &&
        dir1 === "from" &&
        type2 === "sibling" &&
        dir2 === "from"
      ) {
        return {
          term: "aunt/uncle",
          description: "Your aunt or uncle",
        };
      }
      // Niece/Nephew relationship
      if (
        type1 === "sibling" &&
        dir1 === "from" &&
        type2 === "parent" &&
        dir2 === "to"
      ) {
        return {
          term: "niece/nephew",
          description: "Your niece or nephew",
        };
      }
      // Parent-in-law relationship
      if (type1 === "spouse" && type2 === "parent" && dir2 === "from") {
        return {
          term: "parent-in-law",
          description: "Your parent-in-law",
        };
      }
      // Child-in-law relationship
      if (type1 === "parent" && dir1 === "to" && type2 === "spouse") {
        return {
          term: "child-in-law",
          description: "Your child's spouse",
        };
      }
    }
    // Chinese terms
    else if (language === "zh") {
      // Grandparent relationship
      if (
        type1 === "parent" &&
        dir1 === "from" &&
        type2 === "parent" &&
        dir2 === "from"
      ) {
        return {
          term: "祖父母",
          description: "你的祖父母",
        };
      }
      // Grandchild relationship
      if (
        type1 === "parent" &&
        dir1 === "to" &&
        type2 === "parent" &&
        dir2 === "to"
      ) {
        return {
          term: "孙子女",
          description: "你的孙子女",
        };
      }
      // Aunt/Uncle relationship
      if (
        type1 === "parent" &&
        dir1 === "from" &&
        type2 === "sibling" &&
        dir2 === "from"
      ) {
        return {
          term: "姑姨舅叔",
          description: "你的姑姨舅叔",
        };
      }
      // Niece/Nephew relationship
      if (
        type1 === "sibling" &&
        dir1 === "from" &&
        type2 === "parent" &&
        dir2 === "to"
      ) {
        return {
          term: "侄子女/外甥",
          description: "你的侄子女或外甥",
        };
      }
      // Parent-in-law relationship
      if (type1 === "spouse" && type2 === "parent" && dir2 === "from") {
        return {
          term: "公婆/岳父母",
          description: "你的公婆或岳父母",
        };
      }
      // Child-in-law relationship
      if (type1 === "parent" && dir1 === "to" && type2 === "spouse") {
        return {
          term: "儿媳/女婿",
          description: "你的儿媳或女婿",
        };
      }
    }
  }

  // For more complex or longer relationships
  return {
    term: language === "en" ? "relative" : "亲戚",
    description: language === "en" ? "Your relative" : "你的亲戚",
  };
};

/**
 * Generates a unique ID for new persons or relationships
 * @returns {String} - Unique ID string
 */
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

/**
 * Extracts all unique persons from a tree data structure
 * @param {Object} treeData - Tree data structure from react-d3-tree
 * @returns {Array} - Array of person objects
 */
export const extractPersonsFromTree = (treeData) => {
  const persons = [];

  const traverseTree = (node) => {
    if (!node) return;

    // Extract person data from node
    const person = {
      id: node.id || generateUniqueId(),
      firstName: node.firstName || "",
      lastName: node.lastName || "",
      chineseName: node.chineseName || null,
      gender: node.gender || "unknown",
      birthDate: node.attributes?.birthDate || null,
    };

    persons.push(person);

    // Traverse children
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => traverseTree(child));
    }
  };

  traverseTree(treeData);
  return persons;
};

/**
 * Extracts all relationships from a tree data structure
 * @param {Object} treeData - Tree data structure from react-d3-tree
 * @returns {Array} - Array of relationship objects
 */
export const extractRelationshipsFromTree = (treeData) => {
  const relationships = [];

  const traverseTree = (node) => {
    if (!node) return;

    // Extract parent-child relationships
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        relationships.push({
          id: generateUniqueId(),
          fromId: node.id,
          toId: child.id,
          type: "parent",
        });

        traverseTree(child);
      });
    }
  };

  traverseTree(treeData);
  return relationships;
};

/**
 * Exports the tree data to a JSON file
 * @param {Object} treeData - Tree data structure
 * @returns {Object} - JSON object with persons and relationships
 */
export const exportTreeData = (treeData) => {
  const persons = extractPersonsFromTree(treeData);
  const relationships = extractRelationshipsFromTree(treeData);

  return {
    persons,
    relationships,
  };
};
