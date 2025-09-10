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

  selectAll: (getRowCountStore, filteredDatasets) => {
    const { selectedDatasets: currentSelections } = get();

    if (!getRowCountStore) {
      const allDatasetNames = new Set(
        filteredDatasets.map((dataset) => dataset.Dataset_Name),
      );
      set({ selectedDatasets: allDatasetNames });
      return { addedCount: allDatasetNames.size };
    }

    const rowCountStore = getRowCountStore();
    const { maxRowThreshold } = rowCountStore.getThresholdConfig();

    const selectedDatasets = new Set(currentSelections);
    const initialCount = selectedDatasets.size;

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

    const addedCount = selectedDatasets.size - initialCount;
    set({ selectedDatasets });
    return { addedCount };
  },

  clearSelections: (filteredDatasets) => {
    const { selectedDatasets } = get();

    if (!filteredDatasets) {
      // Clear all selections if no filter provided
      set({ selectedDatasets: new Set() });
      return;
    }

    // Clear only filtered datasets from selections
    const newSelectedDatasets = new Set(selectedDatasets);
    filteredDatasets.forEach((dataset) => {
      newSelectedDatasets.delete(dataset.Dataset_Name);
    });

    set({ selectedDatasets: newSelectedDatasets });
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
