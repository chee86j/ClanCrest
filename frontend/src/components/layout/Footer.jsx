import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold flex items-center">
              <span className="material-icons mr-2">account_tree</span>
              ClanCrest
            </h2>
            <p className="text-sm text-gray-300 mt-1">
              Visualize your family connections
            </p>
          </div>
          <div className="text-sm text-gray-300">
            &copy; {new Date().getFullYear()} ClanCrest. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
