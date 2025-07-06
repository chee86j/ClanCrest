import { useState } from 'react';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePersons } from "../hooks/usePersons";
import { useAuth } from "../context/AuthContext";
import PersonList from "../components/person/PersonList";
import PersonForm from '../components/person/PersonForm';
import RelationshipForm from '../components/person/RelationshipForm';
import RelationshipList from '../components/person/RelationshipList';
import { useRelationships } from '../hooks/useRelationships';

/**
 * PersonManager page component
 * Integrates all person-related components
 */
const PersonManager = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    persons,
    loading,
    error,
    selectedPerson,
    createPerson,
    updatePerson,
    deletePerson,
    selectPerson,
    fetchPersons,
  } = usePersons();
  const { createRelationship, loading: relationshipLoading } = useRelationships();
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showRelationshipForm, setShowRelationshipForm] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  // Refresh persons when component mounts
  useEffect(() => {
    fetchPersons();
  }, [fetchPersons]);

  const handlePersonSubmit = async (personData) => {
    try {
      if (selectedPerson) {
        await updatePerson(selectedPerson.id, personData);
      } else {
        await createPerson(personData);
      }
      setShowPersonForm(false);
      setSelectedPerson(null);
    } catch (error) {
      console.error('Failed to save person:', error);
    }
  };

  const handleRelationshipSubmit = async (relationshipData) => {
    try {
      await createRelationship(relationshipData);
      setShowRelationshipForm(false);
    } catch (error) {
      console.error('Failed to create relationship:', error);
    }
  };

  const handleEditPerson = (person) => {
    setSelectedPerson(person);
    setShowPersonForm(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Family Members</h1>
        <div className="space-x-4">
          <button
            onClick={() => {
              setSelectedPerson(null);
              setShowPersonForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Person
          </button>
          <button
            onClick={() => setShowRelationshipForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Add Relationship
          </button>
        </div>
      </div>

      {/* Person Form Modal */}
      {showPersonForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <PersonForm
              initialData={selectedPerson}
              onSubmit={handlePersonSubmit}
              onCancel={() => {
                setShowPersonForm(false);
                setSelectedPerson(null);
              }}
              isLoading={loading}
            />
          </div>
        </div>
      )}

      {/* Relationship Form Modal */}
      {showRelationshipForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <RelationshipForm
              onSubmit={handleRelationshipSubmit}
              onCancel={() => setShowRelationshipForm(false)}
              isLoading={relationshipLoading}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Person List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">People</h2>
          <PersonList
            persons={persons}
            selectedPerson={selectedPerson}
            onCreatePerson={createPerson}
            onUpdatePerson={updatePerson}
            onDeletePerson={deletePerson}
            onSelectPerson={selectPerson}
            isLoading={loading}
            error={error}
            onEdit={handleEditPerson}
          />
        </div>

        {/* Relationships List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Relationships</h2>
          <RelationshipList />
        </div>
      </div>
    </div>
  );
};

export default PersonManager;
