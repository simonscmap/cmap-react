import { create } from 'zustand';
import collectionsAPI from '../../api/collectionsApi';

/**
 * Zustand store for Add Datasets modal state management
 *
 * This store manages the entire workflow for adding datasets to a collection
 * from the Add Datasets modal, including:
 * - Modal visibility and tab state
 * - Collection search and selection
 * - Dataset loading from selected collections
 * - Dataset selection with de-duplication
 * - Confirmation dialogs for state transitions
 */

const initialState = {
  // Modal State
  isOpen: false,
  activeTab: 'collections', // 'collections' | 'catalog' | 'spatial'

  // Collection Search & Selection
  searchQuery: '',
  selectedCollectionId: null,
  selectedCollectionSummary: null, // { id, name, totalDatasets, validDatasets, invalidDatasets, isPublic }

  // Dataset Loading State
  isLoadingDatasets: false,
  loadError: null,
  sourceCollectionDatasets: null, // Array<Dataset> | null

  // Dataset Selection State
  selectedDatasetIds: new Set(), // Set<string> of datasetShortName values

  // De-duplication State
  currentCollectionDatasetIds: new Set(), // Set<string> of datasetShortName values already in current collection

  // Confirmation Dialog State
  showSwitchCollectionWarning: false,
  pendingCollectionId: null,
};

/**
 * Add Datasets Store
 *
 * State management for the Add Datasets feature.
 * Actions will be implemented in subsequent tasks (T025-T035).
 */
