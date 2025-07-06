import { useState } from 'react';
import PropTypes from 'prop-types';
import PersonForm from '../person/PersonForm';
import RelationshipForm from '../person/RelationshipForm';

const NodeEditor = ({ 
  person, 
  onClose, 
  onUpdatePerson, 
  onDeletePerson,
  onAddRelationship,
  onUpdateRelationship,
  onDeleteRelationship,
  relationships = [],
  isLoading = false 
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState(null);

  const handleDeleteConfirm = () => {
    onDeletePerson(person.id);
    onClose();
  };

  const handleRelationshipAction = (relationship, action) => {
    if (action === 'edit') {
      setSelectedRelationship(relationship);
      setActiveTab('relationships');
    } else if (action === 'delete') {
      onDeleteRelationship(relationship.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Edit Family Member
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'details'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'relationships'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('relationships')}
            >
              Relationships
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'details' ? (
            <div className="space-y-4">
              <PersonForm
                initialData={person}
                onSubmit={onUpdatePerson}
                onCancel={onClose}
                isLoading={isLoading}
              />
              
              <div className="border-t pt-4 mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 focus:outline-none"
                >
                  Delete Person
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Existing Relationships */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Current Relationships
                </h3>
                {relationships.length === 0 ? (
                  <p className="text-gray-500">No relationships added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {relationships.map((rel) => (
                      <div
                        key={rel.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <span className="font-medium">
                            {rel.fromId === person.id ? rel.to.name : rel.from.name}
                          </span>
                          <span className="text-gray-500 mx-2">•</span>
                          <span className="text-gray-600">{rel.type}</span>
                          {rel.dnaConfirmed && (
                            <span className="ml-2 text-green-600" title="DNA Confirmed">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRelationshipAction(rel, 'edit')}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRelationshipAction(rel, 'delete')}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Relationship */}
              {selectedRelationship ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Edit Relationship
                    </h3>
                    <button
                      onClick={() => setSelectedRelationship(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel Edit
                    </button>
                  </div>
                  <RelationshipForm
                    initialData={selectedRelationship}
                    onSubmit={(data) => {
                      onUpdateRelationship(selectedRelationship.id, data);
                      setSelectedRelationship(null);
                    }}
                    onCancel={() => setSelectedRelationship(null)}
                    isLoading={isLoading}
                    excludePersonId={person.id}
                  />
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Add New Relationship
                  </h3>
                  <RelationshipForm
                    initialData={{ fromId: person.id }}
                    onSubmit={onAddRelationship}
                    onCancel={() => {}}
                    isLoading={isLoading}
                    excludePersonId={person.id}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Person
            </h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete {person.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

NodeEditor.propTypes = {
  person: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    nameZh: PropTypes.string,
    gender: PropTypes.string,
    notes: PropTypes.string,
    imageId: PropTypes.number,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdatePerson: PropTypes.func.isRequired,
  onDeletePerson: PropTypes.func.isRequired,
  onAddRelationship: PropTypes.func.isRequired,
  onUpdateRelationship: PropTypes.func.isRequired,
  onDeleteRelationship: PropTypes.func.isRequired,
  relationships: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      fromId: PropTypes.number.isRequired,
      toId: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      dnaConfirmed: PropTypes.bool,
      notes: PropTypes.string,
      from: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }).isRequired,
      to: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }).isRequired,
    })
  ),
  isLoading: PropTypes.bool,
};

export default NodeEditor; 