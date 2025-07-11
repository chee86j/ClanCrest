import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import FamilyTreeWithRelativesTree from "../components/tree/FamilyTreeWithRelativesTree";
import Image01 from "../assets/images/01.png";
import Image02 from "../assets/images/02.png";
import Image03 from "../assets/images/03.png";
import Image04 from "../assets/images/04.png";

// Array of images for the animation frames
const frameImages = [Image01, Image02, Image03, Image04];

/**
 * Dashboard component
 * Main dashboard page showing the family tree visualization
 */
const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [frameIndex, setFrameIndex] = useState(0);

  const nextFrame = () => setFrameIndex((frameIndex + 1) % frameImages.length);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left sidebar */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              Welcome, {user?.name || "User"}!
            </h2>
            <p className="text-gray-600 mb-4">
              Start building your family tree by adding family members and
              creating relationships.
            </p>
            <Link
              to="/person-manager"
              className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              Manage People
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-3">Quick Tips</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Click on a person to view or edit their details</li>
              <li>Right-click on the canvas to add a new person</li>
              <li>Drag nodes to rearrange your family tree</li>
              <li>Use the controls to zoom in/out and fit the view</li>
            </ul>
          </div>
        </div>

        {/* Main content */}
        <div className="md:w-3/4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Your Family Tree
            </h2>
            <FamilyTreeWithRelativesTree />
          </div>

          {/* Animation frame */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">Family Connections</h3>
            <div className="flex justify-center">
              <img
                src={frameImages[frameIndex]}
                alt={`Animation frame ${frameIndex + 1}`}
                className="max-h-[200px] object-contain cursor-pointer"
                onClick={nextFrame}
              />
            </div>
            <p className="text-gray-600 text-center mt-4">
              Click the image to see different family connection types
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
