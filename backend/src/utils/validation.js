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
 * Validate relationship data
 * @param {Object} relationship - The relationship to validate
 * @param {Array} existingRelationships - List of existing relationships
 * @returns {Object} Validation result with isValid and error message
 */
const validateRelationship = (relationship, existingRelationships) => {
  // Ensure relationship is an object
  if (!relationship || typeof relationship !== 'object') {
    return {
      isValid: false,
      error: 'Invalid relationship data',
    };
  }

  // Ensure existingRelationships is an array
  const relationships = Array.isArray(existingRelationships) ? existingRelationships : [];

  // Convert IDs to integers
  const fromId = parseInt(relationship.fromId);
  const toId = parseInt(relationship.toId);
  const relationshipId = relationship.id ? parseInt(relationship.id) : null;

  // Early return if basic data is missing or invalid
  if (isNaN(fromId) || isNaN(toId) || !relationship.type) {
    return {
      isValid: false,
      error: 'Missing or invalid required relationship data',
    };
  }

  // Prevent self-relationships
  if (fromId === toId) {
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
  const hasExistingRelationship = relationships.some(
    (rel) => {
      const relFromId = parseInt(rel.fromId);
      const relToId = parseInt(rel.toId);
      const relId = rel.id ? parseInt(rel.id) : null;
      
      // Skip comparing with self if updating
      if (relationshipId && relId === relationshipId) {
        return false;
      }
      
      return (relFromId === fromId && relToId === toId) ||
             (relFromId === toId && relToId === fromId);
    }
  );

  if (hasExistingRelationship && !relationshipId) {
    return {
      isValid: false,
      error: 'A relationship already exists between these persons',
    };
  }

  // Create a normalized relationship object for consistency checks
  const normalizedRelationship = {
    ...relationship,
    id: relationshipId,
    fromId,
    toId
  };

  // Validate relationship consistency
  const consistencyCheck = checkRelationshipConsistency(
    normalizedRelationship,
    relationships
  );
  if (!consistencyCheck.isValid) {
    return consistencyCheck;
  }

  // Check for circular relationships
  const circularCheck = checkCircularRelationships(
    normalizedRelationship,
    relationships
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
  // Ensure we have valid IDs and type
  const fromId = parseInt(relationship.fromId);
  const toId = parseInt(relationship.toId);
  const { type, id: relationshipId } = relationship;
  
  if (isNaN(fromId) || isNaN(toId) || !type) {
    return {
      isValid: false,
      error: 'Invalid relationship data for consistency check',
    };
  }

  // Ensure existingRelationships is an array
  const relationships = Array.isArray(existingRelationships) ? existingRelationships : [];

  // Get all relationships for both persons
  const fromRelationships = relationships.filter(
    (rel) => parseInt(rel.fromId) === fromId || parseInt(rel.toId) === fromId
  );
  const toRelationships = relationships.filter(
    (rel) => parseInt(rel.fromId) === toId || parseInt(rel.toId) === toId
  );

  switch (type) {
    case 'parent':
      // Check if the child already has this person as a parent
      const hasParent = toRelationships.some(
        (rel) =>
          (rel.type === 'parent' && parseInt(rel.fromId) === fromId) ||
          (rel.type === 'child' && parseInt(rel.toId) === fromId)
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
          (rel.type === 'child' && parseInt(rel.fromId) === fromId) ||
          (rel.type === 'parent' && parseInt(rel.toId) === fromId)
      );
      if (hasChild) {
        return {
          isValid: false,
          error: 'This parent-child relationship already exists',
        };
      }
      break;

    case 'spouse':
      // Check if either person already has a spouse other than each other
      const hasSpouse = [...fromRelationships, ...toRelationships].some(
        (rel) => {
          // Skip checking the current relationship being edited
          if (relationshipId && rel.id === relationshipId) {
            return false;
          }
          
          // Skip checking reciprocal spouse relationships between these two people
          if (rel.type === 'spouse') {
            if ((parseInt(rel.fromId) === fromId && parseInt(rel.toId) === toId) ||
                (parseInt(rel.fromId) === toId && parseInt(rel.toId) === fromId)) {
              return false;
            }
            
            // Check if either person has a spouse other than each other
            if (parseInt(rel.fromId) === fromId || parseInt(rel.toId) === fromId ||
                parseInt(rel.fromId) === toId || parseInt(rel.toId) === toId) {
              return true;
            }
          }
          return false;
        }
      );
      
      if (hasSpouse) {
        return {
          isValid: false,
          error: 'One of the persons already has a spouse',
        };
      }
      break;

    case 'sibling':
      // Get parents for both persons
      const getParents = (personId) =>
        relationships
          .filter(
            (rel) =>
              (rel.type === 'parent' && parseInt(rel.toId) === personId) ||
              (rel.type === 'child' && parseInt(rel.fromId) === personId)
          )
          .map((rel) => (rel.type === 'parent' ? parseInt(rel.fromId) : parseInt(rel.toId)));

      const fromParents = getParents(fromId);
      const toParents = getParents(toId);
      const shareParent = fromParents.some((p1) =>
        toParents.some((p2) => p1 === p2)
      );

      if (!shareParent && (fromParents.length > 0 || toParents.length > 0)) {
        return {
          isValid: false,
          error: 'Siblings should share at least one parent',
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
  // Ensure we have valid IDs and type
  const fromId = parseInt(relationship.fromId);
  const toId = parseInt(relationship.toId);
  const { type } = relationship;
  
  if (isNaN(fromId) || isNaN(toId) || !type) {
    return {
      isValid: false,
      error: 'Invalid relationship data for circular check',
    };
  }

  if (type === 'spouse' || type === 'sibling') {
    return { isValid: true }; // These types can't create circles
  }

  // Ensure existingRelationships is an array
  const relationships = Array.isArray(existingRelationships) ? existingRelationships : [];

  // Build a graph of parent-child relationships
  const graph = new Map();
  [...relationships, relationship].forEach((rel) => {
    if (rel.type !== 'parent' && rel.type !== 'child') return;

    const relFromId = parseInt(rel.fromId);
    const relToId = parseInt(rel.toId);
    
    if (isNaN(relFromId) || isNaN(relToId)) return;

    if (!graph.has(relFromId)) graph.set(relFromId, new Set());
    if (!graph.has(relToId)) graph.set(relToId, new Set());

    if (rel.type === 'parent') {
      graph.get(relFromId).add(relToId);
    } else {
      graph.get(relToId).add(relFromId);
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
  // Ensure personId is a number and relationships is an array
  const id = parseInt(personId);
  const rels = Array.isArray(relationships) ? relationships : [];
  
  if (isNaN(id)) return [];

  return rels
    .filter(
      (rel) => {
        const relFromId = parseInt(rel.fromId);
        const relToId = parseInt(rel.toId);
        
        return (rel.type === 'parent' && relToId === id) ||
               (rel.type === 'child' && relFromId === id);
      }
    )
    .map((rel) => {
      const relFromId = parseInt(rel.fromId);
      const relToId = parseInt(rel.toId);
      return (rel.type === 'parent' ? relFromId : relToId);
    });
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
