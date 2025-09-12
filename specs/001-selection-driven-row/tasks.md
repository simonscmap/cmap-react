# Tasks: Selection-Driven Row Count Optimization

This feature optimizes row count calculations to only fetch counts for selected datasets, implements 150ms debouncing for selection batching, and adds request cancellation for filter changes.

**Reference Documentation:**

- Current state analysis: [research.md](research.md)
- Data model & entities: [data-model.md](data-model.md)
- API specification: [contracts/row-count-api.yaml](contracts/row-count-api.yaml)
- Store interfaces: [contracts/state-management-contract.md](contracts/state-management-contract.md)
- Manual testing guide: [quickstart.md](quickstart.md)

## Phase 1: Discovery & Setup

- [x] T001 Locate and analyze existing multi-dataset download stores (see [research.md:15-21](research.md))
- [x] T002 Map current component integration points (see [research.md:149-163](research.md))
- [x] T003 Validate current API endpoint compatibility (see [research.md:104-131](research.md))
- [x] T004 Install throttle-debounce library for request batching
- [x] T005 Document current vs. desired state for each component to be modified

## Phase 2: Core Store Implementation

- [x] T006 [P] Enhanced row count store with selection awareness
  - **File**: `src/features/multiDatasetDownload/stores/useRowCountStore.js`
  - **Spec**: [contracts/state-management-contract.md:9-47](contracts/state-management-contract.md)
  - **Current Analysis**: [current-vs-desired-state.md:9-62](current-vs-desired-state.md)
  - **Key changes**: Add `fetchRowCountsForSelected()`, `cancelPendingRequests()`, `pendingRequests` Map
  - **Validation**: Manual test using [quickstart.md scenario 2](quickstart.md)

- [x] T007 [P] Enhanced dataset selection store with debouncing
  - **File**: `src/features/multiDatasetDownload/stores/useMultiDatasetDownloadStore.js`
  - **Spec**: [contracts/state-management-contract.md:54-93](contracts/state-management-contract.md)
  - **Current Analysis**: [current-vs-desired-state.md:65-114](current-vs-desired-state.md)
  - **Key changes**: Add `batchedSelections`, `debounceTimer`, `processBatch()` method
  - **Validation**: Manual test using [quickstart.md scenario 3](quickstart.md)

## Phase 3: API & Utilities

- [ ] T008 Request cancellation utilities with AbortController
  - **File**: `src/features/multiDatasetDownload/utils/requestCancellation.js`
  - **Requirements**: Support for per-request cancellation, cleanup on filter changes
  - **Validation**: Manual test using [quickstart.md scenario 6](quickstart.md)

- [x] T009 ~~API integration for selection-driven row count requests~~ **REDUNDANT - SKIPPED**
  - **File**: ~~`src/features/multiDatasetDownload/api/rowCountApi.js`~~ **NOT NEEDED**
  - **Spec**: [contracts/row-count-api.yaml:24-176](contracts/row-count-api.yaml)
  - **Key changes**: ~~Batch requests for selected datasets, AbortController integration~~
  - **Current endpoint**: `/api/data/bulk-download-row-counts` (see [research.md:110-117](research.md))
  - **REDUNDANCY EXPLANATION**:
    - The existing `bulkDownloadAPI.getRowCounts()` already provides all needed functionality:
      - ✅ AbortSignal support for request cancellation
      - ✅ Filter transformation (`transformFiltersForAPI()`)
      - ✅ Clean data access to `/api/data/bulk-download-row-counts` endpoint
    - **Selection-driven logic belongs in stores (T006), not data access layer**
    - **Batch request logic belongs in stores (T006), not API layer**
    - Creating a separate `rowCountApi.js` would duplicate existing functionality
    - Data access layer should remain clean and simple; business logic goes in stores

- [ ] T010 Filter integration hook for request cancellation
  - **File**: `src/features/multiDatasetDownload/hooks/useFilterIntegration.js`
  - **Spec**: [contracts/state-management-contract.md:98-128](contracts/state-management-contract.md)
  - **Integration**: Uses existing `useSubsetFiltering` hook (see [research.md:43-49](research.md))

