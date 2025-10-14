import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import useEditCollectionStore from '../../state/editCollectionStore';
import collectionsAPI from '../../api/collectionsApi';
import { useCollectionFormValidation } from '../../createModal/hooks/useCollectionFormValidation';

/**
 * useEditCollection
 *
 * Main hook for Edit Collection modal integration.
 * Orchestrates store state, validation, and component handlers.
 *
 * @param {number} collectionId - Collection ID to edit
 * @returns {Object} Edit collection state and handlers
 */
export const useEditCollection = (collectionId) => {
  const dispatch = useDispatch();

  // Store state selectors
  const isLoading = useEditCollectionStore((state) => state.isLoading);
  const isSaving = useEditCollectionStore((state) => state.isSaving);
  const error = useEditCollectionStore((state) => state.error);
  const collection = useEditCollectionStore((state) => state.collection);
  const hasUnsavedChanges = useEditCollectionStore((state) =>
    state.hasUnsavedChanges(),
  );
  const canSave = useEditCollectionStore((state) => state.canSave());

  // Store actions
  const loadCollection = useEditCollectionStore(
    (state) => state.loadCollection,
  );
  const updateName = useEditCollectionStore((state) => state.updateName);
  const updateDescription = useEditCollectionStore(
    (state) => state.updateDescription,
  );
  const updateVisibility = useEditCollectionStore(
    (state) => state.updateVisibility,
  );
  const saveChanges = useEditCollectionStore((state) => state.saveChanges);
  const resetStore = useEditCollectionStore((state) => state.resetStore);

  // Form validation integration
  const verifyCollectionName = useCallback(
    async (name) => {
      const response = await collectionsAPI.verifyCollectionName(
        name,
        collectionId,
      );

      if (!response.ok) {
        throw new Error('Failed to verify collection name');
      }

      const data = await response.json();
      return data.isAvailable;
    },
    [collectionId],
  );

  const {
    nameValidationState,
    nameErrorMessage,
    descriptionError,
    isValid: isFormValid,
  } = useCollectionFormValidation(
    collection?.name || '',
    collection?.description || '',
    verifyCollectionName,
    900, // debounceMs (default value)
    collectionId,
    useEditCollectionStore.getState().originalCollection?.name,
  );

  // Initialize collection on mount
  useEffect(() => {
    if (collectionId) {
      loadCollection(collectionId);
    }

    // Cleanup on unmount
    return () => {
      resetStore();
    };
  }, [collectionId, loadCollection, resetStore]);

  // Handlers
  const handleNameChange = useCallback(
    (name) => {
      updateName(name);
    },
    [updateName],
  );

  const handleDescriptionChange = useCallback(
    (description) => {
      updateDescription(description);
    },
    [updateDescription],
  );

  const handleVisibilityChange = useCallback(
    (isPublic) => {
      updateVisibility(isPublic);
    },
    [updateVisibility],
  );

  const handleSave = useCallback(async () => {
    if (!canSave) {
      return false;
    }

    try {
      await saveChanges(dispatch);
      return true; // Success - modal can close
    } catch (error) {
      // Error already handled in store, logged here for component-level handling if needed
      console.error('Save operation failed:', error);
      return false; // Failure - modal should stay open
    }
  }, [canSave, saveChanges, dispatch]);

  const handleCancel = useCallback(() => {
    // Reset store when canceling
    // Modal closing is handled by the component
  }, []);

  // Computed character limit checks
  const isNameOverLimit = collection ? collection.name.length > 200 : false;
  const isDescriptionOverLimit = collection
    ? (collection.description || '').length > 500
    : false;

  return {
    // State
    isLoading,
    isSaving,
    error,
    collection,
    hasUnsavedChanges,
    canSave,

    // Form validation state
    nameValidationState,
    nameErrorMessage,
    descriptionError,
    isNameOverLimit,
    isDescriptionOverLimit,
    isFormValid,

    // Handlers
    handleNameChange,
    handleDescriptionChange,
    handleVisibilityChange,
    handleSave,
    handleCancel,
  };
};
