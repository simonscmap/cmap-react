# Current vs. Desired State Documentation

## Overview

This document outlines the current vs. desired state for each component that will be modified to implement the selection-driven row count optimization feature. Each section describes the current behavior, the desired behavior, and the key changes required.

## 1. useRowCountStore

**File**: `src/features/multiDatasetDownload/stores/useRowCountStore.js`

### Current State

- **Row Count Fetching**: Always fetches row counts for ALL datasets regardless of selection status
- **Debouncing**: Fixed 500ms debounce using setTimeout for all filter changes
- **Request Management**: No request cancellation mechanism - race conditions possible
- **State Structure**: Object-based storage (`originalRowCounts`, `dynamicRowCounts`)
- **Loading States**: Per-dataset loading tracking in `rowCountsLoading` object
- **API Calls**: Bulk requests for entire dataset list on any filter change

```javascript
// Current API call pattern
updateRowCountsForFilters: (filters) => {
  // Fetches row counts for ALL datasets
  const { datasetNames } = state;
  // No cancellation of pending requests
  setTimeout(async () => {
    const result = await bulkDownloadAPI.getRowCounts(datasetNames, filters);
  }, 500);
};
```

### Desired State

- **Selection-Aware Fetching**: Only fetch row counts for selected datasets + small buffer
- **Request Cancellation**: Use AbortController to cancel pending requests on new changes
- **Improved Debouncing**: 150ms delay optimized for selection batching
- **State Structure**: Map-based storage for better performance (`rowCounts`, `loadingStates`, `errorStates`)
- **Pending Request Tracking**: Track active requests with `pendingRequests` Map

```javascript
// Desired API call pattern
fetchRowCountsForSelected: async (selectedDatasetIds, filters) => {
  // Cancel existing requests first
  cancelPendingRequests();

  // Only fetch for selected datasets
  const result = await bulkDownloadAPI.getRowCounts(
    selectedDatasetIds,
    filters,
    abortSignal,
  );
};
```

### Key Changes Required

1. Add `fetchRowCountsForSelected()` method that only fetches selected datasets
2. Add `cancelPendingRequests()` method with AbortController support
3. Add `pendingRequests` Map to track active requests
4. Reduce debounce delay from 500ms to 150ms
5. Convert object-based state to Map-based for better performance

---

## 2. useMultiDatasetDownloadStore

**File**: `src/features/multiDatasetDownload/stores/multiDatasetDownloadStore.js`

### Current State

- **Selection Changes**: Immediate state updates with no batching
- **Row Count Integration**: No automatic row count updates on selection changes
- **Debouncing**: No debouncing at the selection level
- **State Updates**: Direct Set manipulation for dataset selection

```javascript
// Current selection pattern
toggleDatasetSelection: (datasetName) => {
  const newSelectedDatasets = new Set(selectedDatasets);
  // Immediate update, no batching
  if (newSelectedDatasets.has(datasetName)) {
    newSelectedDatasets.delete(datasetName);
  } else {
    newSelectedDatasets.add(datasetName);
  }
  set({ selectedDatasets: newSelectedDatasets });
};
```

### Desired State

- **Batched Selections**: Accumulate selection changes over 150ms window
- **Integrated Row Count Updates**: Automatically trigger row count updates for selected datasets
- **Debounced Processing**: Use `processBatch()` method to handle accumulated changes
- **State Batching**: Track pending selections in `batchedSelections` before committing

```javascript
// Desired selection pattern
toggleDatasetSelection: (datasetName) => {
  // Add to batch instead of immediate update
  addToBatch(datasetName);

  // Debounced processing triggers row count updates
  debouncedProcessBatch();
};
```

### Key Changes Required

1. Add `batchedSelections` state to accumulate changes
2. Add `debounceTimer` for 150ms batch processing
3. Add `processBatch()` method to commit batched changes
4. Integrate with row count store to trigger selective updates

---

## 3. MultiDatasetDownloadContainer

**File**: `src/features/multiDatasetDownload/components/MultiDatasetDownloadContainer.js`

### Current State

- **Filter Integration**: `useEffect` watches `filterValues.isFiltered` and immediately calls `updateRowCountsForFilters()`
- **Scope**: Updates row counts for ALL datasets on any filter change
- **No Selection Awareness**: Filter changes don't consider which datasets are selected
- **No Request Cancellation**: New filter changes don't cancel pending requests

```javascript
// Current filter handling
useEffect(() => {
  if (filterValues.isFiltered) {
    updateRowCountsForFilters(filterValues);
  }
}, [filterValues.isFiltered, updateRowCountsForFilters]);
```

### Desired State

