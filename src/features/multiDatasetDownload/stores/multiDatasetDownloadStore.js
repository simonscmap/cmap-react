import { create } from 'zustand';
import { debounce } from 'throttle-debounce';
import bulkDownloadAPI from '../api/bulkDownload';

const useMultiDatasetDownloadStore = create((set, get) => ({
  // State
  selectedDatasets: new Set(),
  batchedSelections: new Set(), // Datasets waiting for debounced row count fetch
  debounceTimer: null, // Timer for 150ms debouncing
  datasetsMetadata: [],
  filters: {
    temporal: null,
    spatial: null,
    depth: null,
  },
  isDownloading: false,
  isLoading: false,
  error: null,

  // Actions
  addToBatch: (datasetId) => {
    const { batchedSelections } = get();
    const newBatch = new Set(batchedSelections);
    newBatch.add(datasetId);
    set({ batchedSelections: newBatch });
  },

  processBatch: (getRowCountStore, filters = {}, delay = 150) => {
    const { debounceTimer } = get();

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set up new debounced processing
    const timer = setTimeout(() => {
      const { batchedSelections, selectedDatasets } = get();

      if (batchedSelections.size === 0) {
        return;
      }

      // Commit batched changes to actual selections
      const newSelectedDatasets = new Set(selectedDatasets);
      batchedSelections.forEach((datasetId) => {
        if (newSelectedDatasets.has(datasetId)) {
          newSelectedDatasets.delete(datasetId);
        } else {
          newSelectedDatasets.add(datasetId);
        }
      });

      // Clear the batch
      set({
        selectedDatasets: newSelectedDatasets,
        batchedSelections: new Set(),
        debounceTimer: null,
      });

      // Trigger row count update for newly selected datasets if rowCountStore is available
      if (getRowCountStore) {
        const rowCountStore = getRowCountStore();
        const newlySelected = Array.from(newSelectedDatasets);

        // Only fetch row counts for selected datasets
        if (
          newlySelected.length > 0 &&
          rowCountStore.debouncedFetchForSelected
        ) {
          // Use the passed filters for row count fetching
          rowCountStore.debouncedFetchForSelected(newlySelected, filters);
        }
      }
    }, delay);

    set({ debounceTimer: timer });
  },
  toggleDatasetSelection: (datasetName, getRowCountStore, filters = {}) => {
    // Add to batch instead of immediate update
    get().addToBatch(datasetName);

    // Process batch with debouncing
    get().processBatch(getRowCountStore, filters);
  },

  selectAll: (getRowCountStore, filteredDatasets) => {
    const { selectedDatasets: currentSelections, debounceTimer } = get();

    // Clear any pending batches since we're doing a bulk operation
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      set({ debounceTimer: null, batchedSelections: new Set() });
    }

    const totalAvailable = filteredDatasets.length;

    if (!getRowCountStore) {
      const allDatasetNames = new Set(
        filteredDatasets.map((dataset) => dataset.Dataset_Name),
      );
      set({ selectedDatasets: allDatasetNames });
      return {
        totalAvailable,
        actuallySelected: allDatasetNames.size,
        wasPartialSelection: false,
      };
    }

    const rowCountStore = getRowCountStore();
    const { maxRowThreshold } = rowCountStore.getThresholdConfig();
    const formattedThreshold = (maxRowThreshold / 1000000).toFixed(0);

    const selectedDatasets = new Set(currentSelections);
    let currentTotal = rowCountStore.getTotalSelectedRows(
      Array.from(selectedDatasets),
    );

    for (const dataset of filteredDatasets) {
      const datasetName = dataset.Dataset_Name;

      if (selectedDatasets.has(datasetName)) {
        continue;
      }

      const rowCount = rowCountStore.getEffectiveRowCount(datasetName);

      if (rowCount) {
        const potentialTotal = currentTotal + rowCount;
        if (potentialTotal > maxRowThreshold) {
          continue;
        }
        selectedDatasets.add(datasetName);
        currentTotal = potentialTotal;
      } else {
        selectedDatasets.add(datasetName);
      }
    }

    const actuallySelected = selectedDatasets.size;
    const wasPartialSelection = actuallySelected < totalAvailable;

    set({ selectedDatasets });

    // Trigger row count update for selected datasets
    const newlySelected = Array.from(selectedDatasets);
    if (newlySelected.length > 0 && rowCountStore.debouncedFetchForSelected) {
      rowCountStore.debouncedFetchForSelected(newlySelected, {});
    }

    return {
      totalAvailable,
      actuallySelected,
      wasPartialSelection,
      formattedThreshold,
    };
  },

  clearSelections: (filteredDatasets, getRowCountStore) => {
    const { selectedDatasets, debounceTimer } = get();

    // Cancel any pending batches
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      set({ debounceTimer: null, batchedSelections: new Set() });
    }

    if (!filteredDatasets) {
      // Clear all selections if no filter provided
      set({ selectedDatasets: new Set() });

      // Cancel any pending row count requests for cleared datasets
      if (getRowCountStore) {
        const rowCountStore = getRowCountStore();
        if (rowCountStore.cancelPendingRequests) {
          rowCountStore.cancelPendingRequests();
        }
      }
      return;
    }

    // Clear only filtered datasets from selections
    const newSelectedDatasets = new Set(selectedDatasets);
    filteredDatasets.forEach((dataset) => {
      newSelectedDatasets.delete(dataset.Dataset_Name);
    });

    set({ selectedDatasets: newSelectedDatasets });

    // Update row count store to only track remaining selected datasets
    if (getRowCountStore) {
      const rowCountStore = getRowCountStore();
      const remainingSelected = Array.from(newSelectedDatasets);
      if (
        remainingSelected.length > 0 &&
        rowCountStore.debouncedFetchForSelected
      ) {
        rowCountStore.debouncedFetchForSelected(remainingSelected, {});
      }
    }
  },

  fetchDatasetsMetadata: async (datasetShortNames) => {
    if (!datasetShortNames || datasetShortNames.length === 0) {
      return;
    }

    try {
      set({ isLoading: true, error: null });

      const { datasetsMetadata } =
        await bulkDownloadAPI.initBulkDownload(datasetShortNames);
      set({
        datasetsMetadata,
        isLoading: false,
        selectedDatasets: new Set(), // Reset selections when new data is fetched
      });
    } catch (error) {
      console.error('Failed to fetch datasets metadata:', error);
      set({
        error: error.message || 'Failed to fetch datasets metadata',
        isLoading: false,
        datasetsMetadata: [],
      });
    }
  },

  downloadDatasets: async (overrideFilters) => {
    const { selectedDatasets, filters: storeFilters } = get();
    const filters = overrideFilters || storeFilters;

    try {
      set({ isDownloading: true });

      const result = await bulkDownloadAPI.downloadData(
        Array.from(selectedDatasets),
        filters.filterValues,
      );

      // safeApi returns errors as values instead of throwing them
      if (result instanceof Error) {
        throw result;
      }
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    } finally {
      set({ isDownloading: false });
    }
  },

  // Computed getters
  isDatasetSelected: (datasetName) => {
    const { selectedDatasets } = get();
    return selectedDatasets.has(datasetName);
  },

  // Additional getters for batching system
  getSelectedIds: () => {
    const { selectedDatasets } = get();
    return Array.from(selectedDatasets);
  },

  getSelectionCount: () => {
    const { selectedDatasets } = get();
    return selectedDatasets.size;
  },

  getBatchedSelections: () => {
    const { batchedSelections } = get();
    return Array.from(batchedSelections);
  },

  // Additional selection methods for compatibility with spec
  selectDataset: (datasetId, getRowCountStore, filters = {}) => {
    const { selectedDatasets } = get();
    if (!selectedDatasets.has(datasetId)) {
      get().addToBatch(datasetId);
      get().processBatch(getRowCountStore, filters);
    }
  },

  deselectDataset: (datasetId, getRowCountStore, filters = {}) => {
    const { selectedDatasets } = get();
    if (selectedDatasets.has(datasetId)) {
      get().addToBatch(datasetId);
      get().processBatch(getRowCountStore, filters);
    }
  },

  selectMultiple: (datasetIds, getRowCountStore, filters = {}) => {
    const { selectedDatasets } = get();

    // Add all datasets that aren't already selected to the batch
    datasetIds.forEach((datasetId) => {
      if (!selectedDatasets.has(datasetId)) {
        get().addToBatch(datasetId);
      }
    });

    // Process the batch
    get().processBatch(getRowCountStore, filters);
  },

  getSelectAllCheckboxState: (filteredDatasets) => {
    const { selectedDatasets } = get();
    const totalCount = filteredDatasets.length;
    const selectedInFilteredCount = filteredDatasets.filter((dataset) =>
      selectedDatasets.has(dataset.Dataset_Name),
    ).length;

    if (selectedInFilteredCount === 0) {
      return { checked: false, indeterminate: false };
    } else if (selectedInFilteredCount === totalCount) {
      return { checked: true, indeterminate: false };
    } else {
      return { checked: false, indeterminate: true };
    }
  },

  // Reset all state to initial values
  resetStore: () => {
    const { debounceTimer } = get();

    // Clear any pending timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    set({
      selectedDatasets: new Set(),
      batchedSelections: new Set(),
      debounceTimer: null,
      datasetsMetadata: [],
      filters: {
        temporal: null,
        spatial: null,
        depth: null,
      },
      isDownloading: false,
      isLoading: false,
      error: null,
    });
  },
}));

export default useMultiDatasetDownloadStore;
