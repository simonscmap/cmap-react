import { create } from 'zustand';

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
    console.log(
      '🐛🐛🐛 multiDatasetDownloadStore.js:89 overrideFilters:',
      overrideFilters,
    );
    const { selectedDatasets, filters: storeFilters } = get();
    const filters = overrideFilters || storeFilters;

    try {
      set({ isDownloading: true });

      const bulkDownloadAPI = (await import('../../../api/bulkDownload'))
        .default;
      console.log('🐛🐛🐛 multiDatasetDownloadStore.js:60 filters:', filters);

      await bulkDownloadAPI.post(
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
    const { selectedDatasets, datasets } = get();
    return datasets.filter((dataset) =>
      selectedDatasets.has(dataset.Dataset_Name),
    );
  },
}));

export default useMultiDatasetDownloadStore;
