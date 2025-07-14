import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import kinshipService from "../../services/kinshipService";

const KinshipFinder = ({ persons, relationships }) => {
  const [fromPerson, setFromPerson] = useState("");
  const [toPerson, setToPerson] = useState("");
  const [language, setLanguage] = useState("en");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFindRelationship = async () => {
    if (!fromPerson || !toPerson) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const relationshipResult = await kinshipService.findRelationship(
        fromPerson,
        toPerson,
        language
      );

      setResult({
        fromName: `${relationshipResult.fromPerson.firstName} ${relationshipResult.fromPerson.lastName}`,
        toName: `${relationshipResult.toPerson.firstName} ${relationshipResult.toPerson.lastName}`,
        kinshipTerm: relationshipResult.kinship.term,
        kinshipDescription: relationshipResult.kinship.description,
        path: relationshipResult.path,
        language,
      });
    } catch (error) {
      console.error("Error finding relationship:", error);
      setError("Failed to find relationship. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-xl font-semibold mb-4">Kinship Finder</h2>
      <p className="text-sm text-gray-600 mb-4">
        Discover how two family members are related to each other
      </p>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="fromPerson"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            From Person
          </label>
          <select
            id="fromPerson"
            value={fromPerson}
            onChange={(e) => setFromPerson(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a person</option>
            {persons.map((person) => (
              <option key={`from-${person.id}`} value={person.id}>
                {person.firstName} {person.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="toPerson"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            To Person
          </label>
          <select
            id="toPerson"
            value={toPerson}
            onChange={(e) => setToPerson(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a person</option>
            {persons.map((person) => (
              <option key={`to-${person.id}`} value={person.id}>
                {person.firstName} {person.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="en">English</option>
            <option value="zh">Mandarin (中文)</option>
          </select>
        </div>

        <button
          onClick={handleFindRelationship}
          disabled={!fromPerson || !toPerson || loading}
          className={`w-full py-2 px-4 rounded-md ${
            !fromPerson || !toPerson || loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {loading ? "Finding Relationship..." : "Find Relationship"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Relationship Result</h3>
          <p className="mb-1">
            <span className="font-semibold">{result.fromName}</span> is{" "}
            <span className="font-semibold text-indigo-600">
              {result.kinshipTerm}
            </span>{" "}
            to <span className="font-semibold">{result.toName}</span>
          </p>
          {result.language === "zh" && (
            <p className="text-sm text-gray-600">
              {result.fromName} 是 {result.toName} 的{result.kinshipTerm}
            </p>
          )}
          <p className="text-sm text-gray-600 mt-2">
            {result.kinshipDescription}
          </p>

          {result.path && result.path.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">Relationship path:</p>
              <div className="text-xs text-gray-600 mt-1">
                {result.path.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <span>{index > 0 ? "→ " : ""}</span>
                    <span>{step.type} relationship</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

KinshipFinder.propTypes = {
  persons: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
    })
  ).isRequired,
  relationships: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      fromId: PropTypes.string.isRequired,
      toId: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default KinshipFinder;
