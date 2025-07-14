import React from "react";
import Layout from "../components/layout/Layout";

const About = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About ClanCrest</h1>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="mb-4">
            ClanCrest is dedicated to helping people visualize, understand, and
            preserve their family connections across generations. We believe
            that understanding our family relationships enriches our lives and
            connects us to our heritage.
          </p>
          <p>
            Our platform combines intuitive family tree visualization with
            intelligent relationship mapping to make genealogy accessible and
            meaningful for everyone.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Interactive family tree visualization using react-d3-tree</li>
            <li>
              Intelligent kinship mapping to identify complex relationships
            </li>
            <li>
              Multilingual support with accurate kinship terms in English and
              Mandarin
            </li>
            <li>Customizable profiles for family members</li>
            <li>Export options for sharing and preserving your family tree</li>
            <li>AI-powered relationship assistant</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Technology</h2>
          <p className="mb-4">
            ClanCrest is built with modern web technologies to ensure a smooth,
            responsive experience:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Frontend: React.js with Tailwind CSS</li>
            <li>Visualization: react-d3-tree with customized components</li>
            <li>Backend: Node.js with Express</li>
            <li>Database: PostgreSQL with Prisma ORM</li>
            <li>AI Integration: OpenAI API for kinship intelligence</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
          <p>
            Ready to map your family connections? Head to the Dashboard to
            create your first family tree, or explore our documentation to learn
            more about ClanCrest's features.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;
