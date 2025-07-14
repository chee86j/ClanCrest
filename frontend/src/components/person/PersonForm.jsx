import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const PersonForm = ({ person, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    chineseName: "",
    gender: "",
    birthDate: "",
  });

  useEffect(() => {
    if (person) {
      // Format date for input if available
      const formattedDate = person.birthDate
        ? new Date(person.birthDate).toISOString().split("T")[0]
        : "";

      setFormData({
        firstName: person.firstName || "",
        lastName: person.lastName || "",
        chineseName: person.chineseName || "",
        gender: person.gender || "",
        birthDate: formattedDate,
      });
    }
  }, [person]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: person?.id, // Preserve ID if editing
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="chineseName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Chinese Name (中文名)
        </label>
        <input
          type="text"
          id="chineseName"
          name="chineseName"
          value={formData.chineseName}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label
          htmlFor="gender"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Gender *
        </label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="birthDate"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Birth Date
        </label>
        <input
          type="date"
          id="birthDate"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

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
          {person ? "Update" : "Create"} Person
        </button>
      </div>
    </form>
  );
};

PersonForm.propTypes = {
  person: PropTypes.shape({
    id: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    chineseName: PropTypes.string,
    gender: PropTypes.string,
    birthDate: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default PersonForm;
