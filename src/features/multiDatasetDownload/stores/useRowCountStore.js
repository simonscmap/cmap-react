import { create } from 'zustand';
import { debounce } from 'throttle-debounce';
import { SELECTION_DEBOUNCE_DELAY_MS } from '../constants/constants';
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
  pendingRequests: {}, // datasetId -> AbortController
  previousFilters: null, // Track filter state for transition detection

  // Actions
  initializeWithDatasets: (datasets) => {
    const datasetNames = Object.keys(datasets);
    set({
      datasetNames,
      originalRowCounts: { ...datasets },
    });
  },

  // Helper function to detect filter transitions
  detectTransition: (newFilters) => {
    const state = get();
    const prev = state.previousFilters;
    return {
      isTransitionToUnfiltered:
        prev?.isFiltered === true && !newFilters?.isFiltered,
    };
  },

  // Helper function to restore original counts for selected datasets
  restoreOriginalCountsForSelected: (datasetIds) => {
    const state = get();
    const updatedDynamicRowCounts = { ...state.dynamicRowCounts };
    const clearedLoadingStates = {};

    datasetIds.forEach((datasetId) => {
      // Remove any stale dynamic counts - getEffectiveRowCount will fall back to original
      if (updatedDynamicRowCounts[datasetId] !== undefined) {
        delete updatedDynamicRowCounts[datasetId];
      }
      clearedLoadingStates[datasetId] = false;
    });

    set({
      dynamicRowCounts: updatedDynamicRowCounts,
      rowCountsLoading: { ...state.rowCountsLoading, ...clearedLoadingStates },
    });
  },

  fetchRowCountsForSelected: async (datasetIds, filters) => {
    const state = get();

    // Detect transition and update previous filters for next call
    const transition = state.detectTransition(filters);
    set({ previousFilters: filters ? { ...filters } : null });

    // Cancel existing requests first
    state.cancelPendingRequests();

    if (!datasetIds || datasetIds.length === 0) {
      return;
    }

    // Handle filtered → unfiltered transition
    if (transition.isTransitionToUnfiltered) {
      state.restoreOriginalCountsForSelected(datasetIds);
      return;
    }

    // If no filters are applied, skip API call since result would be identical to originalRowCounts
    if (!filters?.isFiltered) {
      // Clear any loading states and return early
      const loadingStates = {};
      datasetIds.forEach((datasetId) => {
        loadingStates[datasetId] = false;
      });
      set((state) => ({
        rowCountsLoading: { ...state.rowCountsLoading, ...loadingStates },
      }));
      return;
    }

    // Set loading states for selected datasets
    const loadingStates = {};
    const errorStates = {};
    const pendingRequests = {};

    datasetIds.forEach((datasetId) => {
      loadingStates[datasetId] = true;
      errorStates[datasetId] = null;
    });

    set((state) => ({
      rowCountsLoading: { ...state.rowCountsLoading, ...loadingStates },
      rowCountsError: { ...state.rowCountsError, ...errorStates },
    }));

    try {
      // Create AbortController for this batch of requests
      const abortController = new AbortController();
      datasetIds.forEach((datasetId) => {
        pendingRequests[datasetId] = abortController;
      });

      set((state) => ({
        pendingRequests: { ...state.pendingRequests, ...pendingRequests },
      }));

      const rowCounts = await bulkDownloadAPI.getRowCounts(
        datasetIds,
        filters,
        abortController.signal,
      );

      // Update row counts and clear loading states
      const updatedRowCounts = {};
      const updatedLoadingStates = {};

      datasetIds.forEach((datasetId) => {
        if (rowCounts[datasetId] !== undefined) {
          updatedRowCounts[datasetId] = rowCounts[datasetId];
        }
        updatedLoadingStates[datasetId] = false;
      });

      // Clear pending requests for completed datasets
      const updatedPendingRequests = { ...get().pendingRequests };
      datasetIds.forEach((datasetId) => {
        delete updatedPendingRequests[datasetId];
      });

      set((state) => ({
        dynamicRowCounts: { ...state.dynamicRowCounts, ...updatedRowCounts },
        rowCountsLoading: {
          ...state.rowCountsLoading,
          ...updatedLoadingStates,
        },
        pendingRequests: updatedPendingRequests,
      }));
    } catch (error) {
      // Only handle errors if the request wasn't aborted
      if (error.name !== 'AbortError') {
        const updatedErrorStates = {};
        const updatedLoadingStates = {};
        const updatedPendingRequests = { ...get().pendingRequests };

        datasetIds.forEach((datasetId) => {
          updatedErrorStates[datasetId] =
            error.message || 'Failed to load row count';
          updatedLoadingStates[datasetId] = false;
          delete updatedPendingRequests[datasetId];
        });

        set((state) => ({
          rowCountsError: { ...state.rowCountsError, ...updatedErrorStates },
          rowCountsLoading: {
            ...state.rowCountsLoading,
            ...updatedLoadingStates,
          },
          pendingRequests: updatedPendingRequests,
        }));
      }
    }
  },

  cancelPendingRequests: () => {
    const state = get();

    // Abort all pending requests
    Object.values(state.pendingRequests).forEach((abortController) => {
      if (abortController && typeof abortController.abort === 'function') {
        abortController.abort();
      }
    });

    // Clear pending requests
    set({ pendingRequests: {} });
  },

  // Debounced version for batching requests
  debouncedFetchForSelected: debounce(
    SELECTION_DEBOUNCE_DELAY_MS,
    false,
    (datasetIds, filters) => {
      const state = get();
      state.fetchRowCountsForSelected(datasetIds, filters);
    },
  ),

  setRowCount: (datasetId, count) => {
    set((state) => ({
      dynamicRowCounts: { ...state.dynamicRowCounts, [datasetId]: count },
    }));
  },

  setLoadingState: (datasetId, isLoading) => {
    set((state) => ({
      rowCountsLoading: { ...state.rowCountsLoading, [datasetId]: isLoading },
    }));
  },

  setErrorState: (datasetId, error) => {
    set((state) => ({
      rowCountsError: { ...state.rowCountsError, [datasetId]: error },
    }));
  },

  // Legacy method - maintained for backward compatibility
  updateRowCountsForFilters: (filters) => {
    const state = get();
    const { datasetNames } = state;

    // Use the new method but fetch for all datasets to maintain compatibility
    state.debouncedFetchForSelected(datasetNames, filters);
  },

  // Getters - new methods for contract compliance
  getRowCount: (datasetId) => {
    const state = get();
    return state.getEffectiveRowCount(datasetId);
  },

  isLoading: (datasetId) => {
    const state = get();
    return Boolean(state.rowCountsLoading[datasetId]);
  },

  getError: (datasetId) => {
    const state = get();
    return state.rowCountsError[datasetId] || null;
  },

  // Legacy getters - maintained for backward compatibility
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
      // Use getEffectiveRowCount for consistent logic
      const effectiveRowCount = state.getEffectiveRowCount(datasetName);

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

    // Cancel any pending requests first
    state.cancelPendingRequests();

    set({
      datasetNames: [],
      originalRowCounts: {},
      dynamicRowCounts: {},
      rowCountsLoading: {},
      rowCountsError: {},
      pendingRequests: {},
      previousFilters: null,
    });
  },
}));

export default useRowCountStore;
