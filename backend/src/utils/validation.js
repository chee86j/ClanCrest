/**
 * Validation utilities for person data
 * Following DRY principles and single responsibility pattern
 */

/**
 * Validate person name
 * @param {string} name - Person name to validate
 * @returns {Object} Validation result with isValid and error message
 */
const validatePersonName = (name) => {
  if (!name || typeof name !== "string") {
    return {
      isValid: false,
      error: "Name is required and must be a string",
    };
  }

  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return {
      isValid: false,
      error: "Name cannot be empty",
    };
  }

  if (trimmedName.length > 100) {
    return {
      isValid: false,
      error: "Name cannot exceed 100 characters",
    };
  }

  return {
    isValid: true,
    value: trimmedName,
  };
};

/**
 * Validate Chinese name (optional field)
 * @param {string} nameZh - Chinese name to validate
 * @returns {Object} Validation result with isValid and error message
 */
const validateChineseName = (nameZh) => {
  if (!nameZh) {
    return {
      isValid: true,
      value: null,
    };
  }

  if (typeof nameZh !== "string") {
    return {
      isValid: false,
      error: "Chinese name must be a string",
    };
  }

  const trimmedName = nameZh.trim();
  if (trimmedName.length > 100) {
    return {
      isValid: false,
      error: "Chinese name cannot exceed 100 characters",
    };
  }

  return {
    isValid: true,
    value: trimmedName || null,
  };
};

/**
 * Validate notes field (optional)
 * @param {string} notes - Notes to validate
 * @returns {Object} Validation result with isValid and error message
 */
const validateNotes = (notes) => {
  if (!notes) {
    return {
      isValid: true,
      value: null,
    };
  }

  if (typeof notes !== "string") {
    return {
      isValid: false,
      error: "Notes must be a string",
    };
  }

  const trimmedNotes = notes.trim();
  if (trimmedNotes.length > 1000) {
    return {
      isValid: false,
      error: "Notes cannot exceed 1000 characters",
    };
  }

  return {
    isValid: true,
    value: trimmedNotes || null,
  };
};

/**
 * Validate person ID
 * @param {string|number} id - Person ID to validate
 * @returns {Object} Validation result with isValid and error message
 */
const validatePersonId = (id) => {
  const parsedId = parseInt(id);

  if (isNaN(parsedId) || parsedId <= 0) {
    return {
      isValid: false,
      error: "Invalid person ID",
    };
  }

  return {
    isValid: true,
    value: parsedId,
  };
};

/**
 * Validate image ID (optional field)
 * @param {string|number} imageId - Image ID to validate
 * @returns {Object} Validation result with isValid and error message
 */
const validateImageId = (imageId) => {
  if (imageId === undefined || imageId === null) {
    return {
      isValid: true,
      value: 1, // Default to image 1
    };
  }

  const parsedId = parseInt(imageId);

  if (isNaN(parsedId) || parsedId < 1 || parsedId > 4) {
    return {
      isValid: false,
      error: "Image ID must be between 1 and 4",
    };
  }

  return {
    isValid: true,
    value: parsedId,
  };
};

/**
 * Validate search query
 * @param {string} query - Search query to validate
 * @returns {Object} Validation result with isValid and error message
 */
const validateSearchQuery = (query) => {
  if (!query || typeof query !== "string") {
    return {
      isValid: false,
      error: "Search query is required and must be a string",
    };
  }

  const trimmedQuery = query.trim();
  if (trimmedQuery.length === 0) {
    return {
      isValid: false,
      error: "Search query cannot be empty",
    };
  }

  if (trimmedQuery.length > 50) {
    return {
      isValid: false,
      error: "Search query cannot exceed 50 characters",
    };
  }

  return {
    isValid: true,
    value: trimmedQuery,
  };
};

/**
 * Validate gender field
 * @param {string} gender - Gender to validate
 * @returns {Object} Validation result with isValid and error message
 */
