import api from "./api";

/**
 * Service for managing person data
 */
const personService = {
  /**
   * Get all persons
   * @returns {Promise} Promise with all persons
   */
  getAllPersons: async () => {
    try {
      const response = await api.get("/persons");
      return response.data;
    } catch (error) {
      console.error("Error fetching persons:", error);
      throw error;
    }
  },

  /**
   * Get a specific person by ID
   * @param {string} id - Person ID
   * @returns {Promise} Promise with person data
   */
  getPersonById: async (id) => {
    try {
      const response = await api.get(`/persons/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching person ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new person
   * @param {Object} personData - Person data
   * @returns {Promise} Promise with created person
   */
  createPerson: async (personData) => {
    try {
      const response = await api.post("/persons", personData);
      return response.data;
    } catch (error) {
      console.error("Error creating person:", error);
      throw error;
    }
  },

  /**
   * Update an existing person
   * @param {string} id - Person ID
   * @param {Object} personData - Updated person data
   * @returns {Promise} Promise with updated person
   */
  updatePerson: async (id, personData) => {
    try {
      const response = await api.patch(`/persons/${id}`, personData);
      return response.data;
    } catch (error) {
      console.error(`Error updating person ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a person
   * @param {string} id - Person ID
   * @returns {Promise} Promise with deletion result
   */
  deletePerson: async (id) => {
    try {
      const response = await api.delete(`/persons/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting person ${id}:`, error);
      throw error;
    }
  },
};

export default personService;
