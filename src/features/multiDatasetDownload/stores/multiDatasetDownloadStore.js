import { create } from 'zustand';
const transformFiltersForAPI = (filters) => {
  const apiFilters = {};

  // Transform temporal filters - use startDate/endDate for API compatibility
  if (filters.temporal) {
    apiFilters.temporal = {
      startDate: filters.temporal.startDate,
      endDate: filters.temporal.endDate,
    };
  }

  // Transform spatial filters - lat/lon already in API format
  if (filters.spatial) {
    apiFilters.spatial = {
      latStart: filters.spatial.latStart,
      latEnd: filters.spatial.latEnd,
      lonStart: filters.spatial.lonStart,
      lonEnd: filters.spatial.lonEnd,
    };
  }

  // Transform depth filters - already in API format
  if (filters.depth) {
    apiFilters.depth = {
      depthStart: filters.depth.depthStart,
      depthEnd: filters.depth.depthEnd,
    };
  }

  return apiFilters;
};
const useMultiDatasetDownloadStore = create((set, get) => ({
  // State
  selectedDatasets: new Set(),
  datasets: [],
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
    const { datasets } = get();
    const allDatasetNames = new Set(
      datasets.map((dataset) => dataset.Dataset_Name),
    );
    set({ selectedDatasets: allDatasetNames });
  },

  clearSelections: () => {
    set({ selectedDatasets: new Set() });
  },

  setDatasets: (datasets) => {
    set({ datasets });
  },

  initializeDatasets: (datasets) => {
    if (datasets && datasets.length > 0) {
      set({ datasets });
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
      console.log('🐛🐛🐛 multiDatasetDownloadStore.js:60 filters:', filters);
      console.log(
        '🐛🐛🐛 multiDatasetDownloadStore.js:61 selectedDatasets:',
        selectedDatasets,
      );
      console.log(
        '🐛🐛🐛 multiDatasetDownloadStore.js:100 transformFiltersForAPI(filters):',
        transformFiltersForAPI(filters),
      );
      // await bulkDownloadAPI.post(Array.from(selectedDatasets), filters);
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
    const { selectedDatasets, datasets } = get();
    return datasets.filter((dataset) =>
      selectedDatasets.has(dataset.Dataset_Name),
    );
  },
}));

export default useMultiDatasetDownloadStore;
