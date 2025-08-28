import { create } from 'zustand';
import bulkDownloadAPI from '../../../api/bulkDownload';

const useRowCountStore = create((set, get) => ({
  // State
  originalRowCounts: {},
  dynamicRowCounts: {},
  rowCountsLoading: {},
  rowCountsError: {},
  debounceTimer: null,

  // Actions
  setOriginalRowCounts: (datasets) => {
    set({ originalRowCounts: { ...datasets } });
  },

  updateRowCountsForFilters: (datasetNames, filters) => {
    const state = get();

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

  clearDynamicRowCounts: () => {
    const state = get();

    // Clear existing timer
    if (state.debounceTimer) {
      clearTimeout(state.debounceTimer);
    }

    set({
      dynamicRowCounts: {},
      rowCountsLoading: {},
      rowCountsError: {},
      debounceTimer: null,
    });
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
}));

export default useRowCountStore;
