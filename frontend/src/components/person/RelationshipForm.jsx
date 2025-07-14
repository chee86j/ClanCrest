import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const RelationshipForm = ({ persons, selectedPerson, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    fromId: "",
    toId: "",
    type: "",
  });

  // Set the selected person as the "from" person by default
  useEffect(() => {
    if (selectedPerson) {
      setFormData((prev) => ({
        ...prev,
        fromId: selectedPerson.id,
      }));
    }
  }, [selectedPerson]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Filter out the selected person from the "to" dropdown
  const filteredPersons = persons.filter(
    (person) => person.id !== formData.fromId
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="fromId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          From Person *
        </label>
        <select
          id="fromId"
          name="fromId"
          value={formData.fromId}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Person</option>
          {persons.map((person) => (
            <option key={`from-${person.id}`} value={person.id}>
              {person.firstName} {person.lastName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Relationship Type *
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Relationship Type</option>
          <option value="parent">Parent Of</option>
          <option value="child">Child Of</option>
          <option value="spouse">Spouse Of</option>
          <option value="sibling">Sibling Of</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="toId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          To Person *
        </label>
        <select
          id="toId"
          name="toId"
          value={formData.toId}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Person</option>
          {filteredPersons.map((person) => (
            <option key={`to-${person.id}`} value={person.id}>
              {person.firstName} {person.lastName}
            </option>
          ))}
        </select>
      </div>

      {formData.type && formData.fromId && formData.toId && (
        <div className="p-3 bg-blue-50 rounded-md text-sm">
          <p className="font-medium">Relationship Preview:</p>
          <p>
            {persons.find((p) => p.id === formData.fromId)?.firstName}{" "}
            {persons.find((p) => p.id === formData.fromId)?.lastName} is the{" "}
            {formData.type} of{" "}
            {persons.find((p) => p.id === formData.toId)?.firstName}{" "}
            {persons.find((p) => p.id === formData.toId)?.lastName}
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="py-2 px-4 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
        >
          Create Relationship
        </button>
      </div>
    </form>
  );
};

RelationshipForm.propTypes = {
  persons: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedPerson: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default RelationshipForm;