- **Selection-Driven Updates**: Only update row counts for selected datasets when filters change
- **Request Cancellation**: Cancel pending requests before starting new ones on filter changes
- **Debounced Filter Changes**: Use 300ms debounce for filter changes (longer than selection changes)
- **Integrated Flow**: Coordinate between selection store and row count store

```javascript
// Desired filter handling
useEffect(() => {
  if (filterValues.isFiltered) {
    const selectedDatasets = getSelectedDatasets();
    cancelPendingRequests(); // Cancel existing requests
    debouncedFetchForSelected(selectedDatasets, filterValues, 300);
  }
}, [filterValues.isFiltered]);
```

### Key Changes Required

1. Import and use selection store to get selected datasets
2. Add filter change debouncing (300ms, longer than selection batching)
3. Integrate request cancellation on filter changes
4. Change from `updateRowCountsForFilters()` to `fetchRowCountsForSelected()`

---

## 4. MultiDatasetDownloadTable

**File**: `src/features/multiDatasetDownload/components/MultiDatasetDownloadTable.js`

### Current State

- **Loading Indicators**: Shows loading spinner for ALL datasets when any row count is loading
- **Display Logic**: Shows dynamic counts when available, falls back to original counts
- **No Threshold Display**: No special display for unselected datasets with filters
- **Uniform Loading**: All datasets show same loading state

```javascript
// Current display logic
const getDisplayedRowCount = (dataset) => {
  if (isRowCountLoading(dataset)) return <CircularProgress size={16} />;
  if (getRowCountError(dataset)) return 'Error';
  return dynamicRowCounts[dataset] || originalRowCounts[dataset] || 'N/A';
};
```

### Desired State

- **Selective Loading**: Only show loading indicators for selected datasets
- **Threshold Display**: Show "≤ [count]" for unselected datasets when filters are active
- **Selection-Aware States**: Different display logic based on selection status
- **Optimized Performance**: No unnecessary loading states for unselected items

```javascript
// Desired display logic
const getDisplayedRowCount = (dataset, isSelected) => {
  if (isSelected && isRowCountLoading(dataset))
    return <CircularProgress size={16} />;
  if (isSelected && getRowCountError(dataset)) return 'Error';
  if (!isSelected && hasActiveFilters())
    return `≤ ${originalRowCounts[dataset]}`;
  return getRowCount(dataset) || originalRowCounts[dataset] || 'N/A';
};
```

### Key Changes Required

1. Add selection awareness to display logic
2. Implement "≤ [count]" display for unselected datasets with active filters
3. Only show loading indicators for selected datasets
4. Optimize rendering performance for large dataset lists

---

## 5. RowCountTotal

**File**: `src/features/multiDatasetDownload/components/RowCountTotal.js`

### Current State

- **Total Calculation**: Calculates totals from ALL visible datasets (filtered but not necessarily selected)
- **Loading Display**: Shows "Calculating..." when ANY row count is loading
- **Threshold Logic**: Applies 2M row threshold to total of visible datasets
- **No Selection Filtering**: Doesn't filter totals by selection status

```javascript
// Current total calculation
const thresholdStatus = getThresholdStatus(selectedDatasets);
// But getThresholdStatus considers all visible datasets for loading states
```

### Desired State

- **Selected-Only Totals**: Calculate totals ONLY from selected datasets
- **Selection-Aware Loading**: Only show "Calculating..." when selected dataset counts are loading
- **Accurate Thresholds**: Apply 2M row limit to selected datasets only
- **Performance Optimization**: No unnecessary calculations for unselected datasets

```javascript
// Desired total calculation
const thresholdStatus = getThresholdStatusForSelected(selectedDatasets);
// Only considers selected datasets for all calculations
```

### Key Changes Required

1. Modify total calculation to only include selected datasets
2. Update loading indicator logic to only consider selected dataset loading states
3. Ensure threshold warnings apply only to selected dataset totals
4. Optimize calculation performance by filtering out unselected datasets early

---

## Implementation Priority

### Phase 1: Core State Management (T006-T007)

1. Enhanced row count store with selection awareness
2. Enhanced selection store with debouncing

### Phase 2: Integration (T011-T013)

1. Container component filter integration
2. Table component display logic updates
3. Total component selection filtering

### Phase 3: Validation

1. Manual testing with all scenarios
2. Performance validation of 150ms debouncing
3. Memory leak validation for request cancellation

## Success Criteria

- ✅ Row counts fetched only for selected datasets
- ✅ 150ms debouncing for selection changes
- ✅ 300ms debouncing for filter changes
- ✅ Request cancellation prevents race conditions
- ✅ Loading indicators only for selected datasets
- ✅ "≤ [count]" display for unselected with filters
- ✅ Totals calculated from selected datasets only
- ✅ No memory leaks from cancelled requests
