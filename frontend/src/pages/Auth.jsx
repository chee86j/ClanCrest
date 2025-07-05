import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Handle OAuth callback when component mounts
    const handleGoogleCallback = async () => {
      // Check for access token in URL hash (Google OAuth returns it there)
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const error = params.get("error");

      if (error) {
        setError("Authentication failed. Please try again.");
        return;
      }

      if (accessToken) {
        try {
          // Get user info from Google using the access token
          const userInfoResponse = await fetch(
            `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
          );
          const userInfo = await userInfoResponse.json();

          if (!userInfo.email) {
            throw new Error("Failed to get user info from Google");
          }

          // Set user info immediately for better UX
          setUser({
            firstName: userInfo.given_name,
            lastName: userInfo.family_name,
            email: userInfo.email,
            picture: userInfo.picture,
          });

          // Send access token to backend
          const authResponse = await api.post("/auth/google", {
            token: accessToken,
          });

          // Update auth context and local storage
          login(authResponse.data.user, authResponse.data.token);

          // Set redirecting state
          setIsRedirecting(true);

          // Navigate after showing welcome message
          setTimeout(() => navigate("/dashboard"), 2000);
        } catch (err) {
          console.error("Auth error:", err);
          setError("Authentication failed. Please try again.");
          setUser(null);
          setIsRedirecting(false);
        }
      }
    };

    handleGoogleCallback();
  }, [navigate, login]);

  const handleCustomGoogleSignIn = () => {
    setError(null);
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth`);
    const scope = encodeURIComponent("openid email profile");
    const responseType = "token";

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;

    window.location.href = googleAuthUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {user ? (
          <>
            <div className="text-center">
              <img
                src={user.picture}
                alt={`${user.firstName}'s profile`}
                className="mx-auto h-24 w-24 rounded-full"
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Welcome, {user.firstName} {user.lastName}!
            </h2>
            {isRedirecting && (
              <p className="mt-2 text-center text-sm text-gray-600">
                Redirecting you to your dashboard...
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to ClanCrest
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Create and manage your family tree
            </p>
          </>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {!user && (
            <div className="w-full flex justify-center">
              <button
                onClick={handleCustomGoogleSignIn}
                className="cursor-pointer text-black flex gap-2 items-center bg-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-zinc-300 transition-all ease-in duration-200 border border-gray-300"
              >
                <svg
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6"
                >
                  <path
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                    fill="#FFC107"
                  ></path>
                  <path
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                    fill="#FF3D00"
                  ></path>
                  <path
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                    fill="#4CAF50"
                  ></path>
                  <path
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                    fill="#1976D2"
                  ></path>
                </svg>
                Continue with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
