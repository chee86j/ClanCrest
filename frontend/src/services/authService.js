import api from "./api";

/**
 * Service for authentication operations
 */
const authService = {
  /**
   * Initialize Google OAuth client
   * @returns {Promise} Promise that resolves when Google OAuth is loaded
   */
  initGoogleAuth: async () => {
    return new Promise((resolve) => {
      // Load the Google Sign-In API script
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      document.body.appendChild(script);
    });
  },

  /**
   * Sign in with Google
   * @returns {Promise} Promise with user data
   */
  signInWithGoogle: async () => {
    try {
      // Get Google client ID from environment variables
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!clientId) {
        throw new Error(
          "Google Client ID not configured in environment variables"
        );
      }

      // Redirect to Google OAuth login
      const redirectUri = `${window.location.origin}/auth`;
      const scope = "profile email";

      // Build the OAuth URL
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=code&scope=${encodeURIComponent(
        scope
      )}&access_type=offline&prompt=consent`;

      // Redirect the browser to Google's OAuth page
      window.location.href = authUrl;

      // This function won't return anything since we're redirecting
      return new Promise(() => {});
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  },

  /**
   * Handle OAuth callback
   * @param {string} code - Authorization code from Google
   * @returns {Promise} Promise with user data
   */
  handleOAuthCallback: async (code) => {
    try {
      const response = await api.post("/auth/google/callback", { code });

      // Store the JWT token
      localStorage.setItem("token", response.data.token);

      return response.data.user;
    } catch (error) {
      console.error("Error handling OAuth callback:", error);
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {Boolean} True if user is authenticated
   */
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    return !!token;
  },

  /**
   * Sign out
   */
  signOut: () => {
    localStorage.removeItem("token");
  },

  /**
   * Get current user data
   * @returns {Promise} Promise with user data
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Error getting current user:", error);
      throw error;
    }
  },
};

export default authService;
