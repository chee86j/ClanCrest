import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { usePersons } from '../../hooks/usePersons';
import useRelationshipValidation from '../../hooks/useRelationshipValidation';

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
    notes: '',
  });

  // Use the validation hook
  const { errors, suggestions, isValid } = useRelationshipValidation(formData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        fromId: initialData.fromId || '',
        toId: initialData.toId || '',
        type: initialData.type || 'parent',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      // Convert IDs to integers before submission
      const submissionData = {
        ...formData,
        fromId: formData.fromId ? parseInt(formData.fromId) : null,
        toId: formData.toId ? parseInt(formData.toId) : null,
      };
      console.log("Submitting relationship data:", submissionData);
      
      // If this is a spouse relationship, create the bidirectional relationship
      if (formData.type === 'spouse') {
        onSubmit(submissionData);
      } else {
        onSubmit(submissionData);
      }
    }
  };

  // Filter out the excluded person and sort by name
  const availablePersons = persons
    .filter(person => person.id !== excludePersonId)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Get the current person's name
  const currentPerson = excludePersonId ? persons.find(p => p.id === excludePersonId) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {initialData?.id ? 'Edit Relationship' : 'Create New Relationship'}
      </h2>

      {/* First Person Selection - Show as readonly if excludePersonId is provided */}
      <div className="space-y-1">
        <label htmlFor="fromId" className="block text-sm font-medium text-gray-700">
          First Person <span className="text-red-500">*</span>
        </label>
        {excludePersonId ? (
          <div className="w-full px-3 py-2 border rounded-md border-gray-300 bg-gray-50 text-gray-700">
            {currentPerson?.name} {currentPerson?.nameZh ? `(${currentPerson.nameZh})` : ''}
            <input type="hidden" name="fromId" value={excludePersonId} />
          </div>
        ) : (
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
        )}
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
        {suggestions.type && (
          <p className="text-blue-600 text-xs mt-1">{suggestions.type}</p>
        )}
        {formData.type === 'spouse' && (
          <p className="text-green-600 text-xs mt-1">
            Both people will be automatically set as spouses to each other
          </p>
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
        {suggestions.toId && (
          <p className="text-blue-600 text-xs mt-1">{suggestions.toId}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
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
          placeholder="Add any additional notes about this relationship..."
        />
        {errors.notes && (
          <p className="text-red-500 text-xs mt-1">{errors.notes}</p>
        )}
        {suggestions.notes && (
          <p className="text-blue-600 text-xs mt-1">{suggestions.notes}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !isValid}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading || !isValid
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Saving...' : initialData?.id ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

RelationshipForm.propTypes = {
  initialData: PropTypes.shape({
    id: PropTypes.number,
    fromId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    toId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    type: PropTypes.string,
    notes: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  excludePersonId: PropTypes.number,
};

export default RelationshipForm; 