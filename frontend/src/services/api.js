import axios from 'axios';

/**
 * API endpoints configuration
 */
const API_ENDPOINTS = {
  PERSONS: '/api/persons',
  RELATIONSHIPS: '/api/relationships',
};

/**
 * Create axios instance with default configuration
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Person-related API calls
 */
export const personApi = {
  /**
   * Fetch all persons
   * @returns {Promise<Array>} List of persons
   */
  getAll: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PERSONS);
      return response.data;
    } catch (error) {
      console.error('🔥 Error fetching persons:', error);
      throw error;
    }
  },

  /**
   * Create a new person
   * @param {Object} personData - Person data to create
   * @returns {Promise<Object>} Created person
   */
  create: async (personData) => {
    try {
      const response = await api.post(API_ENDPOINTS.PERSONS, personData);
      return response.data;
    } catch (error) {
      console.error('🔥 Error creating person:', error);
      throw error;
    }
  },
};

/**
 * Relationship-related API calls
 */
export const relationshipApi = {
  /**
   * Fetch all relationships
   * @returns {Promise<Array>} List of relationships
   */
  getAll: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.RELATIONSHIPS);
      return response.data;
    } catch (error) {
      console.error('🔥 Error fetching relationships:', error);
      throw error;
    }
  },

  /**
   * Create a new relationship
   * @param {Object} relationshipData - Relationship data to create
   * @returns {Promise<Object>} Created relationship
   */
  create: async (relationshipData) => {
    try {
      const response = await api.post(API_ENDPOINTS.RELATIONSHIPS, relationshipData);
      return response.data;
    } catch (error) {
      console.error('🔥 Error creating relationship:', error);
      throw error;
    }
  },
}; 