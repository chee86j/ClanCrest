import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../services/authService";
import Layout from "../components/layout/Layout";

const Auth = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get the authorization code from the URL
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get("code");

        if (!code) {
          throw new Error("No authorization code found in the URL");
        }

        // Handle the OAuth callback
        await authService.handleOAuthCallback(code);

        // Redirect to dashboard on success
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("Authentication error:", err);
        setError(err.message || "Authentication failed. Please try again.");
        setLoading(false);
      }
    };

    handleAuth();
  }, [location, navigate]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        {loading ? (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Authenticating...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 max-w-md">
              <p className="font-bold">Authentication Error</p>
              <p>{error}</p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Return to Home
            </button>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default Auth;
