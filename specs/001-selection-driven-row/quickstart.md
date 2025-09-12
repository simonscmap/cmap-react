# Quickstart Guide: Selection-Driven Row Count Optimization

## Overview

This quickstart guide walks through manual testing scenarios for the selection-driven row count optimization feature. Each scenario validates specific functional requirements and user stories from the specification.

## Prerequisites

- Development server running (`npm start`)
- Multi-dataset download feature accessible in browser
- Browser developer tools available for monitoring network requests
- Test datasets available in the system

## Test Scenarios

### Scenario 1: No Selection, Filter Applied (FR-002)

**User Story**: Scientists applying filters with no datasets selected should not trigger unnecessary API calls.

**Steps**:

1. Navigate to multi-dataset download page
2. Ensure no datasets are selected (deselect all if needed)
3. Open browser Network tab in Developer Tools
4. Apply a spatial filter (e.g., select a geographic region)
5. Wait 500ms and observe network activity

**Expected Results**:

- ✅ No row count API requests made
- ✅ No loading indicators appear on any datasets
- ✅ Unselected datasets show "≤ [unfiltered_row_count]" format
- ✅ Filter state updates correctly in UI

**Validation**: Confirms FR-002 (no API calls when no datasets selected)

---

### Scenario 2: Selected Datasets with Filter Change (FR-001, FR-003)

**User Story**: When scientists have selected datasets and apply filters, only those selected datasets should trigger row count updates.

**Steps**:

1. Navigate to multi-dataset download page
2. Select exactly 3 datasets by clicking their checkboxes
3. Note the dataset IDs/names selected
4. Open browser Network tab and clear previous requests
5. Apply a temporal filter (e.g., set date range)
6. Monitor network requests and loading indicators

**Expected Results**:

- ✅ Exactly 3 row count API requests made (one per selected dataset or batched)
- ✅ Loading indicators appear only on the 3 selected datasets
- ✅ Non-selected datasets remain unchanged or show threshold format
- ✅ Request completion shows updated row counts for selected datasets only

**Validation**: Confirms FR-001 (only selected datasets calculated) and FR-003 (in-flight cancellation if applicable)

---

### Scenario 3: New Dataset Selection with Delay (FR-004, FR-005)

**User Story**: When scientists select a new dataset, the system should wait 150ms before making API calls to allow for batching.

**Steps**:

1. Navigate to multi-dataset download page
2. Apply any filter to create a filtered state
3. Open browser Network tab and clear requests
4. Quickly select a single new dataset
5. Immediately observe that no request is made
6. Wait exactly 150ms and observe network activity
7. Within the 150ms window, select 2 additional datasets rapidly
8. Continue monitoring for total request behavior

**Expected Results**:

- ✅ No immediate API request when first dataset selected
- ✅ After 150ms delay, API request includes all 3 rapidly selected datasets (batched)
- ✅ Only one network request made despite 3 selections
- ✅ Loading indicators appear for all 3 selected datasets

**Validation**: Confirms FR-004 (150ms delay) and FR-005 (batching multiple selections)

---

### Scenario 4: Rapid Selection Changes (FR-005, FR-009)

**User Story**: Multiple rapid dataset selections should be batched into efficient API requests.

**Steps**:

1. Navigate to multi-dataset download page
2. Open browser Network tab and clear requests
3. Very rapidly (within 100ms) select 5 different datasets
4. Monitor network requests and timing
5. Wait for all requests to complete
6. Repeat test with 10 rapid selections

**Expected Results**:

- ✅ Multiple selections within 150ms window result in single batched request
- ✅ Maximum of one request per 150ms window despite rapid clicking
- ✅ All rapidly selected datasets included in the batch request
- ✅ No excessive API requests generated

**Validation**: Confirms FR-005 (batching) and FR-009 (no excessive requests)

---

### Scenario 5: Dataset Deselection During Loading (FR-007)

**User Story**: If a dataset is deselected while its row count is loading, the response should be ignored.

**Steps**:

1. Navigate to multi-dataset download page
2. Apply a complex filter that will take time to calculate
3. Select a single dataset and wait for loading indicator to appear
4. Immediately deselect the dataset while request is still in flight
5. Allow the API request to complete
6. Observe the dataset's final state

**Expected Results**:

- ✅ Loading indicator disappears when dataset is deselected
- ✅ When API response arrives, it is ignored for the deselected dataset
- ✅ Dataset shows no row count update from the ignored response
- ✅ Dataset returns to unselected display state

**Validation**: Confirms FR-007 (ignore responses for deselected datasets)

---

### Scenario 6: Filter Change During Active Requests (FR-003)

**User Story**: Filter changes should cancel in-flight requests and start fresh with selected datasets.

**Steps**:

