import { useState, useEffect } from 'react';
import { useRelationships } from './useRelationships';

/**
 * Custom hook for validating relationships
 * @param {Object} formData - The relationship form data
 * @param {Array} existingRelationships - List of existing relationships
 * @returns {Object} Validation state and helper functions
 */
const useRelationshipValidation = (formData) => {
  const { relationships: relationshipsData } = useRelationships();
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState({});
  const [isValid, setIsValid] = useState(false);
  
  // Ensure relationships is always an array
  const relationships = Array.isArray(relationshipsData) ? relationshipsData : [];

  /**
   * Validates basic form data requirements
   * @returns {Object} Validation errors
   */
  const validateBasicRequirements = () => {
    const newErrors = {};

    if (!formData.fromId) {
      newErrors.fromId = 'Please select the first person';
    }

    if (!formData.toId) {
      newErrors.toId = 'Please select the second person';
    }

    if (formData.fromId === formData.toId) {
      newErrors.toId = 'Cannot create a relationship with the same person';
      setSuggestions({
        toId: 'Please select a different person',
      });
    }

    if (!formData.type) {
      newErrors.type = 'Please select a relationship type';
    }

    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = 'Notes cannot exceed 1000 characters';
      setSuggestions({
        notes: `Current length: ${formData.notes.length}. Please shorten the text.`,
      });
    }

    return newErrors;
  };

  /**
   * Validates relationship consistency
   * @returns {Object} Validation errors
   */
  const validateRelationshipConsistency = () => {
    const newErrors = {};
    const newSuggestions = {};

    if (!formData.fromId || !formData.toId || !formData.type) {
      return {};
    }

    // Check for existing relationship - except for spouse which can be bidirectional
    const hasExistingRelationship = relationships.some(
      (rel) => {
        // Skip checking the current relationship being edited
        if (formData.id && rel.id === formData.id) return false;
        
        // For spouse relationships, check if there's already a spouse relationship between these two people
        if (formData.type === 'spouse') {
          return (
            (rel.type === 'spouse' && 
             ((rel.fromId === parseInt(formData.fromId) && rel.toId === parseInt(formData.toId)) ||
              (rel.fromId === parseInt(formData.toId) && rel.toId === parseInt(formData.fromId))))
          );
        }
        
        // For other relationships, check if any relationship exists between these two people
        return (
          (rel.fromId === parseInt(formData.fromId) && rel.toId === parseInt(formData.toId)) ||
          (rel.fromId === parseInt(formData.toId) && rel.toId === parseInt(formData.fromId))
        );
      }
    );

    if (hasExistingRelationship && !formData.id) {
      newErrors.type = 'A relationship already exists between these persons';
      newSuggestions.type = 'Please select different persons or edit the existing relationship';
    }

    // Get relationships for both persons
    const fromRelationships = relationships.filter(
      (rel) => rel.fromId === parseInt(formData.fromId) || rel.toId === parseInt(formData.fromId)
    );
    const toRelationships = relationships.filter(
      (rel) => rel.fromId === parseInt(formData.toId) || rel.toId === parseInt(formData.toId)
    );

    switch (formData.type) {
      case 'parent':
        // Check if the child already has this person as a parent
        const hasParent = toRelationships.some(
          (rel) =>
            (rel.type === 'parent' && rel.fromId === parseInt(formData.fromId)) ||
            (rel.type === 'child' && rel.toId === parseInt(formData.fromId))
        );
        if (hasParent) {
          newErrors.type = 'This parent-child relationship already exists';
          newSuggestions.type = 'This person is already a parent of the selected child';
        }
        break;

      case 'child':
        // Check if the parent already has this person as a child
        const hasChild = toRelationships.some(
          (rel) =>
            (rel.type === 'child' && rel.fromId === parseInt(formData.fromId)) ||
            (rel.type === 'parent' && rel.toId === parseInt(formData.fromId))
        );
        if (hasChild) {
          newErrors.type = 'This parent-child relationship already exists';
          newSuggestions.type = 'This person is already a child of the selected parent';
        }
        break;

      case 'spouse':
        // Check if either person already has a spouse (excluding each other)
        const hasSpouse = [...fromRelationships, ...toRelationships].some(
          (rel) => {
            // Skip checking the current relationship being edited
            if (formData.id && rel.id === formData.id) return false;
            
            // Check if this is a spouse relationship with someone other than the selected person
            if (rel.type === 'spouse') {
              if (rel.fromId === parseInt(formData.fromId)) {
                return rel.toId !== parseInt(formData.toId);
              }
              if (rel.toId === parseInt(formData.fromId)) {
                return rel.fromId !== parseInt(formData.toId);
              }
              if (rel.fromId === parseInt(formData.toId)) {
                return rel.toId !== parseInt(formData.fromId);
              }
              if (rel.toId === parseInt(formData.toId)) {
                return rel.fromId !== parseInt(formData.fromId);
              }
            }
            return false;
          }
        );
        
        if (hasSpouse) {
          newErrors.type = 'One of the persons already has a spouse';
          newSuggestions.type = 'Please select different persons or update existing spouse relationship';
        }
        break;

      case 'sibling':
        // Get parents for both persons
        const getParents = (personId) =>
          relationships
            .filter(
              (rel) =>
                (rel.type === 'parent' && rel.toId === personId) ||
                (rel.type === 'child' && rel.fromId === personId)
            )
            .map((rel) => (rel.type === 'parent' ? rel.fromId : rel.toId));

        const fromParents = getParents(parseInt(formData.fromId));
        const toParents = getParents(parseInt(formData.toId));
        const shareParent = fromParents.some((p1) =>
          toParents.some((p2) => p1 === p2)
        );

        if (!shareParent && (fromParents.length > 0 || toParents.length > 0)) {
          newErrors.type = 'Siblings should share at least one parent';
          newSuggestions.type = 'Consider adding parent relationships first';
        }
        break;
    }

    return { errors: newErrors, suggestions: newSuggestions };
  };

  /**
   * Validates the entire form
   */
  const validateForm = () => {
    const basicErrors = validateBasicRequirements();
    const { errors: consistencyErrors, suggestions: consistencySuggestions } = validateRelationshipConsistency();

    const allErrors = { ...basicErrors, ...consistencyErrors };
    setErrors(allErrors);
    setSuggestions(consistencySuggestions || {});
    setIsValid(Object.keys(allErrors).length === 0);
  };

  // Run validation whenever form data changes
  useEffect(() => {
    validateForm();
  }, [formData, relationships]);

  return {
    errors,
    suggestions,
    isValid,
    validateForm,
  };
};

export default useRelationshipValidation; 