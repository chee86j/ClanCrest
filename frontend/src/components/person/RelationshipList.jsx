import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { usePersons } from '../../hooks/usePersons';
import { useRelationships } from '../../hooks/useRelationships';

const RELATIONSHIP_LABELS = {
  parent: 'is parent of',
  child: 'is child of',
  spouse: 'is spouse of',
  sibling: 'is sibling of',
};

/**
 * RelationshipList component for displaying relationships
 */
const RelationshipList = ({ personId = null }) => {
  const { persons } = usePersons();
  const { relationships, loading, error, deleteRelationship } = useRelationships();
  const [filteredRelationships, setFilteredRelationships] = useState([]);

  useEffect(() => {
    // Filter relationships for a specific person if personId is provided
    if (personId) {
      setFilteredRelationships(
        relationships.filter(
          rel => rel.fromId === personId || rel.toId === personId
        )
      );
    } else {
      setFilteredRelationships(relationships);
    }
  }, [relationships, personId]);

  const getPersonName = (id) => {
    const person = persons.find(p => p.id === id);
    return person ? `${person.name}${person.nameZh ? ` (${person.nameZh})` : ''}` : 'Unknown';
  };

  const handleDelete = async (relationshipId) => {
    if (window.confirm('Are you sure you want to delete this relationship?')) {
      try {
        await deleteRelationship(relationshipId);
      } catch (err) {
        console.error('Failed to delete relationship:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        Error loading relationships: {error}
      </div>
    );
  }

  if (filteredRelationships.length === 0) {
    return (
      <div className="text-gray-500 p-4 text-center">
        No relationships found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredRelationships.map(relationship => (
        <div
          key={relationship.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
        >
          <div className="flex-1">
            <p className="text-sm text-gray-900">
              <span className="font-medium">{getPersonName(relationship.fromId)}</span>
              {' '}
              <span className="text-gray-500">{RELATIONSHIP_LABELS[relationship.type]}</span>
              {' '}
              <span className="font-medium">{getPersonName(relationship.toId)}</span>
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleDelete(relationship.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

RelationshipList.propTypes = {
  personId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default RelationshipList; 