const validateGender = (gender) => {
  const validGenders = ['male', 'female', 'other'];
  
  if (!gender || typeof gender !== "string") {
    return {
      isValid: false,
      error: "Gender is required and must be a string",
    };
  }

  const normalizedGender = gender.toLowerCase().trim();
  
  if (!validGenders.includes(normalizedGender)) {
    return {
      isValid: false,
      error: "Gender must be one of: male, female, other",
    };
  }

  return {
    isValid: true,
    value: normalizedGender,
  };
};

/**
 * Validate relationship type
 * @param {string} type - Relationship type to validate
 * @returns {Object} Validation result with isValid and error message
 */
const validateRelationType = (type) => {
  const validTypes = ['parent', 'child', 'spouse', 'sibling'];
  
  if (!type || typeof type !== "string") {
    return {
      isValid: false,
      error: "Relationship type is required and must be a string",
    };
  }

  const normalizedType = type.toLowerCase().trim();
  
  if (!validTypes.includes(normalizedType)) {
    return {
      isValid: false,
      error: "Invalid relationship type. Must be one of: parent, child, spouse, sibling",
    };
  }

  return {
    isValid: true,
    value: normalizedType,
  };
};

/**
 * Validate DNA confirmation status
 * @param {boolean} dnaConfirmed - DNA confirmation status to validate
 * @returns {Object} Validation result with isValid and error message
 */
const validateDnaConfirmed = (dnaConfirmed) => {
  if (dnaConfirmed === undefined || dnaConfirmed === null) {
    return {
      isValid: true,
      value: false,
    };
  }

  if (typeof dnaConfirmed !== "boolean") {
    return {
      isValid: false,
      error: "DNA confirmation status must be a boolean",
    };
  }

  return {
    isValid: true,
    value: dnaConfirmed,
  };
};

/**
 * Validates relationship data and enforces relationship rules
 * @param {Object} relationship - The relationship to validate
 * @param {Array} existingRelationships - List of existing relationships
 * @returns {Object} Validation result with isValid and error message
 */
const validateRelationship = (relationship, existingRelationships) => {
  // Early return if basic data is missing
  if (!relationship.fromId || !relationship.toId || !relationship.type) {
    return {
      isValid: false,
      error: 'Missing required relationship data',
    };
  }

  // Prevent self-relationships
  if (relationship.fromId === relationship.toId) {
    return {
      isValid: false,
      error: 'Cannot create a relationship with self',
    };
  }

  // Validate relationship type
  const validTypes = ['parent', 'child', 'spouse', 'sibling'];
  if (!validTypes.includes(relationship.type)) {
    return {
      isValid: false,
      error: `Invalid relationship type. Must be one of: ${validTypes.join(', ')}`,
    };
  }

  // Check for existing relationship between these persons
  const hasExistingRelationship = existingRelationships.some(
    (rel) =>
      (rel.fromId === relationship.fromId && rel.toId === relationship.toId) ||
      (rel.fromId === relationship.toId && rel.toId === relationship.fromId)
  );

  if (hasExistingRelationship && !relationship.id) {
    return {
      isValid: false,
      error: 'A relationship already exists between these persons',
    };
  }

  // Validate relationship consistency
  const consistencyCheck = checkRelationshipConsistency(
    relationship,
    existingRelationships
  );
  if (!consistencyCheck.isValid) {
    return consistencyCheck;
  }

  // Check for circular relationships
  const circularCheck = checkCircularRelationships(
    relationship,
    existingRelationships
  );
  if (!circularCheck.isValid) {
    return circularCheck;
  }

  return { isValid: true };
};

/**
 * Checks for relationship consistency (parent-child, spouse, sibling rules)
 * @param {Object} relationship - The relationship to check
 * @param {Array} existingRelationships - List of existing relationships
 * @returns {Object} Validation result
 */
