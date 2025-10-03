import { useState, useEffect, useRef } from 'react';
import { debounce } from 'throttle-debounce';

/**
 * useCollectionFormValidation
 *
 * Manages validation logic for collection form fields.
 * Handles name uniqueness verification (debounced), length checks,
 * and description validation.
 *
 * @param {string} name - Current name value
 * @param {string} description - Current description value
 * @param {Function} verifyCollectionName - API function to verify name availability
 * @param {number} [debounceMs=900] - Debounce delay in milliseconds for name verification
 * @returns {Object} Validation state and utilities
 */
export const useCollectionFormValidation = (
  name,
  description,
  verifyCollectionName,
  debounceMs = 900,
) => {
  // Name validation state
  const [nameValidationState, setNameValidationState] = useState('initial'); // 'initial' | 'checking' | 'available' | 'unavailable' | 'warning'
  const [nameErrorMessage, setNameErrorMessage] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const debouncedVerifyRef = useRef(null);

  useEffect(() => {
    debouncedVerifyRef.current = debounce(debounceMs, async (nameToVerify) => {
      try {
        const isAvailable = await verifyCollectionName(nameToVerify);
        if (isAvailable) {
          setNameValidationState('available');
          setNameErrorMessage('');
        } else {
          setNameValidationState('unavailable');
          setNameErrorMessage('A collection with this name already exists');
        }
      } catch (error) {
        console.error('Error verifying collection name:', error);
        setNameValidationState('unavailable');
        setNameErrorMessage('Failed to verify collection name');
      }
    });

    return () => {
      if (debouncedVerifyRef.current) {
        debouncedVerifyRef.current.cancel();
      }
    };
  }, [debounceMs, verifyCollectionName]);

  useEffect(() => {
    if (!name) {
      setNameValidationState('initial');
      setNameErrorMessage('');
      return;
    }

    if (name.length < 5) {
      setNameValidationState('warning');
      setNameErrorMessage('Collection name must be at least 5 characters');
      return;
    }

    if (name.length > 200) {
      setNameValidationState('unavailable');
      setNameErrorMessage('Collection name cannot exceed 200 characters');
      return;
    }

    setNameValidationState('checking');
    setNameErrorMessage('');
    if (debouncedVerifyRef.current) {
      debouncedVerifyRef.current(name);
    }
  }, [name]);

  useEffect(() => {
    if (description.length > 500) {
      setDescriptionError('Description cannot exceed 500 characters');
    } else {
      setDescriptionError('');
    }
  }, [description]);

  const resetValidation = () => {
    setNameValidationState('initial');
    setNameErrorMessage('');
    setDescriptionError('');
  };

  const isValid =
    nameValidationState === 'available' && description.length <= 500;

  return {
    nameValidationState,
    nameErrorMessage,
    descriptionError,
    isValid,
    resetValidation,
  };
};
