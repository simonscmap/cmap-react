# Feature Specification: Selection-Driven Row Count Optimization

**Feature Branch**: `001-selection-driven-row`  
**Created**: 2025-09-12  
**Status**: Draft  
**Input**: User description: "Selection-Driven Row Count Optimization: Modify the multi-dataset download feature to only calculate row counts for currently selected datasets instead of all datasets when filters change. Implement smart request management with 150ms debounced batching, cancel in-flight requests on filter changes, and provide 150ms delayed API calls for newly selected datasets while maintaining baseline row counts for unselected datasets."

---

## User Scenarios & Testing

### Primary User Story

Scientists using the multi-dataset download feature need row counts to update only for datasets they have selected, reducing unnecessary API load and improving performance. When they apply filters to search through available datasets, the system should only recalculate row counts for datasets they intend to download, not for all visible datasets. This allows them to make informed decisions about which datasets to include in their download while maintaining system responsiveness.

### Acceptance Scenarios

1. **Given** no datasets are selected and user applies a spatial filter, **When** the filter is applied, **Then** no row count API calls are made and no loading indicators appear
2. **Given** user has 3 datasets selected and applies a temporal filter, **When** the filter is applied, **Then** only the 3 selected datasets trigger row count API calls with loading indicators
3. **Given** user applies filters and then selects a new dataset, **When** the dataset is selected, **Then** a 150ms delayed row count API call is made for only that newly selected dataset
4. **Given** user selects multiple datasets rapidly within 150ms, **When** selections are made, **Then** a single batched API call is made for all newly selected datasets
5. **Given** user deselects a dataset while its row count is loading, **When** the deselection occurs, **Then** the API response is ignored and the dataset shows no row count updates
6. **Given** user applies a spatial filter with no datasets selected, **When** the filter is applied, **Then** unselected datasets display "≤ [unfiltered_row_count]" instead of their original unfiltered numbers

### Edge Cases

- When user changes filters while row count requests are in-flight, system cancels/aborts those requests and makes new requests for selected datasets with updated filters
- API call failures for selected dataset row counts [TODO: Define error handling behavior]
- Select all operations work normally - all selections occur within 150ms timeframe and trigger batched row count API calls

## Requirements

### Functional Requirements

- **FR-001**: System MUST only calculate row counts for datasets that are currently selected by the user
- **FR-002**: System MUST NOT make API calls when filter changes occur and no datasets are selected
- **FR-003**: System MUST cancel in-flight row count requests when filter values change
- **FR-004**: System MUST trigger row count API calls with configurable delay (default 150ms) when datasets are newly selected
- **FR-005**: System MUST batch multiple dataset selections within the configured timeframe into a single API request
- **FR-006**: System MUST display "≤ [unfiltered_row_count]" for unselected datasets when any filters are applied, and unfiltered row counts when no filters are applied
- **FR-007**: System MUST ignore API responses for datasets that become deselected during request processing
- **FR-008**: System MUST show loading indicators only for selected datasets that are actively loading row counts
- **FR-009**: System MUST handle rapid selection changes without creating excessive API requests

### Key Entities

- **Dataset Selection State**: Tracks which datasets are currently selected for download, determines which datasets require row count updates
- **Row Count Request**: Represents API calls for calculating filtered row counts, can be batched for multiple datasets, can be cancelled when filters change
- **Filter State**: Spatial, temporal, and depth filter values that affect row count calculations, triggers row count updates only for selected datasets
- **Debounce Timer**: Configurable delay mechanism (default 150ms) for batching rapid dataset selections into single API requests
