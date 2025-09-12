# Multi-Dataset Download Row Count Management Research

## Overview

This document provides comprehensive research into the current multi-dataset download functionality in the CMAP React application, focusing on row count calculation, selection handling, and filter interactions. The research informs the design of the selection-driven row count optimization feature.

## Current Implementation Analysis

### 1. Current Row Count Calculation Implementation

**Decision:** The system uses a dual-store approach with Zustand stores handling both dataset selection and row count management.

**Implementation Details:**

#### Row Count Store (`/Users/howardwkim/src/simonscmap/cmap-react/src/features/multiDatasetDownload/stores/useRowCountStore.js`)

- **Initial State**: Original row counts from dataset metadata stored in `originalRowCounts`
- **Dynamic Counts**: Filter-specific row counts stored in `dynamicRowCounts` (override originals)
- **Loading States**: Per-dataset loading tracking in `rowCountsLoading`
- **Error Handling**: Per-dataset error tracking in `rowCountsError`
- **Debouncing**: Built-in 500ms debounce using `setTimeout` for filter-triggered row count requests

#### API Integration

- **Endpoint**: `/api/data/bulk-download-row-counts` (POST)
- **Request Format**: `{ shortNames: string[], filters?: Object }`
- **Filter Transformation**: Custom transformation from Zustand format to API format
- **No Cancellation**: Currently no AbortController or request cancellation mechanism

#### Current Flow

1. `initializeWithDatasets()` - Sets up original row counts from metadata
2. Filter changes trigger `updateRowCountsForFilters()`
3. Debounced API call (500ms delay) fetches new row counts for ALL datasets
4. UI displays dynamic counts when available, falls back to original counts

### 2. Existing Filter Change Handling

**Decision:** Uses shared filtering system with `useSubsetFiltering` hook and centralized filter management.

**Implementation Details:**

#### Filter Hook (`/Users/howardwkim/src/simonscmap/cmap-react/src/shared/filtering/hooks/useSubsetFiltering.js`)

- **State Management**: Individual state variables for each filter type (lat, lon, time, depth)
- **Validation**: Built-in validation for date ranges and bounds checking
- **Filter Values**: Combined into `filterValues` object with `isFiltered` flag
- **No Debouncing**: Filter state changes immediately, debouncing happens at row count level

#### Container Integration (`MultiDatasetDownloadContainer.js`)

- **Effect Hook**: `useEffect` watches `filterValues.isFiltered`
- **Immediate Trigger**: Any filter change immediately calls `updateRowCountsForFilters()`
- **Aggregate Bounds**: Calculates combined bounds across all datasets for filter limits

### 3. Dataset Selection State Management

**Decision:** Pure Zustand implementation with Set-based selection tracking and computed selection helpers.

**Implementation Details:**

#### Selection Store (`multiDatasetDownloadStore.js`)

- **Storage**: `Set()` for O(1) selection/deselection performance
- **Actions**: `toggleDatasetSelection()`, `selectAll()`, `clearSelections()`
- **Computed Properties**: `isDatasetSelected()`, `getSelectAllCheckboxState()`
- **No Redux**: Completely independent of legacy Redux store

#### Selection Logic

- **Individual Toggle**: Simple Set add/delete operations
- **Select All**: Smart logic respects row count thresholds when row count store available
- **Threshold Awareness**: `selectAll()` can accept row count store to enforce 2M row limit
- **Partial Selection**: Returns feedback when select all hits threshold limit

### 4. Current Debouncing/Throttling Patterns

**Decision:** Multiple debouncing patterns exist across the application with varying implementations.

#### Row Count Store Pattern (500ms)

```javascript
const timer = setTimeout(async () => {
  // API call logic
}, 500);
set({ debounceTimer: timer });
```

#### UniversalSearch Pattern (300ms)

```javascript
// In SearchInput component
debounceTimeoutRef.current = setTimeout(() => {
  setSearchQuery(value);
}, SEARCH_CONFIG.DEBOUNCE_MS); // 300ms
```

#### Configuration Constants

- **Row Count**: Hard-coded 500ms timeout
- **Search**: Configurable via `SEARCH_CONFIG.DEBOUNCE_MS = 300`
- **No Shared Utility**: Each implementation manages its own debouncing

### 5. API Endpoints for Row Count Calculation

**Decision:** RESTful API design with bulk operations and filter support.

**Available Endpoints:**

#### Row Count Endpoint

- **Path**: `/api/data/bulk-download-row-counts`
- **Method**: POST
- **Request**: `{ shortNames: string[], filters?: Object }`
- **Response**: `{ [datasetName]: number }`
- **Error Handling**: HTTP status codes, no partial success handling

#### Initialization Endpoint

- **Path**: `/api/data/bulk-download-init`
- **Method**: POST
- **Purpose**: Fetch dataset metadata including initial row counts
- **Response**: `{ datasetsMetadata: Array }`

#### Download Endpoint