const checkRelationshipConsistency = (relationship, existingRelationships) => {
  const { fromId, toId, type } = relationship;

  // Get all relationships for both persons
  const fromRelationships = existingRelationships.filter(
    (rel) => rel.fromId === fromId || rel.toId === fromId
  );
  const toRelationships = existingRelationships.filter(
    (rel) => rel.fromId === toId || rel.toId === toId
  );

  switch (type) {
    case 'parent':
      // Check if the child already has this person as a parent
      const hasParent = toRelationships.some(
        (rel) =>
          (rel.type === 'parent' && rel.fromId === fromId) ||
          (rel.type === 'child' && rel.toId === fromId)
      );
      if (hasParent) {
        return {
          isValid: false,
          error: 'This parent-child relationship already exists',
        };
      }
      break;

    case 'child':
      // Check if the parent already has this person as a child
      const hasChild = toRelationships.some(
        (rel) =>
          (rel.type === 'child' && rel.fromId === fromId) ||
          (rel.type === 'parent' && rel.toId === fromId)
      );
      if (hasChild) {
        return {
          isValid: false,
          error: 'This parent-child relationship already exists',
        };
      }
      break;

    case 'spouse':
      // Check if either person already has a spouse
      const hasSpouse = [...fromRelationships, ...toRelationships].some(
        (rel) => rel.type === 'spouse'
      );
      if (hasSpouse) {
        return {
          isValid: false,
          error: 'One of the persons already has a spouse',
        };
      }
      break;

    case 'sibling':
      // Validate that they share at least one parent
      const fromParents = getParents(fromId, existingRelationships);
      const toParents = getParents(toId, existingRelationships);
      const shareParent = fromParents.some((p1) =>
        toParents.some((p2) => p1 === p2)
      );
      if (!shareParent) {
        return {
          isValid: false,
          error: 'Siblings must share at least one parent',
        };
      }
      break;
  }

  return { isValid: true };
};

/**
 * Checks for circular relationships in the family tree
 * @param {Object} relationship - The relationship to check
 * @param {Array} existingRelationships - List of existing relationships
 * @returns {Object} Validation result
 */
const checkCircularRelationships = (relationship, existingRelationships) => {
  const { fromId, toId, type } = relationship;

  if (type === 'spouse' || type === 'sibling') {
    return { isValid: true }; // These types can't create circles
  }

  // Build a graph of parent-child relationships
  const graph = new Map();
  [...existingRelationships, relationship].forEach((rel) => {
    if (rel.type !== 'parent' && rel.type !== 'child') return;

    if (!graph.has(rel.fromId)) graph.set(rel.fromId, new Set());
    if (!graph.has(rel.toId)) graph.set(rel.toId, new Set());

    if (rel.type === 'parent') {
      graph.get(rel.fromId).add(rel.toId);
    } else {
      graph.get(rel.toId).add(rel.fromId);
    }
  });

  // Check for cycles using DFS
  const visited = new Set();
  const recursionStack = new Set();

  function hasCycle(nodeId) {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = graph.get(nodeId) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  // Start DFS from the new relationship nodes
  if (hasCycle(fromId) || hasCycle(toId)) {
    return {
      isValid: false,
      error: 'This relationship would create a circular family connection',
    };
  }

  return { isValid: true };
};

/**
 * Gets the parent IDs for a person
 * @param {number} personId - The person's ID
 * @param {Array} relationships - List of relationships
 * @returns {Array} List of parent IDs
 */
const getParents = (personId, relationships) => {
  return relationships
    .filter(
      (rel) =>
        (rel.type === 'parent' && rel.toId === personId) ||
        (rel.type === 'child' && rel.fromId === personId)
    )
    .map((rel) => (rel.type === 'parent' ? rel.fromId : rel.toId));
};

module.exports = {
  validatePersonName,
  validateChineseName,
  validateNotes,
  validatePersonId,
  validateImageId,
  validateSearchQuery,
  validateGender,
  validateRelationType,
  validateDnaConfirmed,
  validateRelationship,
  checkRelationshipConsistency,
  checkCircularRelationships,
  getParents,
};
