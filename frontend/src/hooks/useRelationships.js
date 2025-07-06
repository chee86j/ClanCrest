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
  const [selectedRelationship, setSelectedRelationship] = useState(null);

  /**
   * Fetch all relationships
   */
  const fetchRelationships = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await relationshipApi.getAll();
      setRelationships(response.data);
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
      // Validate relationship before creating
      await relationshipApi.validateRelationship(relationshipData);
      
      const response = await relationshipApi.create(relationshipData);
      setRelationships(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to create relationship');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing relationship
   * @param {number} id - Relationship ID
   * @param {Object} relationshipData - Updated relationship data
   */
  const updateRelationship = useCallback(async (id, relationshipData) => {
    setLoading(true);
    setError(null);

    try {
      // Validate relationship before updating
      await relationshipApi.validateRelationship({ ...relationshipData, id });
      
      const response = await relationshipApi.update(id, relationshipData);
      setRelationships(prev => 
        prev.map(rel => rel.id === id ? response.data : rel)
      );
      if (selectedRelationship?.id === id) {
        setSelectedRelationship(response.data);
      }
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to update relationship');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedRelationship]);

  /**
   * Delete a relationship
   * @param {number} id - Relationship ID
   */
  const deleteRelationship = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await relationshipApi.delete(id);
      setRelationships(prev => prev.filter(rel => rel.id !== id));
      if (selectedRelationship?.id === id) {
        setSelectedRelationship(null);
      }
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete relationship');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedRelationship]);

  /**
   * Get relationships for a specific person
   * @param {number} personId - Person ID
   */
  const getPersonRelationships = useCallback(async (personId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await relationshipApi.getByPerson(personId);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch person relationships');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Select a relationship
   * @param {Object|null} relationship - Relationship to select or null to clear selection
   */
  const selectRelationship = useCallback((relationship) => {
    setSelectedRelationship(relationship);
  }, []);

  // Fetch relationships on mount
  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  return {
    relationships,
    loading,
    error,
    selectedRelationship,
    createRelationship,
    updateRelationship,
    deleteRelationship,
    getPersonRelationships,
    selectRelationship,
    refreshRelationships: fetchRelationships,
  };
}; 