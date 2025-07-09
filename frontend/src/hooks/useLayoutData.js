import { useCallback } from 'react';
import { personApi } from '../services/api';

/**
 * Hook to manage family tree layout data
 * Provides functions to save and retrieve node positions
 */
export const useLayoutData = () => {
  /**
   * Save node positions to the backend
   * @param {Object} positions - Map of node positions by ID
   * @returns {Promise} - Promise that resolves when positions are saved
   */
  const saveNodePositions = useCallback(async (positions) => {
    try {
      return await personApi.saveLayout(positions);
    } catch (error) {
      console.error('Error saving node positions:', error);
      throw error;
    }
  }, []);

  /**
   * Get saved layout data from the backend
   * @returns {Promise<Object>} - Promise that resolves to layout data
   */
  const getLayoutData = useCallback(async () => {
    try {
      return await personApi.getLayout();
    } catch (error) {
      console.error('Error loading layout data:', error);
      return {};
    }
  }, []);

  return {
    saveNodePositions,
    getLayoutData
  };
}; 