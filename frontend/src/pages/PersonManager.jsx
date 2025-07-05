import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import usePersons from "../hooks/usePersons";
import { useAuth } from "../context/AuthContext";
import PersonList from "../components/person/PersonList";

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Family Tree Members
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your family members and build your family tree
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Person List */}
        <PersonList
          persons={persons}
          selectedPerson={selectedPerson}
          onCreatePerson={createPerson}
          onUpdatePerson={updatePerson}
          onDeletePerson={deletePerson}
          onSelectPerson={selectPerson}
          isLoading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default PersonManager;
