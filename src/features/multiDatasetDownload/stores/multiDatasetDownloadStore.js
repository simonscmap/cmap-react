import { create } from 'zustand';
import bulkDownloadAPI from '../api/bulkDownload';

const useMultiDatasetDownloadStore = create((set, get) => ({
  // State
  selectedDatasets: new Set(),
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
  toggleDatasetSelection: (datasetName) => {
    const { selectedDatasets } = get();
    const newSelectedDatasets = new Set(selectedDatasets);

    if (newSelectedDatasets.has(datasetName)) {
      newSelectedDatasets.delete(datasetName);
    } else {
      newSelectedDatasets.add(datasetName);
    }

    set({ selectedDatasets: newSelectedDatasets });
  },

  selectAll: (getRowCountStore) => {
    const { datasetsMetadata, selectedDatasets: currentSelections } = get();

    if (!getRowCountStore) {
      // Fallback to original behavior if row count store not provided
      const allDatasetNames = new Set(
        datasetsMetadata.map((dataset) => dataset.Dataset_Name),
      );
      set({ selectedDatasets: allDatasetNames });
      return;
    }

    const rowCountStore = getRowCountStore();
    const { maxRowThreshold } = rowCountStore.getThresholdConfig();

    // Start with existing selections to preserve them
    const selectedDatasets = new Set(currentSelections);

    // Calculate current total from existing selections
    let currentTotal = 0;
    for (const datasetName of selectedDatasets) {
      const rowCount = rowCountStore.getEffectiveRowCount(datasetName);
      if (rowCount) {
        currentTotal += rowCount;
      }
    }

    // Add datasets sequentially until we exceed the threshold
    for (const dataset of datasetsMetadata) {
      const datasetName = dataset.Dataset_Name;

      // Skip if already selected (preserve existing selections)
      if (selectedDatasets.has(datasetName)) {
        continue;
      }

      const rowCount = rowCountStore.getEffectiveRowCount(datasetName);

      selectedDatasets.add(datasetName);

      if (rowCount) {
        currentTotal += rowCount;

        // Stop adding more datasets after we exceed the threshold
        if (currentTotal > maxRowThreshold) {
          break;
        }
      }
    }

    set({ selectedDatasets });
  },

  clearSelections: () => {
    set({ selectedDatasets: new Set() });
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

  getSelectAllCheckboxState: () => {
    const { selectedDatasets, datasetsMetadata } = get();
    const totalCount = datasetsMetadata.length;
    const selectedCount = selectedDatasets.size;

    if (selectedCount === 0) {
      return { checked: false, indeterminate: false };
    } else if (selectedCount === totalCount) {
      return { checked: true, indeterminate: false };
    } else {
      return { checked: false, indeterminate: true };
    }
  },

  // Reset all state to initial values
  resetStore: () => {
    set({
      selectedDatasets: new Set(),
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
