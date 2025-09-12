# Component Integration Points Mapping

**Task:** T002 - Map current component integration points  
**Reference:** [research.md:149-163](research.md)  
**Date:** 2025-09-12

## Overview

This document maps the current integration points between components in the multi-dataset download feature, identifying how state flows between components and where modifications will be needed for selection-driven row count optimization.

## Component Architecture Map

```
MultiDatasetDownloadContainer (Outer)
└── SearchProvider
    └── MultiDatasetDownloadContainerInner
        ├── SubsetControls (Filter UI)
        ├── SearchInput
        ├── MultiDatasetDownloadTable
        └── RowCountTotal + DownloadButton
```

## Store Integration Points

### 1. MultiDatasetDownloadStore Integration

**File:** `src/features/multiDatasetDownload/stores/multiDatasetDownloadStore.js`

**Current Integration Points:**

- **MultiDatasetDownloadContainer.js:6,44,164**: Import and hook usage
- **MultiDatasetDownloadTable.js:18,69-75**: Selection state management
- **RowCountTotal.js:3,28**: Selected datasets access

**Key Methods Used Across Components:**

- `toggleDatasetSelection()` - Used in table for checkbox toggles
- `selectAll()` - Used in table with row count store integration
- `clearSelections()` - Used in table for bulk clear operations
- `isDatasetSelected()` - Used in table for checkbox state
- `getSelectAllCheckboxState()` - Used in table for select-all checkbox
- `selectedDatasets` - Used in RowCountTotal for count display
- `fetchDatasetsMetadata()` - Used in container for data loading
- `resetStore()` - Used in container for cleanup

### 2. RowCountStore Integration

**File:** `src/features/multiDatasetDownload/stores/useRowCountStore.js`

**Current Integration Points:**

- **MultiDatasetDownloadContainer.js:7,45**: Import and filter update trigger
- **MultiDatasetDownloadTable.js:19,76-84**: Row count display and initialization
- **RowCountTotal.js:4,29**: Threshold status access

**Key Methods Used Across Components:**

- `updateRowCountsForFilters()` - **Critical:** Called from container on any filter change
- `getEffectiveRowCount()` - Used in table for row count display
- `isRowCountLoading()` - Used in table for loading spinner
- `getRowCountError()` - Used in table for error display
- `initializeWithDatasets()` - Used in table for initial setup
- `getThresholdStatus()` - Used in RowCountTotal for limit warnings
- `resetStore()` - Used in table for cleanup

### 3. Shared Filter Integration

**File:** `src/shared/filtering/hooks/useSubsetFiltering.js`

**Current Integration Points:**

- **MultiDatasetDownloadContainer.js:5,98-104**: Filter state management and bounds
- **Container effect at line 107-111**: **Critical integration point** - triggers row count updates on filter changes

**Key Integration Pattern:**

```javascript
// Current pattern in MultiDatasetDownloadContainer.js:107-111
useEffect(() => {
  if (filterValues.isFiltered) {
    updateRowCountsForFilters(filterValues); // ← MODIFICATION POINT
  }
}, [filterValues, updateRowCountsForFilters]);
```

## Component-Specific Integration Details

### MultiDatasetDownloadContainer.js

**Current Behavior:**

- Lines 107-111: Calls `updateRowCountsForFilters()` on ANY filter change
- Passes `filterValues` from `useSubsetFiltering` to row count store
- No selection awareness in filter-triggered updates

**Required Modifications for T002:**

- **Line 109**: Change to only update row counts for selected datasets
- **Add**: Request cancellation logic for filter changes
- **Add**: Integration with new selection-aware row count methods

### MultiDatasetDownloadTable.js

**Row Count Display Logic (Lines 138-160):**

**Current Priority Order:**

1. **Loading State**: `CircularProgress` when `isRowCountLoading(dataset)`
2. **Error State**: "Error" text when `getRowCountError(dataset)`
3. **Dynamic Count**: `dynamicRowCounts[dataset]` when available
4. **Original Count**: Falls back to `originalRowCounts[dataset]`
5. **Null Handling**: "N/A" for undefined values

**Required Modifications for T002:**

- **Lines 138-160**: Add logic for "≤ [count]" display for unselected datasets with filters
- **Selection Integration**: Only show loading spinners for selected datasets
- **Threshold Display**: Show estimated counts for unselected datasets

### RowCountTotal.js

**Current Integration (Lines 28-32):**

- Gets `selectedDatasets` from selection store
- Calls `getThresholdStatus(selectedDatasets)` from row count store
- Shows total rows and threshold warnings

**Required Modifications for T002:**

- **Line 32**: Ensure calculation only uses selected datasets (already correct)
- **Validation**: Verify no changes needed as component already selection-aware

## Key Integration Challenges Identified

### 1. Filter Change Propagation (HIGH PRIORITY)

**Current Flow:**

```
Filter Change → useEffect in Container → updateRowCountsForFilters(all datasets)
```

**Required Flow:**

```
Filter Change → Request Cancellation → updateRowCountsForSelected(selected only)
```

**Modification Point:** MultiDatasetDownloadContainer.js:107-111

### 2. Selection-Driven Updates (HIGH PRIORITY)

**Current:** Row counts update for all datasets regardless of selection
**Required:** Row counts update only for selected datasets
**Impact:** All three stores need coordination for selection-aware updates

### 3. Request Management (MEDIUM PRIORITY)

**Current:** Simple debouncing with 500ms delay in row count store
**Required:**

- Selection batching with 150ms delay
- Request cancellation with AbortController
- Different timing for selection vs filter changes

### 4. Display Logic Coordination (MEDIUM PRIORITY)

**Current:** Simple fallback pattern in table display
**Required:** Selection-aware display with threshold estimates for unselected

## Dependencies for Implementation

### Sequential Dependencies:

1. **T006-T007**: Enhanced stores must be implemented first
2. **T008-T010**: API and utilities for cancellation and batching
3. **T011-T013**: Component integration updates using new store methods

### Cross-Component Coordination Points:

- **Store Method Changes**: All components using `updateRowCountsForFilters()` need updates
- **Display Logic**: Table and total components need consistent selection-aware behavior
- **Error Handling**: Request cancellation errors need consistent handling across components

## Integration Testing Checkpoints

Based on [quickstart.md](quickstart.md) scenarios:

1. **Container Integration** (Scenario 1): Filter changes should only trigger updates for selected datasets
2. **Table Display** (Scenario 7): Unselected datasets with filters show "≤ [count]"
3. **Selection Batching** (Scenario 3): 150ms delay for selection changes
4. **Request Cancellation** (Scenario 6): Filter changes cancel previous requests
5. **Total Calculation** (Scenario 8): Only selected datasets contribute to total

## Files Requiring Modification

1. **MultiDatasetDownloadContainer.js** - Change filter update logic (lines 107-111)
2. **MultiDatasetDownloadTable.js** - Update display logic (lines 138-160)
3. **RowCountTotal.js** - Validate selection-only calculation (already correct)
4. **multiDatasetDownloadStore.js** - Add selection batching and debouncing
5. **useRowCountStore.js** - Add selection awareness and request cancellation

---

**Status:** Complete - All integration points mapped and modification requirements identified.
**Next Task:** T003 - Validate current API endpoint compatibility
