import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { usePersons } from '../../hooks/usePersons';

const RELATIONSHIP_TYPES = [
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'sibling', label: 'Sibling' },
];

/**
 * RelationshipForm component for creating and editing relationships
 */
const RelationshipForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  excludePersonId = null 
}) => {
  const { persons } = usePersons();
  const [formData, setFormData] = useState({
    fromId: '',
    toId: '',
    type: 'parent',
    dnaConfirmed: false,
    notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        fromId: initialData.fromId || '',
        toId: initialData.toId || '',
        type: initialData.type || 'parent',
        dnaConfirmed: initialData.dnaConfirmed || false,
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fromId) {
      newErrors.fromId = 'Please select the first person';
    }

    if (!formData.toId) {
      newErrors.toId = 'Please select the second person';
    }

    if (formData.fromId === formData.toId) {
      newErrors.toId = 'Cannot create a relationship with the same person';
    }

    if (!formData.type) {
      newErrors.type = 'Please select a relationship type';
    }

    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = 'Notes cannot exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Filter out the excluded person and sort by name
  const availablePersons = persons
    .filter(person => person.id !== excludePersonId)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {initialData ? 'Edit Relationship' : 'Create New Relationship'}
      </h2>

      {/* First Person Selection */}
      <div className="space-y-1">
        <label htmlFor="fromId" className="block text-sm font-medium text-gray-700">
          First Person <span className="text-red-500">*</span>
        </label>
        <select
          id="fromId"
          name="fromId"
          value={formData.fromId}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.fromId ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="">Select a person</option>
          {availablePersons.map(person => (
            <option key={person.id} value={person.id}>
              {person.name} {person.nameZh ? `(${person.nameZh})` : ''}
            </option>
          ))}
        </select>
        {errors.fromId && (
          <p className="text-red-500 text-xs mt-1">{errors.fromId}</p>
        )}
      </div>

      {/* Relationship Type Selection */}
      <div className="space-y-1">
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Relationship Type <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.type ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          {RELATIONSHIP_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.type && (
          <p className="text-red-500 text-xs mt-1">{errors.type}</p>
        )}
      </div>

      {/* Second Person Selection */}
      <div className="space-y-1">
        <label htmlFor="toId" className="block text-sm font-medium text-gray-700">
          Second Person <span className="text-red-500">*</span>
        </label>
        <select
          id="toId"
          name="toId"
          value={formData.toId}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.toId ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="">Select a person</option>
          {availablePersons.map(person => (
            <option key={person.id} value={person.id}>
              {person.name} {person.nameZh ? `(${person.nameZh})` : ''}
            </option>
          ))}
        </select>
        {errors.toId && (
          <p className="text-red-500 text-xs mt-1">{errors.toId}</p>
        )}
      </div>

      {/* DNA Confirmation */}
      <div className="space-y-1">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="dnaConfirmed"
            name="dnaConfirmed"
            checked={formData.dnaConfirmed}
            onChange={handleChange}
            disabled={isLoading}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="dnaConfirmed" className="ml-2 block text-sm text-gray-700">
            DNA Confirmed
          </label>
        </div>
        <p className="text-xs text-gray-500">
          Check this if the relationship is confirmed by DNA testing
        </p>
      </div>

      {/* Relationship Notes */}
      <div className="space-y-1">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
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
            errors.notes ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Add any notes about this relationship"
        />
        {errors.notes && (
          <p className="text-red-500 text-xs mt-1">{errors.notes}</p>
        )}
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            'Save Relationship'
          )}
        </button>
      </div>
    </form>
  );
};

RelationshipForm.propTypes = {
  initialData: PropTypes.shape({
    fromId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    toId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string,
    dnaConfirmed: PropTypes.bool,
    notes: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  excludePersonId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default RelationshipForm; 