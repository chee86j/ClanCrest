import { useAuth } from "../context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import FamilyTree from "../components/tree/FamilyTree";
import Image01 from "../assets/images/01.png";
import Image02 from "../assets/images/02.png";
import Image03 from "../assets/images/03.png";
import Image04 from "../assets/images/04.png";
import { useState } from "react";

const frameImages = [
  { src: Image01, alt: "Frame 1" },
  { src: Image02, alt: "Frame 2" },
  { src: Image03, alt: "Frame 3" },
  { src: Image04, alt: "Frame 4" },
];

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [frameIndex, setFrameIndex] = useState(0);

  const nextFrame = () => setFrameIndex((frameIndex + 1) % frameImages.length);
  const prevFrame = () =>
    setFrameIndex((frameIndex - 1 + frameImages.length) % frameImages.length);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex flex-col items-center mb-8">
            <div className="relative h-60 w-60 flex items-center justify-center group">
              {/* Profile Picture */}
              <img
                src={user.picture}
                alt={`${user.name}'s profile`}
                className="absolute h-20 w-20 rounded-full object-cover z-10"
                style={{
                  top: "calc(50% + 6px)",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              {/* Frame */}
              <img
                src={frameImages[frameIndex].src}
                alt={frameImages[frameIndex].alt}
                className="absolute h-60 w-60 z-20 pointer-events-auto cursor-pointer transition-transform duration-150 group-hover:scale-105"
                style={{
                  top: 0,
                  left: 0,
                }}
                onClick={nextFrame}
                title="Click to change frame"
              />
            </div>
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
            <Link
              to="/persons"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Manage Family Members
            </Link>
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
