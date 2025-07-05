import { useState } from "react";
import PropTypes from "prop-types";
import PersonCard from "./PersonCard";
import PersonForm from "./PersonForm";

/**
 * PersonList component for displaying and managing multiple persons
 *
 * @param {Object} props - Component props
 * @param {Array} props.persons - Array of person objects to display
 * @param {Object} props.selectedPerson - Currently selected person
 * @param {Function} props.onCreatePerson - Function called when creating a new person
 * @param {Function} props.onUpdatePerson - Function called when updating a person
 * @param {Function} props.onDeletePerson - Function called when deleting a person
 * @param {Function} props.onSelectPerson - Function called when selecting a person
 * @param {boolean} props.isLoading - Whether data is loading
 * @param {string} props.error - Error message if any
 */
const PersonList = ({
  persons,
  selectedPerson,
  onCreatePerson,
  onUpdatePerson,
  onDeletePerson,
  onSelectPerson,
  isLoading,
  error,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * Handle opening the form for creating a new person
   */
  const handleOpenCreateForm = () => {
    setEditingPerson(null);
    setIsFormOpen(true);
  };

  /**
   * Handle opening the form for editing an existing person
   * @param {Object} person - Person to edit
   */
  const handleOpenEditForm = (person) => {
    setEditingPerson(person);
    setIsFormOpen(true);
  };

  /**
   * Handle closing the form
   */
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPerson(null);
  };

  /**
   * Handle form submission (create or update)
   * @param {Object} formData - Form data from PersonForm
   */
  const handleSubmitForm = (formData) => {
    if (editingPerson) {
      onUpdatePerson(editingPerson.id, formData);
    } else {
      onCreatePerson(formData);
    }
    handleCloseForm();
  };

  /**
   * Filter persons based on search term
   * @returns {Array} Filtered persons
   */
  const filteredPersons = persons.filter((person) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      person.name.toLowerCase().includes(searchLower) ||
      (person.nameZh && person.nameZh.toLowerCase().includes(searchLower)) ||
      (person.notes && person.notes.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Family Members</h2>
        <button
          onClick={handleOpenCreateForm}
          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Person
        </button>
      </div>

      {/* Search input */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or notes..."
            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Form modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <PersonForm
              initialData={editingPerson}
              onSubmit={handleSubmitForm}
              onCancel={handleCloseForm}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !isFormOpen && (
        <div className="flex justify-center items-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
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
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredPersons.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            ></path>
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No family members found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "No results match your search"
              : "Get started by adding a family member"}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Person cards grid */}
      {!isLoading && filteredPersons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredPersons.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              onEdit={handleOpenEditForm}
              onDelete={onDeletePerson}
              onSelect={onSelectPerson}
              isSelected={selectedPerson?.id === person.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

PersonList.propTypes = {
  persons: PropTypes.array.isRequired,
  selectedPerson: PropTypes.object,
  onCreatePerson: PropTypes.func.isRequired,
  onUpdatePerson: PropTypes.func.isRequired,
  onDeletePerson: PropTypes.func.isRequired,
  onSelectPerson: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

PersonList.defaultProps = {
  persons: [],
  isLoading: false,
};

export default PersonList;
