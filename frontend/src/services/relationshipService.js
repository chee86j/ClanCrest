import api from "./api";

/**
 * Service for managing relationship data
 */
const relationshipService = {
  /**
   * Get all relationships
   * @returns {Promise} Promise with all relationships
   */
  getAllRelationships: async () => {
    try {
      const response = await api.get("/relationships");
      return response.data;
    } catch (error) {
      console.error("Error fetching relationships:", error);
      throw error;
    }
  },

  /**
   * Get a specific relationship by ID
   * @param {string} id - Relationship ID
   * @returns {Promise} Promise with relationship data
   */
  getRelationshipById: async (id) => {
    try {
      const response = await api.get(`/relationships/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching relationship ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new relationship
   * @param {Object} relationshipData - Relationship data
   * @returns {Promise} Promise with created relationship
   */
  createRelationship: async (relationshipData) => {
    try {
      const response = await api.post("/relationships", relationshipData);
      return response.data;
    } catch (error) {
      console.error("Error creating relationship:", error);
      throw error;
    }
  },

  /**
   * Update an existing relationship
   * @param {string} id - Relationship ID
   * @param {Object} relationshipData - Updated relationship data
   * @returns {Promise} Promise with updated relationship
   */
  updateRelationship: async (id, relationshipData) => {
    try {
      const response = await api.patch(
        `/relationships/${id}`,
        relationshipData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating relationship ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a relationship
   * @param {string} id - Relationship ID
   * @returns {Promise} Promise with deletion result
   */
  deleteRelationship: async (id) => {
    try {
      const response = await api.delete(`/relationships/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting relationship ${id}:`, error);
      throw error;
    }
  },
};

export default relationshipService;
