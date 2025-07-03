import { useState, useEffect, useCallback } from 'react';
import { relationshipApi } from '../services/api';

/**
 * Custom hook for managing relationships data
 * @returns {Object} Relationships data and operations
 */
export const useRelationships = () => {
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all relationships
   */
  const fetchRelationships = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await relationshipApi.getAll();
      setRelationships(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch relationships');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new relationship
   * @param {Object} relationshipData - Relationship data to create
   */
  const createRelationship = useCallback(async (relationshipData) => {
    setLoading(true);
    setError(null);

    try {
      const newRelationship = await relationshipApi.create(relationshipData);
      setRelationships((prevRelationships) => [...prevRelationships, newRelationship]);
      return newRelationship;
    } catch (err) {
      setError(err.message || 'Failed to create relationship');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch relationships on mount
  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  return {
    relationships,
    loading,
    error,
    createRelationship,
    refreshRelationships: fetchRelationships,
  };
}; 