import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import useEditCollectionStore from '../../state/editCollectionStore';
import useCollectionsStore from '../../state/collectionsStore';
import { useCollectionFormValidation } from '../../createModal/hooks/useCollectionFormValidation';
import * as Sentry from '@sentry/react';

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
  const originalName = useEditCollectionStore(
    (state) => state.originalCollection?.name,
  );

  const storeVerifyName = useCollectionsStore(
    (state) => state.verifyCollectionName,
  );
  const verifyCollectionName = useCallback(
    (name) => storeVerifyName(name, collectionId),
    [storeVerifyName, collectionId],
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
    900,
    collectionId,
    originalName,
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

  const isNameOverLimit = collection ? collection.name.length > 200 : false;
  const isDescriptionOverLimit = collection
    ? (collection.description || '').length > 500
    : false;

  const canSaveWithValidation =
    canSave && !isNameOverLimit && !isDescriptionOverLimit && isFormValid;

  const handleSave = useCallback(async () => {
    if (!canSaveWithValidation) {
      return false;
    }

    try {
      await saveChanges(dispatch);
      return true;
    } catch (error) {
      Sentry.captureException(error);
      return false;
    }
  }, [canSaveWithValidation, saveChanges, dispatch]);

  const handleCancel = useCallback(() => {
  }, []);

  return {
    // State
    isLoading,
    isSaving,
    error,
    collection,
    hasUnsavedChanges,
    canSave: canSaveWithValidation,

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
