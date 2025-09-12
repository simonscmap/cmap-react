# Implementation Plan: Selection-Driven Row Count Optimization

**Branch**: `001-selection-driven-row`  
**Date**: 2025-09-12  
**Spec**: [spec.md](spec.md)

## Summary

Optimize multi-dataset download feature to only calculate row counts for selected datasets instead of all datasets when filters change. Implement 150ms debounced request batching, cancel in-flight requests on filter changes, and provide smart row count display for unselected datasets. Technical approach uses existing Zustand state management with enhanced request cancellation and batching logic.

## Technical Context

**Language/Version**: JavaScript ES6+ with React 16.13.1  
**Primary Dependencies**: Redux 4.0.5, Zustand 4.5.7, Material-UI v4.12.0, Redux-Saga 1.1.3  
**Storage**: Browser state (Redux/Zustand), API-driven data (no local DB)  
**Testing**: Manual testing only (per constitution - no automated tests)  
**Target Platform**: Web browsers (modern browsers, excludes IE <= 11)  
**Project Type**: React SPA with API backend  
**Performance Goals**: 150ms debounced requests, <500ms row count updates, 2M row threshold  
**Constraints**: Existing Redux architecture, Material-UI v4, Node.js 12.18.1, 4GB heap limit

## Design Artifacts

### Phase 0: Research Complete ✓

- **research.md**: Analysis of existing multi-dataset download implementation
- Findings: Current implementation fetches row counts for ALL datasets regardless of selection
- Opportunity: Significant performance improvement by fetching only selected dataset counts

### Phase 1: Design Complete ✓

- **data-model.md**: Core entities (Dataset Selection State, Row Count State, Filter Integration, Debounce Timer)
- **contracts/row-count-api.yaml**: OpenAPI specification for enhanced row count endpoints
- **contracts/state-management-contract.md**: JavaScript Zustand store interfaces
- **quickstart.md**: Manual testing scenarios for all 8 functional requirements (FR-001 through FR-009)

## Implementation Approach

### Core Changes Required

1. **Enhanced Zustand Stores**
   - `useRowCountStore`: Add selection-aware fetching, request cancellation
   - `useDatasetSelectionStore`: Add debounced batching, 150ms timer management

2. **API Integration**
   - Modify row count requests to only include selected datasets
   - Add AbortController support for request cancellation
   - Implement batched requests for multiple datasets

3. **UI Updates**
   - Loading indicators only for selected datasets
   - "≤ [unfiltered_count]" display for unselected datasets when filters active
   - Error handling per dataset with retry capability

### Functional Requirements Mapping

- **FR-001**: Only selected datasets trigger row count calculations
- **FR-002**: No API calls when no datasets selected
- **FR-003**: Cancel in-flight requests on filter changes
- **FR-004**: 150ms delay for newly selected datasets
- **FR-005**: Batch multiple selections within timeframe
- **FR-006**: Threshold display for unselected datasets
- **FR-007**: Ignore responses for deselected datasets
- **FR-008**: Loading indicators for selected datasets only
- **FR-009**: Prevent excessive API requests

### Performance Optimizations

- **Debouncing**: 150ms window for batching rapid selections
- **Request Cancellation**: Immediate abort on filter changes
- **Memory Management**: No caching beyond browser session
- **Threshold Display**: Immediate UI updates without API calls for unselected datasets

## Manual Testing Strategy

Eight comprehensive test scenarios defined in quickstart.md:

1. No selection with filter applied (FR-002)
2. Selected datasets with filter change (FR-001, FR-003)
3. New dataset selection with delay (FR-004, FR-005)
4. Rapid selection changes (FR-005, FR-009)
5. Deselection during loading (FR-007)
6. Filter change during active requests (FR-003)
7. Unselected dataset display format (FR-006)
8. Loading indicators for selected only (FR-008)

## Next Steps

**Phase 2**: Run `/tasks` command to generate detailed implementation tasks  
**Phase 3**: Execute implementation following the task list  
**Phase 4**: Manual validation using quickstart scenarios

## Validation Criteria

- All 8 manual test scenarios pass
- No unnecessary API requests for unselected datasets
- 150ms debouncing works consistently
- Request cancellation < 100ms response time
- UI remains responsive during all operations
- Memory usage stable during extensive testing

This plan provides focused guidance for implementing selection-driven row count optimization that improves performance while maintaining the existing user experience.
