import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";

const Home = () => {
  return (
    <Layout>
      <div className="flex flex-col md:flex-row items-center justify-between py-8">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-4xl font-bold mb-4">
            Visualize Your Family Connections
          </h1>
          <p className="text-lg mb-6">
            ClanCrest helps you map, explore, and understand family
            relationships across generations with beautiful, interactive family
            trees.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors text-center"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="border border-gray-300 hover:border-gray-400 font-bold py-2 px-6 rounded-lg transition-colors text-center"
            >
              Learn More
            </Link>
          </div>
        </div>
        <div className="md:w-1/2">
          <img
            src="/src/assets/images/01.png"
            alt="Family Tree Example"
            className="rounded-lg shadow-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-indigo-600 mb-4">
            <span className="material-icons text-4xl">family_restroom</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Map Your Family</h3>
          <p>
            Create comprehensive family trees with detailed profiles for each
            family member, including photos and important life events.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-indigo-600 mb-4">
            <span className="material-icons text-4xl">account_tree</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Explore Relationships</h3>
          <p>
            Discover how family members are connected with our intelligent
            kinship mapping that identifies complex relationships.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-indigo-600 mb-4">
            <span className="material-icons text-4xl">language</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Multilingual Support</h3>
          <p>
            View family relationships in multiple languages, including English
            and Mandarin, with culturally accurate kinship terms.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
