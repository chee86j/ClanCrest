import { useState } from "react";
import axios from "axios";

/**
 * Component for finding kinship relationship between two people
 */
const KinshipFinder = ({ persons }) => {
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFindKinship = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to use this feature");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/kinship`,
        {
          params: { from: fromId, to: toId },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setResult(response.data);
    } catch (err) {
      console.error("Kinship error:", err);
      if (err.response?.status === 401) {
        setError("Authentication required. Please log in again.");
      } else {
        setError(
          err.response?.data?.error || "Failed to fetch kinship relationship"
        );
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Find Relationship</h2>

      <form onSubmit={handleFindKinship} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">From Person:</label>
          <select
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a person...</option>
            {persons?.map((person) => (
              <option key={person.id} value={person.id}>
                {person.nameZh
                  ? `${person.name} (${person.nameZh})`
                  : person.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">To Person:</label>
          <select
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a person...</option>
            {persons?.map((person) => (
              <option key={person.id} value={person.id}>
                {person.nameZh
                  ? `${person.name} (${person.nameZh})`
                  : person.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          disabled={!fromId || !toId}
        >
          Find Relationship
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Relationship:</h3>
          <p className="text-lg">
            {result.relationship.english}
            {result.relationship.mandarin && (
              <span className="ml-2 text-gray-600">
                ({result.relationship.mandarin})
              </span>
            )}
          </p>
          {result.relationship.path.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Path: {result.relationship.path.join(" → ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default KinshipFinder;
