import { create } from 'zustand';

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

  downloadDatasets: async (overrideFilters) => {
    const { selectedDatasets, filters: storeFilters } = get();
    const filters = overrideFilters || storeFilters;

    try {
      set({ isDownloading: true });

      const bulkDownloadAPI = (await import('../../../api/bulkDownload'))
        .default;
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
    });
  },
}));

export default useMultiDatasetDownloadStore;
