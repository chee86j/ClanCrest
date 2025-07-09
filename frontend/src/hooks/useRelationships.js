import { useState, useEffect, useCallback } from "react";
import { relationshipApi } from "../services/api";

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
      const relationships = await relationshipApi.getAll();
      console.log("API returned relationships:", relationships);
      
      // Process relationships to handle spouse relationships
      let processedRelationships = Array.isArray(relationships) ? relationships : [];
      
      // Filter out duplicate spouse relationships for display purposes
      // We want to show only one edge for each spouse pair
      const spouseMap = new Map();
      processedRelationships = processedRelationships.filter(rel => {
        if (rel.type === 'spouse') {
          // Create a unique key for this spouse pair
          const [smallerId, largerId] = [rel.fromId, rel.toId].sort();
          const key = `spouse-${smallerId}-${largerId}`;
          
          // If we've already seen this pair, skip it
          if (spouseMap.has(key)) {
            return false;
          }
          
          // Otherwise, mark it as seen and keep it
          spouseMap.set(key, rel);
          return true;
        }
        // Keep all non-spouse relationships
        return true;
      });
      
      console.log("Processed relationships:", processedRelationships);
      setRelationships(processedRelationships);
    } catch (err) {
      setError(err.message || "Failed to fetch relationships");
      setRelationships([]); // Set to empty array on error
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
      // Make sure we're adding the actual relationship data
      const newRelationship = response?.data || {};
      
      // Refresh relationships to get any bidirectional relationships created on the backend
      await fetchRelationships();
      
      return newRelationship;
    } catch (err) {
      setError(err.message || "Failed to create relationship");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRelationships]);

  /**
   * Update an existing relationship
   * @param {number} id - Relationship ID
   * @param {Object} relationshipData - Updated relationship data
   */
  const updateRelationship = useCallback(
    async (id, relationshipData) => {
      setLoading(true);
      setError(null);

      try {
        // Validate relationship before updating
        await relationshipApi.validateRelationship({ ...relationshipData, id });

        const response = await relationshipApi.update(id, relationshipData);
        
        // Refresh relationships to get any bidirectional relationships updated on the backend
        await fetchRelationships();
        
        // Make sure we're updating with the actual relationship data
        const updatedRelationship = response?.data || {};
        if (selectedRelationship?.id === id) {
          setSelectedRelationship(updatedRelationship);
        }
        return updatedRelationship;
      } catch (err) {
        setError(err.message || "Failed to update relationship");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedRelationship, fetchRelationships]
  );

  /**
   * Delete a relationship
   * @param {number} id - Relationship ID
   */
  const deleteRelationship = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        await relationshipApi.delete(id);
        
        // Refresh relationships to handle any bidirectional relationships deleted on the backend
        await fetchRelationships();
        
        if (selectedRelationship?.id === id) {
          setSelectedRelationship(null);
        }
        return true;
      } catch (err) {
        setError(err.message || "Failed to delete relationship");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedRelationship, fetchRelationships]
  );

  /**
   * Get relationships for a specific person
   * @param {number} personId - Person ID
   */
  const getPersonRelationships = useCallback(async (personId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await relationshipApi.getByPerson(personId);
      const personRelationships = response?.data || [];
      return Array.isArray(personRelationships) ? personRelationships : [];
    } catch (err) {
      setError(err.message || "Failed to fetch person relationships");
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
