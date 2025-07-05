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
      return response.data;
    } catch (error) {
      console.error("🔥 Error creating relationship:", error);
      throw error;
    }
  },
};

export default api;
