import { create } from 'zustand';
import bulkDownloadAPI from '../api/bulkDownload';

// Threshold configuration constants
const THRESHOLD_CONFIG = {
  maxRowThreshold: 2000000,
  warningThreshold: 0.9, // 90% of max threshold
};

const useRowCountStore = create((set, get) => ({
  // State
  datasetNames: [],
  originalRowCounts: {},
  dynamicRowCounts: {},
  rowCountsLoading: {},
  rowCountsError: {},
  debounceTimer: null,

  // Actions
  initializeWithDatasets: (datasets) => {
    const datasetNames = Object.keys(datasets);
    set({
      datasetNames,
      originalRowCounts: { ...datasets },
    });
  },

  updateRowCountsForFilters: (filters) => {
    const state = get();
    const { datasetNames } = state;

    // Clear existing timer
    if (state.debounceTimer) {
      clearTimeout(state.debounceTimer);
    }

    // Set up new debounced API call
    const timer = setTimeout(async () => {
      // Set loading states for all datasets
      const loadingStates = {};
      datasetNames.forEach((name) => {
        loadingStates[name] = true;
      });

      set((state) => ({
        rowCountsLoading: { ...state.rowCountsLoading, ...loadingStates },
        rowCountsError: {
          ...state.rowCountsError,
          ...Object.fromEntries(datasetNames.map((name) => [name, null])),
        },
      }));

      try {
        const rowCounts = await bulkDownloadAPI.getRowCounts(
          datasetNames,
          filters,
        );

        // Update dynamic row counts and clear loading states
        set((state) => ({
          dynamicRowCounts: { ...state.dynamicRowCounts, ...rowCounts },
          rowCountsLoading: {
            ...state.rowCountsLoading,
            ...Object.fromEntries(datasetNames.map((name) => [name, false])),
          },
        }));
      } catch (error) {
        // Set error states and clear loading states
        const errorStates = {};
        datasetNames.forEach((name) => {
          errorStates[name] = error.message || 'Failed to load row count';
        });

        set((state) => ({
          rowCountsError: { ...state.rowCountsError, ...errorStates },
          rowCountsLoading: {
            ...state.rowCountsLoading,
            ...Object.fromEntries(datasetNames.map((name) => [name, false])),
          },
        }));
      }
    }, 500);

    set({ debounceTimer: timer });
  },

  // Getters
  getEffectiveRowCount: (datasetName) => {
    const state = get();
    return state.dynamicRowCounts[datasetName] !== undefined
      ? state.dynamicRowCounts[datasetName]
      : state.originalRowCounts[datasetName];
  },

  isRowCountLoading: (datasetName) => {
    const state = get();
    return Boolean(state.rowCountsLoading[datasetName]);
  },

  getRowCountError: (datasetName) => {
    const state = get();
    return state.rowCountsError[datasetName];
  },

  // Threshold management methods
  getTotalSelectedRows: (selectedDatasets) => {
    const state = get();
    let totalRows = 0;

    selectedDatasets.forEach((datasetName) => {
      const effectiveRowCount =
        state.dynamicRowCounts[datasetName] !== undefined
          ? state.dynamicRowCounts[datasetName]
          : state.originalRowCounts[datasetName];

      if (effectiveRowCount && typeof effectiveRowCount === 'number') {
        totalRows += effectiveRowCount;
      }
    });

    return totalRows;
  },

  getTotalOriginalRows: () => {
    const state = get();
    return Object.values(state.originalRowCounts).reduce(
      (sum, count) => sum + (typeof count === 'number' ? count : 0),
      0,
    );
  },

  isOverThreshold: (selectedDatasets) => {
    const totalOriginalRows = get().getTotalOriginalRows();
    const datasetCount = selectedDatasets.size || selectedDatasets.length || 0;

    // If original data sum is under threshold, never restrict
    if (totalOriginalRows < THRESHOLD_CONFIG.maxRowThreshold) {
      return false;
    }

    // If original data sum >= threshold:
    // Single datasets get special exception - never restrict
    if (datasetCount === 1) {
      return false;
    }

    // Multiple datasets - apply current row restrictions
    const totalCurrentRows = get().getTotalSelectedRows(selectedDatasets);
    return totalCurrentRows > THRESHOLD_CONFIG.maxRowThreshold;
  },

  isAnyRowCountLoading: () => {
    const state = get();
    return Object.values(state.rowCountsLoading).some((loading) =>
      Boolean(loading),
    );
  },

  getThresholdStatus: (selectedDatasets) => {
    const state = get();
    const totalRows = state.getTotalSelectedRows(selectedDatasets);
    const maxRows = THRESHOLD_CONFIG.maxRowThreshold;
    const isLoading = state.isAnyRowCountLoading();
    const isOverThreshold = state.isOverThreshold(selectedDatasets);
    return {
      totalRows,
      maxRows,
      isLoading,
      isOverThreshold,
    };
  },

  getThresholdConfig: () => {
    return THRESHOLD_CONFIG;
  },

  // Reset all state to initial values
  resetStore: () => {
    const state = get();
    // Clear any pending debounce timer
    if (state.debounceTimer) {
      clearTimeout(state.debounceTimer);
    }

    set({
      datasetNames: [],
      originalRowCounts: {},
      dynamicRowCounts: {},
      rowCountsLoading: {},
      rowCountsError: {},
      debounceTimer: null,
    });
  },
}));

export default useRowCountStore;
