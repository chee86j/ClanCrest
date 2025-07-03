import { Link } from "react-router-dom";
import FamilyTree from "../components/tree/FamilyTree";

const Home = () => {
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

        <div className="mt-16 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Try Our Interactive Family Tree Builder
          </h2>
          <FamilyTree />
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
