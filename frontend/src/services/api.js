import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL:
    (import.meta.env.VITE_BACKEND_URL &&
      `${import.meta.env.VITE_BACKEND_URL}/api`) ||
    "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error codes
    if (error.response) {
      const { status } = error.response;

      // Handle unauthorized errors
      if (status === 401) {
        localStorage.removeItem("token");
        // Redirect to login page if implemented
      }

      // Log errors
      console.error("API Error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;
