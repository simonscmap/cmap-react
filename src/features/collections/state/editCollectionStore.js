import { create } from 'zustand';
import collectionsAPI from '../api/collectionsApi';
import { snackbarOpen } from '../../../Redux/actions/ui';
import useCollectionsStore from './collectionsStore';
import { captureError } from '../../../shared/errorCapture';
import HttpError from '../../../shared/errorCapture/HttpError';

/**
 * Zustand store for managing edit collection feature state.
 * Follows the data model defined in specs/006-edit-collection-bats/data-model.md
 */
const useEditCollectionStore = create((set, get) => ({
  // Loading & Status State
  isLoading: false,
  isSaving: false,
  error: null,

  // Collection Data
  collection: null,
  originalCollection: null,

  // Edit State
  datasetsToRemove: [], // Array of Dataset_Short_Name values
  selectedDatasets: [], // Array of Dataset_Short_Name values

  // Actions

  /**
   * Load collection data from existing store and initialize edit state
   * @param {number} collectionId - Collection ID to load
   * @returns {void}
   */
  loadCollection: (collectionId) => {
    set({ isLoading: true, error: null });

    try {
      // Get collection from existing collectionsStore instead of API
      const collection = useCollectionsStore
        .getState()
        .getCollectionById(collectionId);

      if (!collection) {
        throw new Error('Collection not found or you do not have access');
      }

      // Verify ownership (UX check, backend also enforces)
      if (!collection.isOwner) {
        throw new Error('You do not have permission to edit this collection');
      }

      // Verify collection has datasets array
      if (!collection.datasets) {
        throw new Error(
          'Collection data is incomplete. Please refresh the page.',
        );
      }

      // Initialize state with loaded collection
      set({
        collection,
        originalCollection: JSON.parse(JSON.stringify(collection)), // Deep clone
        datasetsToRemove: [],
        selectedDatasets: [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const expectedMessages = [
        'Collection not found or you do not have access',
        'You do not have permission to edit this collection',
        'Collection data is incomplete. Please refresh the page.',
      ];
      if (!expectedMessages.includes(error.message)) {
        captureError(error, { action: 'loadCollection', id: collectionId });
      }
      set({
        isLoading: false,
        error: error.message,
        collection: null,
        originalCollection: null,
      });
    }
  },

  /**
   * Update collection name in local state
   * @param {string} name - New collection name
   */
  updateName: (name) => {
    const { collection } = get();
    if (!collection) return;

    set({
      collection: {
        ...collection,
        name: name,
      },
    });
  },

  /**
   * Update collection description in local state
   * @param {string} description - New collection description
   */
  updateDescription: (description) => {
    const { collection } = get();
    if (!collection) return;

    set({
      collection: {
        ...collection,
        description: description,
      },
    });
  },

  /**
   * Update collection visibility setting
   * @param {boolean} isPublic - New visibility setting
   */
  updateVisibility: (isPublic) => {
    const { collection } = get();
    if (!collection) return;

    set({
      collection: {
        ...collection,
        isPublic: isPublic,
      },
    });
  },

  /**
   * Mark dataset for deletion (local only, not persisted until save)
   * @param {string} datasetShortName - Dataset_Short_Name to mark for removal
   */
  markDatasetForRemoval: (datasetShortName) => {
    const { datasetsToRemove, selectedDatasets } = get();

    // Add to removal list if not already present
    if (!datasetsToRemove.includes(datasetShortName)) {
      const newDatasetsToRemove = [...datasetsToRemove, datasetShortName];

      // Also deselect if currently selected
      const newSelectedDatasets = selectedDatasets.filter(
        (id) => id !== datasetShortName,
      );

      set({
        datasetsToRemove: newDatasetsToRemove,
        selectedDatasets: newSelectedDatasets,
      });
    }
  },

  /**
   * Unmark dataset for deletion
   * @param {string} datasetShortName - Dataset_Short_Name to unmark
   */
  cancelDatasetRemoval: (datasetShortName) => {
    const { datasetsToRemove } = get();

    // Remove from removal list
    const newDatasetsToRemove = datasetsToRemove.filter(
      (id) => id !== datasetShortName,
    );

    set({
      datasetsToRemove: newDatasetsToRemove,
    });
  },

  /**
   * Immediately remove a newly added dataset from collection
   * Used for datasets with isNewlyAdded flag to provide instant removal UX
   * @param {string} datasetShortName - Dataset_Short_Name to remove
   */
  removeDatasetImmediate: (datasetShortName) => {
    const { collection, selectedDatasets } = get();

    if (!collection?.datasets) return;

    // Remove from collection.datasets array
    const updatedDatasets = collection.datasets.filter(
      (dataset) => dataset.datasetShortName !== datasetShortName,
    );

    // Remove from selection if selected
    const updatedSelection = selectedDatasets.filter(
      (id) => id !== datasetShortName,
    );

    set({
      collection: {
        ...collection,
        datasets: updatedDatasets,
      },
      selectedDatasets: updatedSelection,
    });
  },

  /**
   * Toggle dataset selection (for checkbox state)
   * @param {string} datasetShortName - Dataset_Short_Name to toggle
   */
  toggleDatasetSelection: (datasetShortName) => {
    const { selectedDatasets } = get();

    const newSelectedDatasets = selectedDatasets.includes(datasetShortName)
      ? selectedDatasets.filter((id) => id !== datasetShortName)
      : [...selectedDatasets, datasetShortName];

    set({
      selectedDatasets: newSelectedDatasets,
    });
  },

  /**
   * Select all selectable datasets (excluding marked for removal)
   */
  selectAllDatasets: () => {
    const { collection, datasetsToRemove } = get();
    if (!collection || !collection.datasets) return;

    // Select all datasets that are not marked for removal and are available
    const selectableDatasets = collection.datasets
      .filter(
        (dataset) =>
          !datasetsToRemove.includes(dataset.datasetShortName) &&
          dataset.isInvalid !== true,
      )
      .map((dataset) => dataset.datasetShortName);

    set({
      selectedDatasets: selectableDatasets,
    });
  },

  /**
   * Clear all dataset selections
   */
  clearAllSelections: () => {
    set({
      selectedDatasets: [],
    });
  },

  /**
   * Add datasets to the collection (from Add Datasets modal)
   * @param {Array} newDatasets - Array of dataset objects to add
   */
  addDatasets: (newDatasets) => {
    const { collection } = get();

    if (!collection || !newDatasets || newDatasets.length === 0) {
      return;
    }

    // Merge new datasets into collection.datasets array
    const updatedDatasets = [...collection.datasets, ...newDatasets];

    set({
      collection: {
        ...collection,
        datasets: updatedDatasets,
      },
    });
  },

  /**
   * Persist all changes to backend
   * @param {Function} dispatch - Redux dispatch function for snackbar notifications
   * @returns {Promise<void>}
   */
  saveChanges: async (dispatch) => {
    const { collection, datasetsToRemove } = get();

    if (!collection) {
      console.error('Cannot save: no collection loaded');
      return;
    }

    set({ isSaving: true, error: null });

    // Prepare request payload
    const payload = {
      collectionName: collection.name.trim(),
      description: collection.description ? collection.description.trim() : '',
      isPublic: collection.isPublic,
      datasets: collection.datasets
        .filter(
          (dataset) => !datasetsToRemove.includes(dataset.datasetShortName),
        )
        .map((dataset) => dataset.datasetShortName),
    };

    // Remove isNewlyAdded flags from datasets before saving
    const datasetsWithoutFlags = collection.datasets.map((dataset) => {
      const { isNewlyAdded, ...datasetWithoutFlag } = dataset;
      return datasetWithoutFlag;
    });

    try {
      const response = await collectionsAPI.updateCollection(
        collection.id,
        payload,
      );

      if (response.ok) {
        const result = await response.json();

        if (result.datasets) {
          result.datasets = result.datasets.map((dataset) => {
            const { isNewlyAdded, ...datasetWithoutFlag } = dataset;
            return datasetWithoutFlag;
          });
        }

        set({
          collection: result,
          originalCollection: JSON.parse(JSON.stringify(result)),
          datasetsToRemove: [],
          selectedDatasets: [],
          isSaving: false,
          error: null,
        });

        // Show success notification
        dispatch(
          snackbarOpen('Collection updated successfully', {
            severity: 'success',
            position: 'top',
          }),
        );

        // Update the main collections store with full server response
        useCollectionsStore.getState().updateCollection(collection.id, result);
      } else if (response.status === 400) {
        const errorData = await response.json();
        throw new HttpError(
          errorData.message || errorData.error || 'Validation error',
          response.status,
        );
      } else if (response.status === 403) {
        throw new HttpError(
          'You do not have permission to edit this collection',
          response.status,
        );
      } else if (response.status === 404) {
        throw new HttpError('Collection not found', response.status);
      } else if (response.status === 409) {
        throw new HttpError(
          'A collection with this name already exists',
          response.status,
        );
      } else {
        const error = new HttpError(
          `Failed to update collection: ${response.status} ${response.statusText}`,
          response.status,
        );
        captureError(error, {
          action: 'saveCollection',
          id: collection.id,
          status: response.status,
        });
        throw error;
      }
    } catch (error) {
      if (!(error instanceof HttpError)) {
        captureError(error, { action: 'saveCollection', id: collection.id });
      }

      set({
        isSaving: false,
        error: error.message,
      });

      // Show error notification
      dispatch(
        snackbarOpen(`Failed to update collection: ${error.message}`, {
          severity: 'error',
          position: 'top',
        }),
      );

      // Re-throw to allow component-level error handling if needed
      throw error;
    }
  },

  /**
   * Discard all local changes and revert to original state
   */
  resetChanges: () => {
    const { originalCollection } = get();

    if (!originalCollection) return;

    set({
      collection: JSON.parse(JSON.stringify(originalCollection)), // Deep clone
      datasetsToRemove: [],
      selectedDatasets: [],
      error: null,
    });
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },

  // Computed Getters (called as functions)

  /**
   * Check if there are unsaved changes
   * Implements change detection algorithm from data-model.md
   * @returns {boolean} True if changes exist
   */
  hasUnsavedChanges: () => {
    const { collection, originalCollection, datasetsToRemove } = get();

    if (!collection || !originalCollection) return false;

    // Normalize strings by trimming whitespace
    const currentNormalized = {
      name: collection.name.trim(),
      description: (collection.description || '').trim(),
      isPublic: collection.isPublic,
      datasets: collection.datasets
        .filter(
          (dataset) => !datasetsToRemove.includes(dataset.datasetShortName),
        )
        .map((dataset) => dataset.datasetShortName)
        .sort(),
    };

    const originalNormalized = {
      name: originalCollection.name.trim(),
      description: (originalCollection.description || '').trim(),
      isPublic: originalCollection.isPublic,
      datasets: originalCollection.datasets
        .map((dataset) => dataset.datasetShortName)
        .sort(),
    };

    // Deep equality check via JSON serialization
    return (
      JSON.stringify(currentNormalized) !== JSON.stringify(originalNormalized)
    );
  },

  /**
   * Check if save operation can proceed
   * @returns {boolean} True if can save
   */
  canSave: () => {
    const { isSaving } = get();
    const hasUnsavedChanges = get().hasUnsavedChanges();

    return hasUnsavedChanges && !isSaving;
  },

  /**
   * Get list of datasets excluding those marked for removal
   * @returns {Array} Array of selectable datasets
   */
  selectableDatasets: () => {
    const { collection, datasetsToRemove } = get();

    if (!collection || !collection.datasets) return [];

    return collection.datasets.filter(
      (dataset) => !datasetsToRemove.includes(dataset.datasetShortName),
    );
  },

  /**
   * Check if all selectable datasets are selected
   * @returns {boolean} True if all selected
   */
  allDatasetsSelected: () => {
    const { selectedDatasets } = get();
    const selectableDatasets = get().selectableDatasets();

    // Filter out unavailable datasets from selectableDatasets
    const availableSelectableDatasets = selectableDatasets.filter(
      (dataset) => dataset.isInvalid !== true,
    );

    if (availableSelectableDatasets.length === 0) return false;

    return selectedDatasets.length === availableSelectableDatasets.length;
  },

  /**
   * Check if some (but not all) datasets are selected
   * @returns {boolean} True if indeterminate state
   */
  isIndeterminate: () => {
    const { selectedDatasets } = get();
    const allDatasetsSelected = get().allDatasetsSelected();

    return selectedDatasets.length > 0 && !allDatasetsSelected;
  },

  /**
   * Reset entire store to initial state
   */
  resetStore: () => {
    set({
      isLoading: false,
      isSaving: false,
      error: null,
      collection: null,
      originalCollection: null,
      datasetsToRemove: [],
      selectedDatasets: [],
    });
  },
}));

export default useEditCollectionStore;