## Phase 4: Component Integration

- [ ] T011 Update MultiDatasetDownloadContainer for new selection flow
  - **File**: `src/Components/Catalog/Programs/MultiDatasetDownload/MultiDatasetDownloadContainer.js`
  - **Current behavior**: Calls `updateRowCountsForFilters()` on any filter change (see [research.md:50-55](research.md))
  - **Current Analysis**: [current-vs-desired-state.md:117-161](current-vs-desired-state.md)
  - **Integration Points**: [COMPONENT_INTEGRATION_MAPPING.md:88-100](COMPONENT_INTEGRATION_MAPPING.md)
  - **New behavior**: Only call for selected datasets, integrate request cancellation
  - **Validation**: Manual test using [quickstart.md scenario 1](quickstart.md)

- [ ] T012 Update MultiDatasetDownloadTable for selection-driven row counts
  - **File**: `src/Components/Catalog/Programs/MultiDatasetDownload/MultiDatasetDownloadTable.js`
  - **Current display logic**: See [research.md:149-156](research.md)
  - **Current Analysis**: [current-vs-desired-state.md:164-209](current-vs-desired-state.md)
  - **Integration Points**: [COMPONENT_INTEGRATION_MAPPING.md:104-119](COMPONENT_INTEGRATION_MAPPING.md)
  - **New display logic**: Show "≤ [count]" for unselected with filters, loading only for selected
  - **Validation**: Manual test using [quickstart.md scenario 7](quickstart.md)

- [ ] T013 Update RowCountTotal component for selected-only counting
  - **File**: `src/Components/Catalog/Programs/MultiDatasetDownload/RowCountTotal.js`
  - **Current behavior**: Shows total for all visible datasets (see [research.md:157-163](research.md))
  - **Current Analysis**: [current-vs-desired-state.md:212-248](current-vs-desired-state.md)
  - **Integration Points**: [COMPONENT_INTEGRATION_MAPPING.md:120-132](COMPONENT_INTEGRATION_MAPPING.md)
  - **New behavior**: Calculate total from selected datasets only
  - **Validation**: Manual test using [quickstart.md scenario 8](quickstart.md)

## Phase 5: Validation & Cleanup

- [ ] T014 Manual validation of FR-001 through FR-009 using [quickstart.md](quickstart.md) scenarios 1-8
- [ ] T015 Performance validation: 150ms debouncing timing using browser dev tools
- [ ] T016 Memory validation: No leaks from cancelled requests during filter changes
- [ ] T017 Remove deprecated row count patterns and unused code
- [ ] T018 Final integration test with all 8 quickstart scenarios

## Dependencies

**Sequential Dependencies:**

- T001-T005 (Discovery) must complete before implementation
- T006-T007 (Core stores) must complete before T008-T010 (API/Utils)
- T008-T010 (API/Utils) must complete before T011-T013 (Integration)
- T011-T013 (Integration) must complete before T014-T018 (Validation)

**Parallel Opportunities:**

- T006 and T007 can run in parallel (different stores)
- T008, T009, T010 can run in parallel after T006-T007 complete
- T011, T012, T013 can run in parallel after T008-T010 complete
- T014-T017 can run in parallel (different validation aspects)

## Key Implementation Notes

**Manual Testing Only:** This project uses manual testing exclusively. No automated tests will be created. All validation uses scenarios from [quickstart.md](quickstart.md).

**Functional Requirements Mapping:**

- FR-001, FR-002: T006 (selection-aware row count store)
- FR-003: T008 (request cancellation utilities)
- FR-004, FR-005: T007 (debounced selection store)
- FR-006: T012 (table display logic)
- FR-007: T008 + T011 (response filtering + container logic)
- FR-008: T012 (loading indicators for selected only)
- FR-009: T007 (debounced batching prevents excessive requests)

**Performance Targets:**

- 150ms debouncing for selection batching
- <50ms request cancellation response time
- No unnecessary API calls for unselected datasets
- Memory usage stable during extensive filter changes
