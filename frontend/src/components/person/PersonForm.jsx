import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Image01 from "../../assets/images/01.png";
import Image02 from "../../assets/images/02.png";
import Image03 from "../../assets/images/03.png";
import Image04 from "../../assets/images/04.png";

/**
 * PersonForm component for creating and editing persons
 *
 * @param {Object} props - Component props
 * @param {Object} props.initialData - Initial person data for editing (null for create mode)
 * @param {Function} props.onSubmit - Function called on form submission with form data
 * @param {Function} props.onCancel - Function called when cancel button is clicked
 * @param {boolean} props.isLoading - Whether the form is in a loading state
 * @param {boolean} props.isNewPerson - Whether this is a new person form
 */
const imageOptions = [
  { id: 1, src: Image01, alt: "Frame 1" },
  { id: 2, src: Image02, alt: "Frame 2" },
  { id: 3, src: Image03, alt: "Frame 3" },
  { id: 4, src: Image04, alt: "Frame 4" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const PersonForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  isNewPerson = false 
}) => {
  const [formData, setFormData] = useState({
    name: "",
    nameZh: "",
    notes: "",
    imageId: 1, // Default to the first image
    gender: "other", // Default to other
  });

  const [errors, setErrors] = useState({});
  const isEditMode = !!initialData?.id;

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        nameZh: initialData.nameZh || "",
        notes: initialData.notes || "",
        imageId: initialData.imageId || 1,
        gender: initialData.gender || "other",
      });
    }
  }, [initialData]);

  /**
   * Handle form input changes
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  /**
   * Validate form data
   * @returns {boolean} Whether the form is valid
   */
  const validateForm = () => {
    const newErrors = {};

    // Name is required
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Name cannot exceed 100 characters";
    }

    // Chinese name validation (optional)
    if (formData.nameZh && formData.nameZh.length > 100) {
      newErrors.nameZh = "Chinese name cannot exceed 100 characters";
    }

    // Notes validation (optional)
    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = "Notes cannot exceed 1000 characters";
    }

    // Gender validation
    if (!formData.gender || !genderOptions.some(opt => opt.value === formData.gender)) {
      newErrors.gender = "Please select a valid gender";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // If editing, include the ID
      const submitData = isEditMode 
        ? { ...formData, id: initialData.id }
        : formData;
        
      onSubmit(submitData);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded-lg shadow"
    >
      <h2 className="text-xl font-semibold mb-4">
        {isNewPerson ? "Add New Person" : `Edit ${initialData?.name || 'Person'}`}
      </h2>

      {/* English Name */}
      <div className="space-y-1">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.name ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Enter name"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      {/* Gender Selection */}
      <div className="space-y-1">
        <label
          htmlFor="gender"
          className="block text-sm font-medium text-gray-700"
        >
          Gender <span className="text-red-500">*</span>
        </label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.gender ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          {genderOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.gender && (
          <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
        )}
      </div>

      {/* Chinese Name */}
      <div className="space-y-1">
        <label
          htmlFor="nameZh"
          className="block text-sm font-medium text-gray-700"
        >
          Chinese Name <span className="text-gray-400">(Optional)</span>
        </label>
        <input
          type="text"
          id="nameZh"
          name="nameZh"
          value={formData.nameZh}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.nameZh ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Enter Chinese name"
        />
        {errors.nameZh && (
          <p className="text-red-500 text-xs mt-1">{errors.nameZh}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Notes <span className="text-gray-400">(Optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          disabled={isLoading}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.notes ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Enter notes about this person"
        />
        {errors.notes && (
          <p className="text-red-500 text-xs mt-1">{errors.notes}</p>
        )}
      </div>

      {/* Image Selection */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Profile Frame
        </label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {imageOptions.map((image) => (
            <div
              key={image.id}
              className={`cursor-pointer rounded-lg p-1 border-2 ${
                formData.imageId === image.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
              onClick={() =>
                setFormData((prev) => ({ ...prev, imageId: image.id }))
              }
            >
              <img
                src={image.src}
                alt={image.alt}
                className="h-16 w-16 object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {isNewPerson ? "Creating..." : "Updating..."}
            </span>
          ) : (
            <span>{isNewPerson ? "Create Person" : "Update Person"}</span>
          )}
        </button>
      </div>
    </form>
  );
};

PersonForm.propTypes = {
  initialData: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    nameZh: PropTypes.string,
    notes: PropTypes.string,
    imageId: PropTypes.number,
    gender: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isNewPerson: PropTypes.bool,
};

export default PersonForm;
