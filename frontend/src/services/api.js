import axios from "axios";

/**
 * API endpoints configuration
 */
const API_ENDPOINTS = {
  PERSONS: "/persons",
  RELATIONSHIPS: "/relationships",
  AUTH: {
    GOOGLE: "/auth/google",
    PROFILE: "/auth/profile",
  },
};

/**
 * Create axios instance with default configuration
 */
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login on auth error
      localStorage.clear();
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

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
      console.error("🔥 Error fetching persons:", error);
      throw error;
    }
  },

  /**
   * Get a person by ID
   * @param {number} id - Person ID
   * @returns {Promise<Object>} Person data
   */
  getById: async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.PERSONS}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`🔥 Error fetching person ${id}:`, error);
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
      console.error("🔥 Error creating person:", error);
      throw error;
    }
  },

  /**
   * Update an existing person
   * @param {number} id - Person ID
   * @param {Object} personData - Updated person data
   * @returns {Promise<Object>} Updated person
   */
  update: async (id, personData) => {
    try {
      const response = await api.put(
        `${API_ENDPOINTS.PERSONS}/${id}`,
        personData
      );
      return response.data;
    } catch (error) {
      console.error(`🔥 Error updating person ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a person
   * @param {number} id - Person ID
   * @returns {Promise<Object>} Deletion status
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`${API_ENDPOINTS.PERSONS}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`🔥 Error deleting person ${id}:`, error);
      throw error;
    }
  },

  /**
   * Search persons by name
   * @param {string} query - Search query
   * @returns {Promise<Array>} Search results
   */
  search: async (query) => {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.PERSONS}/search?query=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      console.error("🔥 Error searching persons:", error);
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
      return { data: response.data || [] };
    } catch (error) {
      console.error("🔥 Error fetching relationships:", error);
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
      const response = await api.post(
        API_ENDPOINTS.RELATIONSHIPS,
        relationshipData
      );
      return { data: response.data };
    } catch (error) {
      console.error("🔥 Error creating relationship:", error);
      throw error;
    }
  },

  /**
   * Get a relationship by ID
   * @param {number} id - Relationship ID
   * @returns {Promise<Object>} Relationship data
   */
  getById: async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.RELATIONSHIPS}/${id}`);
      return { data: response.data };
    } catch (error) {
      console.error(`🔥 Error fetching relationship ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update an existing relationship
   * @param {number} id - Relationship ID
   * @param {Object} relationshipData - Updated relationship data
   * @returns {Promise<Object>} Updated relationship
   */
  update: async (id, relationshipData) => {
    try {
      const response = await api.put(
        `${API_ENDPOINTS.RELATIONSHIPS}/${id}`,
        relationshipData
      );
      return { data: response.data };
    } catch (error) {
      console.error(`🔥 Error updating relationship ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a relationship
   * @param {number} id - Relationship ID
   * @returns {Promise<Object>} Deletion status
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`${API_ENDPOINTS.RELATIONSHIPS}/${id}`);
      return { data: response.data };
    } catch (error) {
      console.error(`🔥 Error deleting relationship ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get relationships by person
   * @param {number} personId - Person ID
   * @returns {Promise<Array>} List of relationships
   */
  getByPerson: async (personId) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.RELATIONSHIPS}/person/${personId}`);
      return { data: response.data || [] };
    } catch (error) {
      console.error(`🔥 Error fetching relationships for person ${personId}:`, error);
      throw error;
    }
  },

  /**
   * Validate relationship data
   * @param {Object} relationshipData - Relationship data to validate
   * @returns {Promise<boolean>} True if valid
   */
  validateRelationship: async (relationshipData) => {
    const { fromId, toId, type } = relationshipData;
    if (!fromId || !toId || !type) {
      throw new Error("Missing required fields: fromId, toId, and type are required");
    }
    if (fromId === toId) {
      throw new Error("A person cannot have a relationship with themselves");
    }
    return true;
  },
};

export default api;
