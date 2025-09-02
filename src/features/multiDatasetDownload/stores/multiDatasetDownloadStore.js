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

  selectAll: () => {
    const { datasetsMetadata } = get();
    const allDatasetNames = new Set(
      datasetsMetadata.map((dataset) => dataset.Dataset_Name),
    );
    set({ selectedDatasets: allDatasetNames });
  },

  clearSelections: () => {
    set({ selectedDatasets: new Set() });
  },

  setDatasetsMetadata: (datasetsMetadata) => {
    set({ datasetsMetadata });
  },

  initializeDatasetsMetadata: (datasetsMetadata) => {
    if (datasetsMetadata && datasetsMetadata.length > 0) {
      set({ datasetsMetadata });
    }
  },

  setFilters: (filters) => {
    set({ filters });
  },

  setIsDownloading: (isDownloading) => {
    set({ isDownloading });
  },

  fetchDatasetsMetadata: async (datasetShortNames) => {
    if (!datasetShortNames || datasetShortNames.length === 0) {
      return;
    }

    try {
      set({ isLoading: true, error: null });

      const { datasetsMetadata } =
        await bulkDownloadAPI.initBulkDownload(datasetShortNames);
      console.log(
        '🐛🐛🐛 multiDatasetDownloadStore.js:71 datasetsMetadata:',
        datasetsMetadata,
      );
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

      await bulkDownloadAPI.downloadData(
        Array.from(selectedDatasets),
        filters.filterValues,
      );
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    } finally {
      set({ isDownloading: false });
    }
  },

  // Computed getters
  getSelectedDatasetCount: () => {
    const { selectedDatasets } = get();
    return selectedDatasets.size;
  },

  isDatasetSelected: (datasetName) => {
    const { selectedDatasets } = get();
    return selectedDatasets.has(datasetName);
  },

  getSelectedDatasets: () => {
    const { selectedDatasets, datasetsMetadata } = get();
    return datasetsMetadata.filter((dataset) =>
      selectedDatasets.has(dataset.Dataset_Name),
    );
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
