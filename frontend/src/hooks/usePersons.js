import { useState, useEffect, useCallback } from "react";
import { personApi } from "../services/api";

/**
 * Custom hook for managing persons
 * @returns {Object} Person management functions and state
 */
const usePersons = () => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  /**
   * Fetch all persons
   */
  const fetchPersons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await personApi.getAll();
      setPersons(response.data || []);
    } catch (err) {
      setError("Failed to fetch persons");
      console.error("Error in fetchPersons:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a specific person by ID
   * @param {number} id - Person ID
   */
  const fetchPersonById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await personApi.getById(id);
      setSelectedPerson(response.data || null);
      return response.data;
    } catch (err) {
      setError(`Failed to fetch person with ID ${id}`);
      console.error("Error in fetchPersonById:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new person
   * @param {Object} personData - Person data (name, nameZh, notes)
   */
  const createPerson = useCallback(async (personData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await personApi.create(personData);
      setPersons((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError("Failed to create person");
      console.error("Error in createPerson:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing person
   * @param {number} id - Person ID
   * @param {Object} personData - Updated person data
   */
  const updatePerson = useCallback(
    async (id, personData) => {
      try {
        setLoading(true);
        setError(null);
        const response = await personApi.update(id, personData);
        setPersons((prev) =>
          prev.map((person) => (person.id === id ? response.data : person))
        );
        if (selectedPerson?.id === id) {
          setSelectedPerson(response.data);
        }
        return response.data;
      } catch (err) {
        setError(`Failed to update person with ID ${id}`);
        console.error("Error in updatePerson:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedPerson]
  );

  /**
   * Delete a person
   * @param {number} id - Person ID
   */
  const deletePerson = useCallback(
    async (id) => {
      try {
        setLoading(true);
        setError(null);
        await personApi.delete(id);
        setPersons((prev) => prev.filter((person) => person.id !== id));
        if (selectedPerson?.id === id) {
          setSelectedPerson(null);
        }
        return true;
      } catch (err) {
        setError(`Failed to delete person with ID ${id}`);
        console.error("Error in deletePerson:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedPerson]
  );

  /**
   * Search persons by name
   * @param {string} query - Search query
   */
  const searchPersons = useCallback(async (query) => {
    if (!query || query.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
      return [];
    }

    try {
      setIsSearching(true);
      setError(null);
      const response = await personApi.search(query);
      setSearchResults(response.data || []);
      return response.data;
    } catch (err) {
      setError("Failed to search persons");
      console.error("Error in searchPersons:", err);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  /**
   * Reset search results
   */
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  /**
   * Select a person
   * @param {Object|null} person - Person to select or null to clear selection
   */
  const selectPerson = useCallback((person) => {
    setSelectedPerson(person);
  }, []);

  /**
   * Update a person's position in the family tree
   * @param {number} id - Person ID
   * @param {Object} position - Position data {positionX, positionY}
   */
  const updatePersonPosition = useCallback(async (id, position) => {
    try {
      setError(null);
      const response = await personApi.updatePosition(id, position);
      setPersons((prev) =>
        prev.map((person) =>
          person.id === id ? { ...person, ...position } : person
        )
      );
      return response.data;
    } catch (err) {
      console.error("Error in updatePersonPosition:", err);
      // Don't set error state to avoid UI disruption during drag operations
      return null;
    }
  }, []);

  // Fetch persons on initial load
  useEffect(() => {
    fetchPersons();
  }, [fetchPersons]);

  return {
    persons,
    loading,
    error,
    selectedPerson,
    searchResults,
    isSearching,
    fetchPersons,
    fetchPersonById,
    createPerson,
    updatePerson,
    deletePerson,
    searchPersons,
    clearSearch,
    selectPerson,
    updatePersonPosition,
  };
};

export { usePersons };