export const useAddDatasetsStore = create((set, get) => ({
  ...initialState,

  /**
   * openModal - Initialize modal and de-duplication state (T025)
   *
   * Contract: addDatasetsStore.contract.md lines 50-62
   *
   * @param {Array<Dataset>} currentCollectionDatasets - Datasets already in the collection being edited
   *
   * Side Effects:
   * - Sets isOpen: true
   * - Populates currentCollectionDatasetIds Set from dataset short names
   * - Resets all other state to defaults
   */
  openModal: (currentCollectionDatasets = []) => {
    // Extract datasetShortName values into a Set for O(1) de-duplication checks
    const datasetIds = new Set(
      currentCollectionDatasets.map((dataset) => dataset.datasetShortName),
    );

    // Reset to initial state with modal open and de-duplication Set initialized
    set({
      ...initialState,
      isOpen: true,
      currentCollectionDatasetIds: datasetIds,
    });
  },

  /**
   * closeModal - Close modal and reset all state (T026)
   *
   * Contract: addDatasetsStore.contract.md lines 64-73
   *
   * Side Effects:
   * - Sets isOpen: false
   * - Clears all selections, loaded datasets, errors
   * - Resets to initial state
   */
  closeModal: () => {
    // Reset all state to initial values
    set({
      ...initialState,
      isOpen: false,
    });
  },

  /**
   * selectCollection - Select a collection from search results (T027)
   *
   * Contract: addDatasetsStore.contract.md lines 87-109
   *
   * @param {number} collectionId - ID of selected collection
   * @param {CollectionSummary} summary - Pre-computed collection summary for banner
   *
   * Side Effects:
   * - If no selections: Sets selectedCollectionId and selectedCollectionSummary immediately
   * - If selections exist and different collection: Shows switch collection warning
   * - Clears previous sourceCollectionDatasets
   */
  selectCollection: (collectionId, summary) => {
    const state = get();

    // If selecting the same collection, do nothing (idempotent)
    if (state.selectedCollectionId === collectionId) {
      return;
    }

    // If there are active selections, show confirmation dialog
    if (state.selectedDatasetIds.size > 0) {
      // Trigger confirmation dialog via showSwitchWarning
      // This will be implemented in T035, but we reference it here
      set({
        showSwitchCollectionWarning: true,
        pendingCollectionId: collectionId,
      });
      return;
    }

    // No selections, set the collection immediately
    set({
      selectedCollectionId: collectionId,
      selectedCollectionSummary: summary,
      sourceCollectionDatasets: null, // Clear previous datasets per contract
    });
  },

  /**
   * toggleDatasetSelection - Toggle selection state for a single dataset (T028)
   *
   * Contract: addDatasetsStore.contract.md lines 139-150
   *
   * @param {string} datasetShortName - Dataset_Short_Name to toggle
   *
   * Preconditions:
   * - Dataset must be selectable (not invalid, not already in collection)
   *
   * Side Effects:
   * - Adds to selectedDatasetIds Set if not present
   * - Removes from selectedDatasetIds Set if present
   */
  toggleDatasetSelection: (datasetShortName) => {
    const state = get();
    const newSelectedIds = new Set(state.selectedDatasetIds);

    // Toggle: If present, remove; if not present, add
    if (newSelectedIds.has(datasetShortName)) {
      newSelectedIds.delete(datasetShortName);
    } else {
      newSelectedIds.add(datasetShortName);
    }

    set({
      selectedDatasetIds: newSelectedIds,
    });
  },

  /**
   * getSelectableDatasets - Computed getter for selectable datasets (T029)
   *
   * Contract: addDatasetsStore.contract.md lines 216-225
   *
   * @returns {Array<Dataset>} Array of datasets that can be selected
   *
   * Filters out:
   * - Datasets with isInvalid === true
   * - Datasets already in currentCollectionDatasetIds Set
   *
   * Performance: O(n) where n is sourceCollectionDatasets.length
   * Uses Set.has() for O(1) de-duplication checks
   */
  getSelectableDatasets: () => {
    const state = get();
    const { sourceCollectionDatasets, currentCollectionDatasetIds } = state;

    // Return empty array if no source datasets loaded
    if (!sourceCollectionDatasets) {
      return [];
    }

    // Filter out invalid datasets and datasets already in collection
    return sourceCollectionDatasets.filter(
      (dataset) =>
        dataset.isInvalid !== true &&
        !currentCollectionDatasetIds.has(dataset.datasetShortName),
    );
  },

  /**
   * getSelectionState - Computed getter for aggregated selection statistics (T030)
   *
   * Contract: addDatasetsStore.contract.md lines 227-238, data-model.md lines 240-267
   *
   * @returns {SelectionState} Object containing selection counts and button label
   *
   * SelectionState Schema:
   * {
   *   selectedCount: number,         // selectedDatasetIds.size
   *   totalSelectable: number,       // getSelectableDatasets().length
   *   totalUnavailable: number,      // sourceCollectionDatasets.length - totalSelectable
   *   canAdd: boolean,               // selectedCount > 0
   *   buttonLabel: string            // "Add Valid Datasets ({selectedCount})"
   * }
   *
   * Performance: O(n) where n is sourceCollectionDatasets.length
   * Relies on getSelectableDatasets() for filtering logic
   */
  getSelectionState: () => {
    const state = get();
    const { selectedDatasetIds, sourceCollectionDatasets } = state;

    // Compute selectedCount
    const selectedCount = selectedDatasetIds.size;

    // Compute totalSelectable using getSelectableDatasets()
    const selectableDatasets = state.getSelectableDatasets();
    const totalSelectable = selectableDatasets.length;

    // Compute totalUnavailable
    const totalDatasets = sourceCollectionDatasets?.length || 0;
    const totalUnavailable = totalDatasets - totalSelectable;

    // Compute canAdd
    const canAdd = selectedCount > 0;

    // Compute buttonLabel
    const buttonLabel = `Add Valid Datasets (${selectedCount})`;

    return {
      selectedCount,
      totalSelectable,
      totalUnavailable,
      canAdd,
      buttonLabel,
    };
  },

  /**
   * confirmSwitch - Confirm collection switch, discarding current selections (T031)
   *
   * Contract: addDatasetsStore.contract.md lines 191-202
   *
   * Preconditions:
   * - pendingCollectionId should not be null (though gracefully handles if it is)
   *
   * Side Effects:
   * - Clears selectedDatasetIds Set
   * - Sets showSwitchCollectionWarning: false
   * - Clears pendingCollectionId
   *
   * Note: This action only handles the confirmation and state cleanup.
   * The actual loading of the new collection's datasets will happen
   * separately through loadCollectionDatasets() or in a future enhancement.
   */
  confirmSwitch: () => {
    set({
      selectedDatasetIds: new Set(), // Clear all selections
      showSwitchCollectionWarning: false, // Hide confirmation dialog
      pendingCollectionId: null, // Clear pending collection
    });
  },

  /**
   * addSelectedDatasets - Pass selected datasets to Edit Modal and close (T032)
   *
   * Contract: addDatasetsStore.contract.md lines 161-177
   *
   * @param {Function} onAddComplete - Callback function to receive selected dataset objects
   *
   * Preconditions:
   * - selectedDatasetIds.size > 0
   * - sourceCollectionDatasets must not be null
   *
   * Side Effects:
   * - Calls callback with full dataset objects for selected IDs
   * - Closes modal via closeModal()
   *
   * Performance: O(n*m) where n is selectedDatasetIds.size and m is sourceCollectionDatasets.length
   * For typical usage: n < 100, m < 1000, total < 100ms
   */
  addSelectedDatasets: (onAddComplete) => {
    const state = get();
    const { selectedDatasetIds, sourceCollectionDatasets } = state;

    // Validate preconditions
    if (!sourceCollectionDatasets) {
      console.error('addSelectedDatasets: sourceCollectionDatasets is null');
      return;
    }

    if (selectedDatasetIds.size === 0) {
      console.error('addSelectedDatasets: no datasets selected');
      return;
    }

    // Map selected IDs to full dataset objects
    // Filter sourceCollectionDatasets to only include datasets whose shortName is in selectedDatasetIds
    const selectedDatasets = sourceCollectionDatasets.filter((dataset) =>
      selectedDatasetIds.has(dataset.shortName),
    );

    // Call the callback with the selected dataset objects
    if (onAddComplete && typeof onAddComplete === 'function') {
      onAddComplete(selectedDatasets);
    }

    // Close the modal and reset state
    state.closeModal();
  },

  /**
   * loadCollectionDatasets - Fetch detailed dataset information for selected collection (T033)
   *
   * Contract: addDatasetsStore.contract.md lines 111-125
   *
   * Preconditions:
   * - selectedCollectionId must not be null
   *
   * Side Effects:
   * - Sets isLoadingDatasets: true at start
   * - On success: Sets sourceCollectionDatasets, clears loadError, sets isLoadingDatasets: false
   * - On failure: Sets loadError with user-friendly message, sets isLoadingDatasets: false
   *
   * Error Handling:
   * - 404 → "Collection not found"
   * - 401 → "You must be logged in"
   * - 403 → "You don't have access to this collection"
   * - 500 → "Failed to load collection. Please try again."
   * - Network → "Network error. Please check your connection."
   */
  loadCollectionDatasets: async () => {
    const state = get();
    const { selectedCollectionId } = state;

    // Precondition check
    if (!selectedCollectionId) {
      console.error('loadCollectionDatasets: selectedCollectionId is null');
      return;
    }

    // Set loading state immediately (before any async operations)
    set({ isLoadingDatasets: true });

    try {
      // First, get collection metadata to extract dataset short names
      const collectionResponse = await collectionsAPI.getCollectionById(
        selectedCollectionId,
        {
          includeDatasets: true,
        },
      );

      // Check if response is ok
      if (!collectionResponse.ok) {
        // Handle HTTP errors
        let errorMessage;

        switch (collectionResponse.status) {
          case 404:
            errorMessage = 'Collection not found';
            break;
          case 401:
            errorMessage = 'You must be logged in';
            break;
          case 403:
            errorMessage = "You don't have access to this collection";
            break;
          case 500:
            errorMessage = 'Failed to load collection. Please try again.';
            break;
          default:
            errorMessage = 'Failed to load collection. Please try again.';
        }

        set({
          loadError: errorMessage,
          isLoadingDatasets: false,
          sourceCollectionDatasets: null,
        });
        return;
      }

      // Parse collection response
      const collection = await collectionResponse.json();

      // Extract dataset short names, filtering out undefined/null values
      const datasetShortNames = (collection.datasets || [])
        .map((d) => d.datasetShortName)
        .filter((name) => name !== undefined && name !== null && name !== '');

      // If no datasets, set empty array and return
      if (datasetShortNames.length === 0) {
        set({
          sourceCollectionDatasets: [],
          loadError: null,
          isLoadingDatasets: false,
        });
        return;
      }

      // Now fetch preview data with detailed dataset metadata
      const previewResponse = await collectionsAPI.getCollectionPreview(
        datasetShortNames,
        selectedCollectionId,
      );

      if (!previewResponse.ok) {
        set({
          loadError: 'Failed to load dataset details. Please try again.',
          isLoadingDatasets: false,
          sourceCollectionDatasets: null,
        });
        return;
      }

      // Parse preview response to get detailed dataset metadata
      const datasets = await previewResponse.json();

      // Update state with loaded datasets
      set({
        sourceCollectionDatasets: datasets,
        loadError: null,
        isLoadingDatasets: false,
      });
    } catch (error) {
      // Handle network errors or other exceptions
      let errorMessage = 'Network error. Please check your connection.';

      // Log error for debugging
      console.error('loadCollectionDatasets error:', error);

      set({
        loadError: errorMessage,
        isLoadingDatasets: false,
        sourceCollectionDatasets: null,
      });
    }
  },

  /**
   * setActiveTab - Switch between Add Datasets methods (T035)
   *
   * Contract: addDatasetsStore.contract.md lines 75-86
   *
   * @param {string} tab - Target tab identifier ('collections' | 'catalog' | 'spatial')
   *
   * Side Effects:
   * - Sets activeTab
   * - Clears datasets and selections when switching away from 'collections'
   *
   * Phase One Note: Only 'collections' tab is functional. Other tabs show placeholders.
   */
  setActiveTab: (tab) => {
    // When switching away from 'collections' tab, clear datasets and selections
    if (tab !== 'collections') {
      set({
        activeTab: tab,
        sourceCollectionDatasets: null,
        selectedDatasetIds: new Set(),
      });
    } else {
      set({
        activeTab: tab,
      });
    }
  },

  /**
   * showSwitchWarning - Display confirmation dialog when switching collections with active selections (T035)
   *
   * Contract: addDatasetsStore.contract.md lines 179-189
   *
   * @param {number} newCollectionId - ID of collection user wants to switch to
   *
   * Side Effects:
   * - Sets showSwitchCollectionWarning: true
   * - Sets pendingCollectionId
   *
   * Note: This is called from selectCollection() when selections exist
   */
  showSwitchWarning: (newCollectionId) => {
    set({
      showSwitchCollectionWarning: true,
      pendingCollectionId: newCollectionId,
    });
  },

  /**
   * cancelSwitch - Cancel collection switch, preserving current selections (T035)
   *
   * Contract: addDatasetsStore.contract.md lines 204-212
   *
   * Side Effects:
   * - Clears pendingCollectionId
   * - Hides warning dialog (sets showSwitchCollectionWarning: false)
   *
   * Note: Selections and current collection remain unchanged
   */
  cancelSwitch: () => {
    set({
      showSwitchCollectionWarning: false,
      pendingCollectionId: null,
    });
  },

  /**
   * retryLoad - Retry loading datasets after a failure (T035)
   *
   * Contract: addDatasetsStore.contract.md lines 127-137
   *
   * Preconditions:
   * - loadError should not be null (implies previous failure)
   * - selectedCollectionId should not be null
   *
   * Side Effects:
   * - Same as loadCollectionDatasets()
   * - Clears loadError at start to indicate retry attempt
   */
  retryLoad: async () => {
    const state = get();

    // Clear error before retrying
    set({ loadError: null });

    // Call loadCollectionDatasets to retry
    await state.loadCollectionDatasets();
  },

  /**
   * clearSelections - Deselect all datasets (T035)
   *
   * Contract: addDatasetsStore.contract.md lines 152-159
   *
   * Side Effects:
   * - Clears selectedDatasetIds Set
   */
  clearSelections: () => {
    set({
      selectedDatasetIds: new Set(),
    });
  },
}));
