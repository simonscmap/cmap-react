# Data Model: Selection-Driven Row Count Optimization

## Overview

This document defines the data entities required to implement the selection-driven row count optimization feature. The model builds upon the existing Zustand architecture to add selection-awareness, request cancellation, and 150ms debounced batching.

## Core Entities

### 1. Dataset Selection State

**Purpose**: Tracks which datasets are currently selected for download.

#### Structure

```javascript
{
  selectedDatasets: new Set(),    // Set of selected dataset IDs (strings)
  batchedSelections: new Set(),   // Datasets awaiting debounced row count fetch
  debounceTimer: null             // Timer reference for 150ms debouncing
}
```

#### Key Operations

- `selectDataset(id)` - Add dataset to selection, start debounce timer
- `deselectDataset(id)` - Remove dataset, cancel any pending requests for it
- `clearSelection()` - Clear all selections, cancel all pending requests

#### Validation Rules

- **FR-001**: Only datasets in `selectedDatasets` trigger row count calculations
- **FR-005**: Selections within 150ms window are batched into single API request
- **FR-009**: Prevent excessive API requests through debouncing

---

### 2. Row Count State

**Purpose**: Stores row count data and request status for datasets.

#### Structure

```javascript
{
  rowCounts: new Map(),           // datasetId -> number (row count)
  loadingStates: new Map(),       // datasetId -> boolean (is loading)
  errorStates: new Map(),         // datasetId -> string|null (error message)
  pendingRequests: new Map()      // datasetId -> AbortController
}
```

#### Key Operations

- `fetchRowCountsForSelected(datasetIds, filters)` - Fetch counts for selected datasets only
- `cancelPendingRequests()` - Abort all active requests (used on filter changes)
- `setRowCount(id, count)` - Update row count for specific dataset

#### Validation Rules

- **FR-003**: Cancel in-flight requests when filters change
- **FR-007**: Ignore API responses for datasets that became deselected
- **FR-008**: Loading indicators only for selected datasets

---

### 3. Filter State Integration

**Purpose**: Integration with existing filter system to trigger row count updates.

#### Structure

```javascript
// Uses existing useSubsetFiltering hook
{
  spatialFilter: {...},    // Existing spatial filter state
  temporalFilter: {...},   // Existing temporal filter state
  depthFilter: {...}       // Existing depth filter state
}
```

#### Key Operations

- `onFilterChange(newFilters, oldFilters)` - Detect filter changes, cancel requests
- `isFiltered()` - Check if any filters are active
- `shouldCancelRequests()` - Determine if filter change requires cancellation

#### Validation Rules

- **FR-002**: No API calls when filters change and no datasets selected
- **FR-003**: Cancel in-flight requests when filter values change
- **FR-006**: Show "≤ [unfiltered_count]" for unselected datasets when filtered

---

### 4. Debounce Timer Management

**Purpose**: Manages 150ms delay for batching rapid dataset selections.

#### Structure

```javascript
{
  debounceTimer: null,      // setTimeout reference
  delay: 150,               // Milliseconds to wait
  pendingBatch: new Set()   // Datasets in current batch
}
```

#### Key Operations

- `startDebounceTimer(delay)` - Start/restart 150ms timer
- `cancelDebounceTimer()` - Cancel timer (on filter changes)
- `processBatch()` - Execute when timer expires, trigger row count fetch

#### Validation Rules

- **FR-004**: 150ms delay for newly selected datasets
- **FR-005**: Batch multiple selections within timeframe
- **FR-009**: Prevent excessive requests through intelligent debouncing

---

## Data Flow

### Dataset Selection Flow

1. User selects dataset → `selectDataset(id)` called
2. Dataset added to `selectedDatasets` and `batchedSelections`
3. Debounce timer started/restarted (150ms)
4. Timer expires → `fetchRowCountsForSelected()` called with batched datasets
5. Loading states set, API requests made with AbortController
6. Responses update `rowCounts` for successfully selected datasets

### Filter Change Flow

1. User changes filter → `onFilterChange()` triggered
2. All pending requests cancelled via `cancelPendingRequests()`
3. If `selectedDatasets` not empty → start debounced fetch with new filters
4. Unselected datasets immediately display "≤ [unfiltered_count]"

### Request Cancellation Flow

1. Filter change or deselection occurs
2. Relevant `AbortController.abort()` called
3. `pendingRequests` map cleared for cancelled requests
4. Loading states reset for affected datasets

## State Transitions

### Dataset Selection States

```
Unselected → Selected: Add to selectedDatasets, start debounce timer
Selected → Unselected: Remove from selection, cancel pending request
Batch Pending → Loading: Debounce timer expires, API request initiated
Loading → Complete: Row count received, update rowCounts map
Loading → Error: Request failed, update errorStates map
```

### Request States

```
Idle → Pending: Dataset selected, debounce timer active
Pending → Loading: Timer expires, API request sent with AbortController
Loading → Complete: Response received, data stored
Loading → Cancelled: Filter change or deselection, AbortController.abort()
Complete → Stale: Filter change makes data invalid
```

## Integration Points

### Multi-Dataset Download Integration

- Row count threshold check uses sum of selected dataset counts only
- Download validation against 2M row limit
- Selection state persists during download preparation

### UI Component Integration

- Loading spinners shown only for selected datasets with active requests
- Error states displayed with dataset-specific retry capability
- Threshold format ("≤ count") for unselected datasets when filters active

## Configuration

### Constants

```javascript
const CONFIG = {
  DEBOUNCE_DELAY: 150, // Milliseconds for selection batching
  MAX_ROW_THRESHOLD: 2000000, // 2M row limit for downloads
  REQUEST_TIMEOUT: 30000, // 30 second timeout for API calls
};
```

### Performance Constraints

- **Selection Response**: < 50ms from click to UI update
- **Request Cancellation**: < 50ms from filter change to abort
- **Batch Processing**: All selections within 150ms → single API call
- **Memory Usage**: No data persistence beyond browser session

This simplified data model focuses on the core entities needed for selection-driven optimization without unnecessary complexity or caching layers.
