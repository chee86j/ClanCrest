import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import FamilyTree from "../components/tree/FamilyTree";

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <img
              src={user.picture}
              alt={`${user.name}'s profile`}
              className="h-24 w-24 rounded-full"
            />
          </div>
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Welcome back,</span>
            <span className="block text-blue-600">{user.name} 👋</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Build and explore your family tree with our intuitive tools.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Your Family Tree
          </h2>
          <FamilyTree />
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">
              Add Family Members
            </h3>
            <p className="mt-2 text-gray-500">
              Start building your family tree by adding family members and their
              relationships.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">
              Explore Relationships
            </h3>
            <p className="mt-2 text-gray-500">
              Discover how family members are connected with our relationship
              mapping tool.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">
              Share Your Tree
            </h3>
            <p className="mt-2 text-gray-500">
              Collaborate with family members to build a comprehensive family
              history.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
