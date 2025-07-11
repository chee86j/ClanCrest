import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import FamilyTreeWithRelativesTree from "../components/tree/FamilyTreeWithRelativesTree";

/**
 * Authentication gate component that shows login prompt for non-authenticated users
 * @param {Object} props - Component props
 * @returns {JSX.Element} Component that conditionally renders children or login prompt
 */
const AuthGate = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-100 p-8 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[400px]">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Login Required
        </h3>
        <p className="text-gray-600 mb-6 text-center">
          Please sign in to create and view your family tree
        </p>
        <Link
          to="/auth"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return children;
};

const Home = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Map Your Family's Legacy with</span>
            <span className="block text-blue-600">ClanCrest 🏰</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Create beautiful family trees with our intuitive drag-and-drop
            interface. Support for multilingual names and relationship mapping
            in both English and Mandarin.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                to="/auth"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link
                to="/about"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-semibold text-center text-gray-800">
                Your Family Tree
              </h2>
            </div>
            <div className="flex-1 relative">
              <AuthGate>
                <FamilyTreeWithRelativesTree />
              </AuthGate>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
            Key Features
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">
                Drag & Drop Interface
              </h3>
              <p className="mt-2 text-gray-500">
                Build your family tree visually with our intuitive drag-and-drop
                interface.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">
                Multilingual Support
              </h3>
              <p className="mt-2 text-gray-500">
                Add names in multiple languages, including Chinese characters.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">
                Relationship Mapping
              </h3>
              <p className="mt-2 text-gray-500">
                Discover family connections with our "Who Am I to You?" feature.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