1. Navigate to multi-dataset download page
2. Select 2-3 datasets
3. Apply a spatial filter and wait for loading indicators to appear
4. While row counts are still loading, quickly change to a different spatial filter
5. Monitor network tab for request cancellation behavior
6. Observe final row count results

**Expected Results**:

- ✅ Original requests are cancelled when filter changes
- ✅ New requests are initiated immediately for selected datasets with new filters
- ✅ Loading indicators reset and show new loading state
- ✅ Final row counts reflect the latest filter values, not the cancelled requests

**Validation**: Confirms FR-003 (cancel in-flight requests on filter changes)

---

### Scenario 7: Unselected Dataset Display Format (FR-006)

**User Story**: Unselected datasets should show appropriate threshold indicators when filters are applied.

**Steps**:

1. Navigate to multi-dataset download page
2. Note original row counts for several datasets (no filters applied)
3. Select 1-2 datasets
4. Apply any filter (spatial, temporal, or depth)
5. Observe display format for unselected datasets
6. Remove all filters and observe format changes

**Expected Results**:

- ✅ With no filters: unselected datasets show normal unfiltered row counts
- ✅ With filters applied: unselected datasets show "≤ [unfiltered_row_count]"
- ✅ Selected datasets show actual filtered row counts (after loading)
- ✅ Format changes immediately when filters are applied/removed

**Validation**: Confirms FR-006 (threshold display for unselected datasets)

---

### Scenario 8: Loading Indicators for Selected Only (FR-008)

**User Story**: Loading indicators should appear only for datasets that are actively loading row counts.

**Steps**:

1. Navigate to multi-dataset download page
2. Select 3 specific datasets
3. Apply a filter that will trigger row count loading
4. Observe loading indicators across all visible datasets
5. Wait for loading to complete
6. Repeat with different selection

**Expected Results**:

- ✅ Loading indicators (spinners) appear only on selected datasets
- ✅ Unselected datasets show no loading indicators at any time
- ✅ Loading indicators disappear when row counts are received
- ✅ Error states (if any) appear only on selected datasets

**Validation**: Confirms FR-008 (loading indicators for selected datasets only)

---

## Performance Validation

### Timing Tests

**150ms Debounce Validation**:

1. Use browser developer tools Performance tab
2. Record timeline while rapidly selecting datasets
3. Measure time between last selection and API request
4. Verify 150ms ± 20ms delay consistency

**Request Cancellation Speed**:

1. Initiate row count requests with slow network throttling
2. Change filters during active requests
3. Measure time between filter change and request cancellation
4. Should be < 50ms for good user experience

### Memory Usage

**Large Selection Test**:

1. Select 50+ datasets with complex filters
2. Monitor browser memory usage in Task Manager
3. Apply multiple filter changes
4. Verify no memory leaks from cancelled requests

## Error Scenarios

### Network Failure Recovery

**Steps**:

1. Disconnect network during row count loading
2. Observe error handling behavior
3. Reconnect network
4. Test retry behavior and error clearing

**Expected Results**:

- ✅ Graceful error display with retry options
- ✅ Previous row count data preserved when possible
- ✅ Error states clear on successful retry

### API Timeout Handling

**Steps**:

1. Use browser developer tools to throttle network to 2G speeds
2. Select multiple datasets with complex filters
3. Observe timeout behavior and user feedback

**Expected Results**:

- ✅ Appropriate timeout handling (typically 30-60 seconds)
- ✅ Clear error messages for timeouts
- ✅ Ability to retry failed requests

## Success Criteria

The feature is working correctly when:

- ✅ All 8 manual test scenarios pass completely
- ✅ No unnecessary API requests for unselected datasets
- ✅ 150ms debouncing works consistently
- ✅ Request cancellation responds quickly (< 100ms)
- ✅ Memory usage remains stable during extensive testing
- ✅ Error handling provides clear user feedback
- ✅ UI responsiveness maintained during all operations

## Troubleshooting

**Common Issues**:

1. **Requests not cancelling**: Check browser AbortController support
2. **Incorrect timing**: Verify debounce implementation and browser performance
3. **Memory leaks**: Check for proper cleanup of event listeners and timers
4. **API errors**: Validate request batching and filter parameter formatting

**Debug Tools**:

- Browser Network tab for request monitoring
- Console logs for state transitions
- React Developer Tools for component state
- Performance tab for timing analysis

## Next Steps

After successful manual validation:

1. Document any discovered edge cases
2. Update functional requirements if needed
3. Proceed with production deployment
4. Monitor real-world usage metrics
5. Gather user feedback on performance improvements

This quickstart guide ensures the selection-driven row count optimization meets all specified requirements and provides a smooth user experience for scientists using the multi-dataset download feature.
