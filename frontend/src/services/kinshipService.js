import api from "./api";

/**
 * Service for kinship operations and relationship path finding
 */
const kinshipService = {
  /**
   * Find the relationship path between two persons
   * @param {string} fromId - ID of the starting person
   * @param {string} toId - ID of the target person
   * @param {string} language - Language code ('en' for English, 'zh' for Mandarin)
   * @returns {Promise} Promise with relationship path and kinship term
   */
  findRelationship: async (fromId, toId, language = "en") => {
    try {
      // Check if API is available
      if (import.meta.env.DEV && import.meta.env.VITE_USE_API !== "true") {
        // Fallback to local implementation if API is not available
        const { findRelationshipPath, mapPathToKinshipTerm } = await import(
          "../utils/treeDataAdapter"
        );

        // Get all persons and relationships
        const personsResponse = await api.get("/persons");
        const relationshipsResponse = await api.get("/relationships");

        const persons = personsResponse.data;
        const relationships = relationshipsResponse.data;

        // Find the path
        const path = findRelationshipPath(persons, relationships, fromId, toId);

        // Map to kinship term
        const kinship = mapPathToKinshipTerm(path, language);

        return {
          path,
          kinship,
          fromPerson: persons.find((p) => p.id === fromId),
          toPerson: persons.find((p) => p.id === toId),
        };
      } else {
        // Use API
        const response = await api.post("/kinship/find", {
          fromId,
          toId,
          language,
        });

        return response.data;
      }
    } catch (error) {
      console.error("Error finding relationship:", error);
      throw error;
    }
  },

  /**
   * Get kinship term for a relationship path
   * @param {Array} path - Relationship path
   * @param {string} language - Language code
   * @returns {Object} Kinship term and description
   */
  getKinshipTerm: async (path, language = "en") => {
    try {
      // Import the function from treeDataAdapter
      const { mapPathToKinshipTerm } = await import("../utils/treeDataAdapter");

      // Map to kinship term
      return mapPathToKinshipTerm(path, language);
    } catch (error) {
      console.error("Error getting kinship term:", error);
      throw error;
    }
  },

  /**
   * Ask the AI chatbot about a kinship relationship
   * @param {string} question - Question about kinship
   * @returns {Promise} Promise with AI response
   */
  askKinshipQuestion: async (question) => {
    try {
      // Use API
      const response = await api.post("/kinship/ask", { question });
      return response.data;
    } catch (error) {
      console.error("Error asking kinship question:", error);

      // Fallback if API fails
      return {
        answer: `Sorry, I couldn't process your question: "${question}". The AI service might be unavailable.`,
      };
    }
  },
};

export default kinshipService;
