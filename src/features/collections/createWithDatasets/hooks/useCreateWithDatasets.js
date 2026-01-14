import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useCollectionForm } from '../../createModal/hooks/useCollectionForm';
import { useCollectionFormValidation } from '../../createModal/hooks/useCollectionFormValidation';
import useCollectionsStore from '../../state/collectionsStore';
import { snackbarOpen } from '../../../../Redux/actions/ui';

export const useCreateWithDatasets = () => {
  const dispatch = useDispatch();

  // Form state
  const {
    name,
    description,
    isPublic,
    handleNameChange,
    handleDescriptionChange,
    handleVisibilityChange,
    setIsPublic,
    resetForm,
  } = useCollectionForm();

  // Validation
  const verifyCollectionName = useCollectionsStore(
    (state) => state.verifyCollectionName,
  );
  const {
    nameValidationState,
    nameErrorMessage,
    descriptionError,
    isValid,
    resetValidation,
  } = useCollectionFormValidation(name, description, verifyCollectionName);

  // Local state
  const [addedDatasets, setAddedDatasets] = useState([]); // Array of dataset objects
  const [selectedDatasets, setSelectedDatasets] = useState([]); // Array of short names
  const [showAddDatasetsModal, setShowAddDatasetsModal] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers
  const handleAddDatasets = (newDatasets) => {
    // Transform and merge, filtering duplicates by shortName
    const datasetsWithFlags = newDatasets.map((dataset) => ({
      ...dataset,
      datasetShortName: dataset.shortName,
      isNewlyAdded: true,
    }));

    const existingShortNames = new Set(addedDatasets.map((d) => d.shortName));
    const uniqueNewDatasets = datasetsWithFlags.filter(
      (d) => !existingShortNames.has(d.shortName),
    );

    setAddedDatasets([...addedDatasets, ...uniqueNewDatasets]);
    setShowAddDatasetsModal(false);
  };

  const handleRemoveDataset = (shortName) => {
    setAddedDatasets(addedDatasets.filter((d) => d.shortName !== shortName));
    setSelectedDatasets(selectedDatasets.filter((s) => s !== shortName));
  };

  const handleRemoveSelected = () => {
    if (selectedDatasets.length === 0) return;

    const selectedSet = new Set(selectedDatasets);
    setAddedDatasets(
      addedDatasets.filter((d) => !selectedSet.has(d.shortName)),
    );
    setSelectedDatasets([]);
  };

  // Selection logic
  const handleToggleSelection = (shortName) => {
    setSelectedDatasets((prev) =>
      prev.includes(shortName)
        ? prev.filter((s) => s !== shortName)
        : [...prev, shortName],
    );
  };

  const handleSelectAll = () => {
    setSelectedDatasets(addedDatasets.map((d) => d.shortName));
  };

  const handleClearAll = () => {
    setSelectedDatasets([]);
  };

  const areAllSelected =
    selectedDatasets.length === addedDatasets.length &&
    addedDatasets.length > 0;
  const areIndeterminate =
    selectedDatasets.length > 0 &&
    selectedDatasets.length < addedDatasets.length;

  // Submit handler
  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return false;

    setIsSubmitting(true);
    try {
      const requestData = {
        collectionName: name.trim(),
        description: description || undefined,
        isPublic,
        datasets: addedDatasets.map((d) => d.shortName),
      };

      await useCollectionsStore.getState().createCollection(requestData);

      dispatch(
        snackbarOpen('Collection created successfully', {
          position: 'top',
          severity: 'success',
        }),
      );

      resetAllState();
      return true;
    } catch (error) {
      let errorMessage = 'Failed to create collection. Please try again.';

      if (error.message && error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch(
        snackbarOpen(errorMessage, {
          position: 'top',
          severity: 'error',
        }),
      );

      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset all state
  const resetAllState = () => {
    resetForm();
    resetValidation();
    setAddedDatasets([]);
    setSelectedDatasets([]);
    setShowAddDatasetsModal(false);
    setShowUnsavedWarning(false);
  };

  // Validation
  const isNameOverLimit = name.length > 200;
  const isDescriptionOverLimit = description.length > 500;
  const canSubmit =
    isValid && !isSubmitting && !isNameOverLimit && !isDescriptionOverLimit;

  return {
    // Form state
    name,
    description,
    isPublic,
    handleNameChange,
    handleDescriptionChange,
    handleVisibilityChange,
    setIsPublic,
    // Validation
    nameValidationState,
    nameErrorMessage,
    descriptionError,
    isNameOverLimit,
    isDescriptionOverLimit,
    canSubmit,
    // Dataset state
    addedDatasets,
    selectedDatasets,
    showAddDatasetsModal,
    setShowAddDatasetsModal,
    showUnsavedWarning,
    setShowUnsavedWarning,
    isSubmitting,
    // Handlers
    handleAddDatasets,
    handleRemoveDataset,
    handleRemoveSelected,
    handleToggleSelection,
    handleSelectAll,
    handleClearAll,
    areAllSelected,
    areIndeterminate,
    handleSubmit,
    resetAllState,
  };
};
