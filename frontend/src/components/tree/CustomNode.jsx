import React from "react";
import PropTypes from "prop-types";

const CustomNode = ({ nodeData, onNodeClick }) => {
  const { name, firstName, lastName, chineseName, gender, attributes } =
    nodeData;

  // Use provided name or construct from first/last name
  const displayName = name || `${firstName || ""} ${lastName || ""}`.trim();

  // Determine background color based on gender
  const bgColor =
    gender === "male"
      ? "bg-blue-100"
      : gender === "female"
      ? "bg-pink-100"
      : "bg-gray-100";

  // Generate initials if no name is available
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (displayName) {
      return displayName.charAt(0).toUpperCase();
    }
    return "?";
  };

  return (
    <div
      className={`p-2 rounded-lg shadow-md ${bgColor} border border-gray-300 w-48 cursor-pointer`}
      onClick={() => onNodeClick(nodeData)}
    >
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold mr-2">
          {getInitials()}
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="font-semibold text-sm truncate">{displayName}</div>
          {chineseName && (
            <div className="text-xs text-gray-600 truncate">{chineseName}</div>
          )}
        </div>
      </div>

      {attributes && attributes.birthDate && (
        <div className="mt-1 text-xs text-gray-600">
          {new Date(attributes.birthDate).getFullYear()}
        </div>
      )}
    </div>
  );
};

CustomNode.propTypes = {
  nodeData: PropTypes.shape({
    name: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    chineseName: PropTypes.string,
    gender: PropTypes.string,
    attributes: PropTypes.object,
  }).isRequired,
  onNodeClick: PropTypes.func.isRequired,
};

export default CustomNode;
