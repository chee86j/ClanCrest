import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import LoginButton from "../auth/LoginButton";
import UserMenu from "../auth/UserMenu";
import authService from "../../services/authService";

const Navbar = ({ title = "ClanCrest" }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setError("Failed to authenticate");
        // Clear token if invalid
        authService.signOut();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setError(null);
  };

  const handleLoginError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center">
          <span className="material-icons mr-2">account_tree</span>
          {title}
        </Link>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-4">
            <Link to="/" className="hover:text-indigo-200 transition-colors">
              Home
            </Link>
            <Link
              to="/dashboard"
              className="hover:text-indigo-200 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/about"
              className="hover:text-indigo-200 transition-colors"
            >
              About
            </Link>
          </div>

          <div className="ml-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-indigo-600 animate-pulse"></div>
            ) : user ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <LoginButton
                onSuccess={handleLoginSuccess}
                onError={handleLoginError}
              />
            )}
          </div>

          {error && (
            <div className="absolute top-16 right-4 bg-red-50 text-red-700 px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  title: PropTypes.string,
};

export default Navbar;
