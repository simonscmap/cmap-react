# State Management Contract - Selection-Driven Row Count Optimization

## Overview

This contract defines the Zustand store interfaces for the selection-driven row count optimization feature. It adds selection-awareness, request cancellation, and 150ms debouncing to the existing multi-dataset download functionality.

## Enhanced Row Count Store

```javascript
// Zustand store for row count state
const useRowCountStore = create((set, get) => ({
  // State
  rowCounts: new Map(), // datasetId -> row count number
  loadingStates: new Map(), // datasetId -> boolean
  errorStates: new Map(), // datasetId -> error string or null
  pendingRequests: new Map(), // datasetId -> AbortController

  // Actions
  fetchRowCountsForSelected: async (datasetIds, filters) => {
    // Cancel existing requests, start new ones for selected datasets only
  },

  cancelPendingRequests: () => {
    // Abort all pending requests, clear pendingRequests map
  },

  debouncedFetchForSelected: (datasetIds, filters, delay = 150) => {
    // Debounce row count fetching by 150ms for batching
  },

  setRowCount: (datasetId, count) => {
    // Update row count for specific dataset
  },

  setLoadingState: (datasetId, isLoading) => {
    // Update loading state for specific dataset
  },

  setErrorState: (datasetId, error) => {
    // Update error state for specific dataset
  },

  // Getters
  getRowCount: (datasetId) => get().rowCounts.get(datasetId),
  isLoading: (datasetId) => get().loadingStates.get(datasetId) || false,
  getError: (datasetId) => get().errorStates.get(datasetId) || null,
}));
```

## Enhanced Dataset Selection Store

```javascript
// Zustand store for dataset selection state
const useDatasetSelectionStore = create((set, get) => ({
  // State
  selectedDatasets: new Set(), // Set of selected dataset IDs
  batchedSelections: new Set(), // Datasets waiting for debounced row count fetch
  debounceTimer: null, // Timer for 150ms debouncing

  // Actions
  selectDataset: (datasetId) => {
    // Add to selection, trigger batched row count update
  },

  deselectDataset: (datasetId) => {
    // Remove from selection, cancel any pending requests for this dataset
  },

  toggleDataset: (datasetId) => {
    // Toggle selection state
  },

  selectMultiple: (datasetIds) => {
    // Add multiple datasets to selection, batch row count requests
  },

  clearSelection: () => {
    // Clear all selections, cancel pending requests
  },

  addToBatch: (datasetId) => {
    // Add dataset to batched selections for debounced processing
  },

  processBatch: (delay = 150) => {
    // Process batched selections after delay, trigger row count fetch
  },

  // Getters
  isSelected: (datasetId) => get().selectedDatasets.has(datasetId),
  getSelectedIds: () => Array.from(get().selectedDatasets),
  getSelectionCount: () => get().selectedDatasets.size,
}));
```

## Filter Integration

```javascript
// Integration with existing filter state
const useFilterIntegration = () => {
  const filters = useSubsetFiltering(); // Existing filter hook

  return {
    getCurrentFilters: () => filters.state,
    isFiltered: () => filters.hasActiveFilters(),

    // Check if filter change should cancel requests
    shouldCancelRequests: (newFilters, oldFilters) => {
      return JSON.stringify(newFilters) !== JSON.stringify(oldFilters);
    },

    // Display format for unselected datasets
    getDisplayRowCount: (
      datasetId,
      unfilteredCount,
      isSelected,
      isFiltered,
    ) => {
      if (isSelected) {
        return 'Loading...'; // Will be replaced with actual count
      }
      if (isFiltered) {
        return `≤ ${unfilteredCount.toLocaleString()}`;
      }
      return unfilteredCount.toLocaleString();
    },
  };
};
```

## State Flow Patterns

### Dataset Selection Flow

1. User clicks dataset checkbox
2. `selectDataset(id)` called
3. Dataset added to `selectedDatasets` and `batchedSelections`
4. 150ms debounce timer started/restarted
5. When timer expires, `processBatch()` triggers row count fetch for batched datasets
6. Loading states set, API requests made with AbortController
7. Responses update row counts for selected datasets only

### Filter Change Flow

1. User changes filter (spatial/temporal/depth)
2. `cancelPendingRequests()` aborts all in-flight requests
3. If any datasets selected, trigger debounced row count fetch with new filters
4. Unselected datasets immediately show "≤ [unfiltered_count]" format

### Request Cancellation Flow

1. Filter change or dataset deselection occurs
2. Relevant AbortController.abort() called
3. Pending requests cancelled, loading states cleared
4. New requests initiated only for selected datasets with current filters

## Integration Points

### Multi-Dataset Download Integration

- Row count threshold validation uses sum of selected dataset counts only
- Download proceeds when selected datasets total ≤ 2M rows
- Threshold exceeded warning shown when sum > 2M rows

### UI Component Integration

- Loading indicators appear only on selected datasets during row count fetch
- Error states displayed per dataset with retry capability
- Unselected datasets show threshold format when filters applied

## Performance Requirements

- **Debouncing**: 150ms delay for selection changes
- **Request Batching**: Multiple selections within 150ms window = single API call
- **Cancellation Speed**: < 50ms between filter change and request abort
- **Memory**: No data persistence beyond browser session

## Error Handling

- Network failures: Preserve previous row counts, show error indicator
- API timeouts: Clear loading state, show retry option
- Aborted requests: Silently ignore, no error state
- Partial failures: Handle successful responses, mark failed datasets

This contract focuses on the core selection-driven optimization without unnecessary complexity like caching or advanced memory management.
