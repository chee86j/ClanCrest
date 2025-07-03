import { useState, useEffect, useCallback } from 'react';
import { personApi } from '../services/api';

/**
 * Custom hook for managing persons data
 * @returns {Object} Persons data and operations
 */
export const usePersons = () => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all persons
   */
  const fetchPersons = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await personApi.getAll();
      setPersons(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch persons');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new person
   * @param {Object} personData - Person data to create
   */
  const createPerson = useCallback(async (personData) => {
    setLoading(true);
    setError(null);

    try {
      const newPerson = await personApi.create(personData);
      setPersons((prevPersons) => [...prevPersons, newPerson]);
      return newPerson;
    } catch (err) {
      setError(err.message || 'Failed to create person');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch persons on mount
  useEffect(() => {
    fetchPersons();
  }, [fetchPersons]);

  return {
    persons,
    loading,
    error,
    createPerson,
    refreshPersons: fetchPersons,
  };
}; 