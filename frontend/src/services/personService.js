import api from "./api";

/**
 * Service for person-related API operations
 * Following DRY principles and single responsibility pattern
 */

/**
 * Get all persons for the authenticated user
 * @returns {Promise} Promise with persons data
 */
export const getAllPersons = async () => {
  try {
    const response = await api.get("/persons");
    return response.data;
  } catch (error) {
    console.error("Error fetching persons:", error);
    throw error;
  }
};

/**
 * Get a person by ID
 * @param {number} id - Person ID
 * @returns {Promise} Promise with person data
 */
export const getPersonById = async (id) => {
  try {
    const response = await api.get(`/persons/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching person ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new person
 * @param {Object} personData - Person data (name, nameZh, notes)
 * @returns {Promise} Promise with created person data
 */
export const createPerson = async (personData) => {
  try {
    const response = await api.post("/persons", personData);
    return response.data;
  } catch (error) {
    console.error("Error creating person:", error);
    throw error;
  }
};

/**
 * Update an existing person
 * @param {number} id - Person ID
 * @param {Object} personData - Updated person data
 * @returns {Promise} Promise with updated person data
 */
export const updatePerson = async (id, personData) => {
  try {
    const response = await api.put(`/persons/${id}`, personData);
    return response.data;
  } catch (error) {
    console.error(`Error updating person ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a person
 * @param {number} id - Person ID
 * @returns {Promise} Promise with deletion status
 */
export const deletePerson = async (id) => {
  try {
    const response = await api.delete(`/persons/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting person ${id}:`, error);
    throw error;
  }
};

/**
 * Search persons by name (English or Chinese)
 * @param {string} query - Search query
 * @returns {Promise} Promise with search results
 */
export const searchPersons = async (query) => {
  try {
    const response = await api.get(
      `/persons/search?query=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error searching persons:", error);
    throw error;
  }
};

/**
 * Update a person's position in the family tree
 * @param {number} id - Person ID
 * @param {Object} position - Position data {positionX, positionY}
 * @returns {Promise} Promise with updated person data
 */
export const updatePersonPosition = async (id, position) => {
  try {
    const response = await api.patch(`/persons/${id}/position`, position);
    return response.data;
  } catch (error) {
    console.error(`Error updating position for person ${id}:`, error);
    throw error;
  }
};

export default {
  getAllPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  searchPersons,
  updatePersonPosition,
};
