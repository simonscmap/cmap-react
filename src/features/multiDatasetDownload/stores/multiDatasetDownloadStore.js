import { create } from 'zustand';
import bulkDownloadAPI from '../api/bulkDownload';
import useCollectionsStore from '../../collections/state/collectionsStore';

const useMultiDatasetDownloadStore = create((set, get) => ({
  // State
  selectedDatasets: new Set(),
  datasetsMetadata: [],
  filters: {
    temporal: null,
    spatial: null,
    depth: null,
  },
  downloadContext: null, // Optional metadata for tracking (e.g., collectionId)
  isDownloading: false,
  isLoading: false,
  error: null,

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

  selectAll: (filteredDatasets) => {
    const allDatasetNames = new Set(
      filteredDatasets.map((dataset) => dataset.Dataset_Name),
    );
    set({ selectedDatasets: allDatasetNames });
    return {
      totalAvailable: filteredDatasets.length,
      actuallySelected: allDatasetNames.size,
      wasPartialSelection: false,
    };
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
    const { selectedDatasets, filters: storeFilters, downloadContext } = get();
    const filters = overrideFilters || storeFilters;

    try {
      set({ isDownloading: true });

      const collectionId =
        downloadContext && downloadContext.collectionId
          ? downloadContext.collectionId
          : null;

      const result = await bulkDownloadAPI.downloadData(
        Array.from(selectedDatasets),
        filters.filterValues,
        collectionId,
      );

      // safeApi returns errors as values instead of throwing them
      if (result instanceof Error) {
        throw result;
      }

      // Increment download count locally since backend incremented it
      if (collectionId !== undefined && collectionId !== null) {
        useCollectionsStore
          .getState()
          .incrementCollectionStat(collectionId, 'downloads');
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

  getSelectedIds: () => {
    const { selectedDatasets } = get();
    return Array.from(selectedDatasets);
  },

  getSelectionCount: () => {
    const { selectedDatasets } = get();
    return selectedDatasets.size;
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

  // Set download context for tracking metadata
  setDownloadContext: (context) => {
    set({ downloadContext: context });
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
      downloadContext: null,
      isDownloading: false,
      isLoading: false,
      error: null,
    });
  },
}));

export default useMultiDatasetDownloadStore;
