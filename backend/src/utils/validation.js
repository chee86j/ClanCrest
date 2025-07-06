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
};