- **Path**: `/api/data/bulk-download`
- **Method**: POST
- **Purpose**: Actual data download with filters
- **Response**: ZIP file blob

### 6. Request Cancellation Patterns

**Decision:** No request cancellation mechanisms currently implemented.

**Current State:**

- **No AbortController**: Search across codebase found zero usage
- **No Cancellation Logic**: Pending requests continue even when new ones start
- **Potential Issues**: Race conditions possible with rapid filter changes
- **Cleanup**: Only debounce timer cleanup on component unmount

### 7. Current Display Logic for Row Counts

**Decision:** Fallback pattern with loading states and error handling per dataset.

**Implementation Details:**

#### Display Priority (in `MultiDatasetDownloadTable.js`)

1. **Loading State**: Shows `CircularProgress` spinner when `isRowCountLoading(dataset)`
2. **Error State**: Shows "Error" text when `getRowCountError(dataset)` exists
3. **Dynamic Count**: Shows `dynamicRowCounts[dataset]` when available
4. **Original Count**: Falls back to `originalRowCounts[dataset]`
5. **Null Handling**: Shows "N/A" for null/undefined values

#### Row Count Total Component (`RowCountTotal.js`)

- **Selection Summary**: Shows dataset count and total rows
- **Threshold Warning**: Red warning when over 2M row limit
- **Loading Indicator**: "Calculating..." during any row count loading
- **Fixed Height**: 72px container to prevent layout shift

### 8. State Management Architecture

**Decision:** Mixed architecture using both Zustand and Redux with clear separation of concerns.

#### Zustand Usage (Multi-Dataset Download)

- **Selection Management**: `useMultiDatasetDownloadStore`
- **Row Count Management**: `useRowCountStore`
- **Feature Isolation**: Completely isolated from main Redux store
- **Modern Patterns**: Uses `create()` with functional state updates

#### Redux Usage (Legacy/Shared)

- **UI Notifications**: `snackbarOpen` for user feedback
- **Global State**: User authentication, app-wide settings
- **Saga Integration**: For complex async flows (not used in multi-dataset feature)

## Rationale Analysis

### Why Current Patterns Work

1. **Zustand Separation**: Clean isolation of feature-specific state from global Redux store
2. **Debounced Row Counts**: Prevents API spam from rapid filter changes
3. **Fallback Display**: Graceful degradation when dynamic counts unavailable
4. **Set-Based Selection**: Efficient O(1) selection operations
5. **Threshold Enforcement**: Prevents users from selecting too much data

### Areas Needing Optimization

1. **Inefficient Row Count Fetching**: Always fetches ALL dataset counts, regardless of selection
2. **No Request Cancellation**: Race conditions possible with rapid filter changes
3. **Redundant Calculations**: Recalculates unselected dataset counts unnecessarily
4. **Fixed Debounce Timing**: 500ms may be too aggressive for some use cases
5. **No Partial Loading States**: All-or-nothing loading for row counts

## Alternatives Considered

### 1. Selection-Driven Row Count Strategy

**Alternative Approach**: Only fetch row counts for selected datasets plus a small buffer.

**Advantages:**

- Reduces API payload size significantly
- Faster response times for small selections
- More efficient server resource utilization
- Better user experience with targeted loading

**Implementation Considerations:**

- Need intelligent buffering for select-all scenarios
- Requires request cancellation to handle rapid selection changes
- More complex state management for partial data states

### 2. Request Cancellation Patterns

**Alternative Approach**: Implement AbortController-based cancellation.

**Advantages:**

- Eliminates race conditions
- Reduces unnecessary network traffic
- Better performance under rapid user interactions

**Implementation Options:**

- Per-store cancellation tokens
- Global request manager
- Hook-based cancellation utilities

### 3. Graduated Debouncing Strategy

**Alternative Approach**: Different debounce timings based on context.

**Advantages:**

- Immediate response for single dataset changes
- Longer debounce for complex multi-dataset operations
- Adaptive timing based on selection size

**Implementation:**

- Selection-aware debounce timing
- Progressive backoff for repeated changes
- User action type detection

### 4. Incremental Loading Strategy

**Alternative Approach**: Load row counts incrementally as selections change.

**Advantages:**

- Always-current data for selected items
- No bulk operations for small changes
- Faster perceived performance

**Challenges:**

- More complex caching logic
- Potential for many small API calls
- State synchronization complexity

## Recommended Implementation Path

Based on this research, the selection-driven row count optimization should:

1. **Implement Request Cancellation**: Use AbortController for all row count requests
2. **Selection-Aware Fetching**: Only fetch counts for selected datasets + small buffer
3. **Graduated Debouncing**: Shorter delays for single selections, longer for bulk operations
4. **Incremental State Management**: Handle partial row count data gracefully
5. **Maintain Fallback Patterns**: Keep existing display logic for reliability
6. **Preserve Zustand Architecture**: Build on existing store patterns rather than replacing them

This approach maintains the strengths of the current system while addressing performance bottlenecks and user experience issues.
