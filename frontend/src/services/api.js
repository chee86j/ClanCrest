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
   * Update a person's position
   * @param {number} id - Person ID
   * @param {Object} position - Position data {positionX, positionY}
   * @returns {Promise<Object>} Updated person
   */
  updatePosition: async (id, position) => {
    try {
      const response = await api.patch(
        `${API_ENDPOINTS.PERSONS}/${id}/position`,
        position
      );
      return response.data;
    } catch (error) {
      console.error(`🔥 Error updating position for person ${id}:`, error);
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
  
  /**
   * Save layout data
   * @param {Object} positions - Map of node positions
   * @returns {Promise<Object>} Response data
   */
  saveLayout: async (positions) => {
    try {
      console.log("Saving layout data:", positions);
      const response = await api.patch(
        `${API_ENDPOINTS.PERSONS}/layout`,
        { positions }
      );
      return response.data;
    } catch (error) {
      console.error("🔥 Error saving layout data:", error);
      throw error;
    }
  },
  
  /**
   * Get layout data
   * @returns {Promise<Object>} Layout data
   */
  getLayout: async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.PERSONS}/layout`);
      return response.data.positions || {};
    } catch (error) {
      console.error("🔥 Error getting layout data:", error);
      return {};
    }
  },
};

/**
 * Relationship-related API calls
 */
export const relationshipApi = {
  /**
   * Fetch all relationships
   * @returns {Promise<Object>} Object with data array of relationships
   */
  getAll: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.RELATIONSHIPS);
      console.log("Raw relationship response:", response.data);
      
      // Ensure we always return an array
      let relationships = [];
      if (Array.isArray(response.data)) {
        relationships = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        relationships = response.data.data;
      }
      
      console.log("Processed relationships in API:", relationships);
      return relationships;
    } catch (error) {
      console.error("🔥 Error fetching relationships:", error);
      return []; // Return empty array on error
    }
  },

  /**
   * Create a new relationship
   * @param {Object} relationshipData - Relationship data to create
   * @returns {Promise<Object>} Created relationship data
   */
  create: async (relationshipData) => {
    try {
      console.log("🔍 Creating relationship with data:", JSON.stringify(relationshipData, null, 2));
      
      const response = await api.post(
        API_ENDPOINTS.RELATIONSHIPS,
        relationshipData
      );
      
      console.log("✅ Relationship created successfully:", JSON.stringify(response.data, null, 2));
      
      // Return the created relationship data
      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error("🔥 Error creating relationship:", error);
      console.error("Error response:", error.response?.data);
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
      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error(`🔥 Error fetching relationship ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update an existing relationship
   * @param {number} id - Relationship ID
   * @param {Object} relationshipData - Updated relationship data
   * @returns {Promise<Object>} Updated relationship data
   */
  update: async (id, relationshipData) => {
    try {
      const response = await api.put(
        `${API_ENDPOINTS.RELATIONSHIPS}/${id}`,
        relationshipData
      );
      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
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
      return response.data;
    } catch (error) {
      console.error(`🔥 Error deleting relationship ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get relationships by person
   * @param {number} personId - Person ID
   * @returns {Promise<Array>} Array of relationships
   */
  getByPerson: async (personId) => {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.RELATIONSHIPS}/person/${personId}`
      );
      
      // Ensure we always return an array
      let relationships;
      if (Array.isArray(response.data)) {
        relationships = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        relationships = response.data.data;
      } else {
        relationships = [];
      }
      
      return relationships;
    } catch (error) {
      console.error(
        `🔥 Error fetching relationships for person ${personId}:`,
        error
      );
      return []; // Return empty array on error
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
      throw new Error(
        "Missing required fields: fromId, toId, and type are required"
      );
    }
    if (fromId === toId) {
      throw new Error("A person cannot have a relationship with themselves");
    }
    return true;
  },
};

export default api;
