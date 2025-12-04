import { create } from 'zustand';
import {
  initializeCatalogSearch,
  searchCatalog,
  createSearchQuery,
} from '../../../../catalogSearch/api';
import { transformSpatialTemporalResults } from '../utils/spatialTemporalTransformer';
import useRowCountCalculationStore from './rowCountCalculationStore';
import {
  isValidSpatialBounds,
  isValidTemporalRange,
  isValidDepthRange,
} from '../utils/validation';
import { areConstraintsEqual } from '../utils/constraintComparison';

/**
 * Zustand store managing spatial-temporal overlap search state and actions.
 *
 * This store provides centralized state management for:
 * - Catalog search subsystem initialization
 * - User input constraints (spatial, temporal, depth)
 * - Overlap mode configuration
 * - Search execution and results
 * - Preset geographic boundaries
 *
 * @module spatialTemporalSearchStore
 */

const useSpatialTemporalSearchStore = create((set, get) => ({
  // ===========================================
  // State Fields
  // ===========================================

  /**
   * Catalog search initialization state
   */
  isInitialized: false,
  isInitializing: false,
  initError: null,

  /**
   * Spatial constraints (required)
   * @type {{ latMin: number | null, latMax: number | null, lonMin: number | null, lonMax: number | null }}
   */
  spatialBounds: {
    latMin: 30.758824,
    latMax: 32.743847,
    lonMin: -65.166799,
    lonMax: -63.1667,
  },

  /**
   * Temporal constraints (optional)
   * @type {{ timeMin: Date | null, timeMax: Date | null }}
   */
  temporalEnabled: false,
  temporalRange: {
    timeMin: null, // Date object | null
    timeMax: null, // Date object | null
  },

  /**
   * Depth constraints (optional)
   */
  depthEnabled: false,
  depthRange: {
    depthMin: null,
    depthMax: null,
  },

  /**
   * Overlap mode
   * @type {boolean} - true: include partial overlaps, false: full containment only
   */
  includePartialOverlaps: false,

  /**
   * Selected preset geographic boundary label
   * @type {string | null}
   */
  selectedPreset: 'BATS Region',

  /**
   * Data type filter (client-side filtering of results)
   * @type {Set<string>} - Set containing 'Model', 'Satellite', and/or 'In-Situ'
   */
  selectedDataTypes: new Set(['Model', 'Satellite', 'In-Situ']), // All types selected by default

  /**
   * Sort mode for result ordering
   * @type {string} - 'default' | 'spatial' | 'temporal' | 'depth' | 'utilization'
   */
  sortMode: 'default',

  /**
   * Sort direction for result ordering
   * @type {string} - 'asc' | 'desc'
   */
  sortDirection: 'desc',

  /**
   * Search results and execution state
   * @type {Array<DatasetOverlapResult> | null}
   */
  results: null, // null = no search performed yet, [] = search returned 0 results
  isSearching: false,
  searchError: null,

  /**
   * Snapshot of constraints from last successful search
   * Used to prevent redundant searches with identical constraints
   * @type {Object | null}
   */
  lastSearchConstraints: null,

  /**
   * UI state: Constraints section expansion
   * @type {boolean} - true: expanded (default), false: collapsed
   */
  isConstraintsExpanded: true,

  /**
   * Track if user has manually toggled collapse to prevent auto-collapse
   * @type {boolean}
   */
  userHasManuallyToggled: false,

  // ===========================================
  // Actions
  // ===========================================

  /**
   * Initialize the catalog search subsystem.
   * Must be called before executing searches.
   *
   * @returns {Promise<void>}
   */
  initialize: async () => {
    // TODO: Implement in T017
    set({ isInitializing: true, initError: null });
    try {
      await initializeCatalogSearch();
      set({ isInitialized: true, isInitializing: false });
    } catch (error) {
      set({
        isInitialized: false,
        isInitializing: false,
        initError: error.message || 'Failed to initialize catalog search',
      });
    }
  },

  /**
   * Update spatial constraints from user input.
   * Clears preset selection if bounds were manually changed.
   *
   * @param {Partial<BoundingBox>} bounds - Object with any of: latMin, latMax, lonMin, lonMax
   */
  setSpatialBounds: (bounds) => {
    // TODO: Implement in T018
    set((state) => ({
      spatialBounds: {
        ...state.spatialBounds,
        ...bounds,
      },
      selectedPreset: null, // Clear preset on manual edit
    }));
  },

  /**
   * Enable/disable temporal constraints and update temporal range.
   *
   * @param {boolean} enabled - Whether temporal constraints are active
   * @param {Object} [range] - Optional: { timeMin: Date, timeMax: Date }
   */
  setTemporalConstraints: (enabled, range) => {
    // TODO: Implement in T019
    set((state) => ({
      temporalEnabled: enabled,
      temporalRange: range
        ? { ...state.temporalRange, ...range }
        : state.temporalRange,
    }));
  },

  /**
   * Enable/disable depth constraints and update depth range.
   *
   * @param {boolean} enabled - Whether depth constraints are active
   * @param {Object} [range] - Optional: { depthMin: number, depthMax: number }
   */
  setDepthConstraints: (enabled, range) => {
    // TODO: Implement in T020
    set((state) => ({
      depthEnabled: enabled,
      depthRange: range ? { ...state.depthRange, ...range } : state.depthRange,
    }));
  },

  /**
   * Toggle overlap mode between partial and full containment.
   * Does not clear results - filtering will apply when user clicks search button.
   *
   * @param {boolean} value - true for partial overlaps, false for full containment
   */
  setIncludePartialOverlaps: (value) => {
    set({
      includePartialOverlaps: value,
    });
  },

  /**
   * Apply a preset geographic boundary to spatial bounds.
   *
   * @param {GeographicBoundary} preset - Preset object with label and coordinates
   */
  applyPreset: (preset) => {
    // TODO: Implement in T022
    set({
      spatialBounds: {
        latMin: preset.southLatitude,
        latMax: preset.northLatitude,
        lonMin: preset.westLongitude,
        lonMax: preset.eastLongitude,
      },
      selectedPreset: preset.label,
      results: null, // Keep null until search is performed
      searchError: null,
    });
  },

  /**
   * Update the selected data types and trigger new search.
   * - If exactly 1 type selected: SQL filtering (efficient)
   * - If 2-3 types selected: SQL returns all, client-side filtering (current limitation)
   *
   * Always triggers a new search to ensure all statistics update consistently.
   *
   * @param {Set<string>} selectedTypes - Set of type strings to filter by
   */
  setSelectedDataTypes: (selectedTypes) => {
    const newTypes = new Set(selectedTypes);

    set({ selectedDataTypes: newTypes });

    // Always trigger new search to update all statistics consistently
    // This ensures "Already in Collection" count and "X selected of Y datasets" reflect current filter
    get().search();
  },

  /**
   * Set sort mode and trigger new search
   * If the same mode is clicked, toggle direction; otherwise reset to 'desc'
   *
   * @param {string} mode - Sort mode ('default', 'spatial', 'temporal', 'depth', 'utilization')
   */
  setSortMode: (mode) => {
    const currentSortMode = get().sortMode;
    const currentSortDirection = get().sortDirection;
    const results = get().results;

    // If clicking the same mode, toggle direction
    if (currentSortMode === mode) {
      const newDirection = currentSortDirection === 'desc' ? 'asc' : 'desc';
      set({ sortDirection: newDirection });
    } else {
      // New mode - set it and reset to descending
      set({ sortMode: mode, sortDirection: 'desc' });
    }

    // Only trigger search if results already exist (re-sort, not initial search)
    if (results !== null) {
      get().search();
    }
  },

  /**
   * Execute spatial-temporal search with current constraints.
   * Validates inputs, builds query, executes search, and transforms results.
   *
   * @returns {Promise<void>}
   */
  search: async () => {
    // TODO: Implement in T023
    const {
      spatialBounds,
      temporalEnabled,
      temporalRange,
      depthEnabled,
      depthRange,
      includePartialOverlaps,
      sortMode,
      sortDirection,
      selectedDataTypes,
      hasValidConstraints,
    } = get();

    // Validation only (no deduplication check - allows sort/filter changes to trigger search)
    if (!hasValidConstraints()) {
      set({
        searchError:
          'Invalid search constraints. Please check all inputs and try again.',
      });
      return;
    }

    // Start search - reset global recalculation flag to show "Recalculate All" button again
    // but preserve calculated row counts (they will be marked stale if needed)
    useRowCountCalculationStore.getState().resetGlobalRecalculation();
    set({
      isSearching: true,
      searchError: null,
    });

    try {
      // Build query
      const query = createSearchQuery()
        .withSpatialBounds(spatialBounds, includePartialOverlaps)
        .withOverlapMode(includePartialOverlaps)
        .withSortMode(sortMode, sortDirection);

      // Add data type filter (supports 1, 2, or 3 types via SQL IN clause)
      if (selectedDataTypes.size > 0 && selectedDataTypes.size < 3) {
        // Convert Set to Array for SQL filtering
        query.withDatasetType(Array.from(selectedDataTypes));
      }
      // If all 3 types selected, no filter needed (optimization - handled in buildDataTypeFilter)

      if (temporalEnabled) {
        // Convert Date objects to ISO strings for API boundary
        query.withTemporalRange(
          temporalRange.timeMin.toISOString().split('T')[0], // Date → "YYYY-MM-DD"
          temporalRange.timeMax.toISOString().split('T')[0], // Date → "YYYY-MM-DD"
          includePartialOverlaps,
        );
      }

      if (depthEnabled) {
        query.withDepthRange(
          { depthMin: depthRange.depthMin, depthMax: depthRange.depthMax },
          includePartialOverlaps,
        );
      }

      // Execute search
      const rawResults = await searchCatalog(query.build());

      // Transform results
      const enhancedResults = transformSpatialTemporalResults(rawResults, {
        spatial: spatialBounds,
        temporal: temporalEnabled ? temporalRange : null,
        depth: depthEnabled ? depthRange : null,
      });

      // Store constraint snapshot on successful search
      const lastSearchConstraints = {
        spatialBounds: { ...spatialBounds },
        temporalEnabled,
        temporalRange: { ...temporalRange },
        depthEnabled,
        depthRange: { ...depthRange },
        includePartialOverlaps,
      };

      // Track search result dataset IDs for staleness detection
      const datasetIds = enhancedResults.map((dataset) => dataset.shortName);
      useRowCountCalculationStore
        .getState()
        .setLastSearchDatasetIds(datasetIds);

      // Auto-collapse constraints after search completes (if user hasn't manually toggled)
      const { userHasManuallyToggled, isConstraintsExpanded } = get();
      const shouldAutoCollapse =
        !userHasManuallyToggled &&
        isConstraintsExpanded &&
        enhancedResults.length > 0;

      set({
        results: enhancedResults,
        isSearching: false,
        lastSearchConstraints,
        ...(shouldAutoCollapse && { isConstraintsExpanded: false }),
      });

      // Auto-calculate estimates for eligible datasets immediately after search
      // This provides instant row counts for estimable datasets without user action
      if (enhancedResults.length > 0) {
        // Build constraints object for estimation
        const estimationConstraints = {
          spatialBounds,
          temporalRange,
          depthRange,
          temporalEnabled,
          depthEnabled,
          includePartialOverlaps,
        };

        // Fire-and-forget: don't await to avoid blocking UI
        // Estimation errors are handled internally by calculateEstimatesForDatasets
        useRowCountCalculationStore
          .getState()
          .calculateEstimatesForDatasets(
            enhancedResults,
            estimationConstraints,
          );
      }
    } catch (error) {
      set({
        isSearching: false,
        searchError: error.message || 'Search failed. Please try again.',
      });
    }
  },

  /**
   * Clear search results and error state.
   * Also clears last search constraints to allow re-searching.
   */
  clearResults: () => {
    // TODO: Implement in T024
    set({ results: null, searchError: null, lastSearchConstraints: null });
  },

  /**
   * Toggle the constraints section expansion state.
   * Sets userHasManuallyToggled based on the new state:
   * - true when manually collapsing (prevents auto-collapse)
   * - false when manually expanding (allows auto-collapse on next search)
   */
  toggleConstraintsExpanded: () => {
    set((state) => ({
      isConstraintsExpanded: !state.isConstraintsExpanded,
      userHasManuallyToggled: !state.isConstraintsExpanded ? false : true,
    }));
  },

  /**
   * Reset all store state to initial values.
   */
  reset: () => {
    // TODO: Implement in T024
    set({
      spatialBounds: {
        latMin: 30.758824,
        latMax: 32.743847,
        lonMin: -65.166799,
        lonMax: -63.1667,
      },
      temporalEnabled: false,
      temporalRange: {
        timeMin: null,
        timeMax: null,
      },
      depthEnabled: false,
      depthRange: {
        depthMin: null,
        depthMax: null,
      },
      includePartialOverlaps: false,
      selectedPreset: 'BATS Region',
      selectedDataTypes: new Set(['Model', 'Satellite', 'In-Situ']),
      results: null,
      searchError: null,
      isSearching: false, // Reset search state to allow new searches after modal reopen
      lastSearchConstraints: null, // Clear to allow searching with same constraints after reset
      isConstraintsExpanded: true,
      userHasManuallyToggled: false,
    });
  },

  // ===========================================
  // Selectors
  // ===========================================

  /**
   * Check if spatial bounds are complete and valid for searching.
   *
   * @returns {boolean} True if spatial bounds are valid
   */
  hasValidSpatialBounds: () => {
    const { spatialBounds } = get();
    return isValidSpatialBounds(spatialBounds);
  },

  /**
   * Check if constraints are valid for searching (pure validation, no deduplication).
   * Used internally by search() to validate before executing.
   *
   * @returns {boolean} True if constraints are valid
   */
  hasValidConstraints: () => {
    const {
      isInitialized,
      isSearching,
      spatialBounds,
      temporalEnabled,
      temporalRange,
      depthEnabled,
      depthRange,
    } = get();

    if (!isInitialized || isSearching) {
      return false;
    }

    if (!isValidSpatialBounds(spatialBounds)) {
      return false;
    }

    if (temporalEnabled) {
      const temporalConstraints = { enabled: true, ...temporalRange };
      if (!isValidTemporalRange(temporalConstraints)) {
        return false;
      }
    }

    if (depthEnabled) {
      const depthConstraints = { enabled: true, ...depthRange };
      if (!isValidDepthRange(depthConstraints)) {
        return false;
      }
    }

    return true;
  },

  /**
   * Check if all required conditions are met to execute a search.
   * Includes validation AND deduplication check (for UI button state).
   *
   * @returns {boolean} True if search can be executed
   */
  canSearch: () => {
    const {
      hasValidConstraints,
      spatialBounds,
      temporalEnabled,
      temporalRange,
      depthEnabled,
      depthRange,
      includePartialOverlaps,
      lastSearchConstraints,
    } = get();

    if (!hasValidConstraints()) {
      return false;
    }

    // Prevent redundant searches: check if current constraints match last search
    if (lastSearchConstraints) {
      const currentConstraints = {
        spatialBounds,
        temporalEnabled,
        temporalRange,
        depthEnabled,
        depthRange,
        includePartialOverlaps,
      };

      const constraintsMatch = areConstraintsEqual(
        currentConstraints,
        lastSearchConstraints,
      );

      if (constraintsMatch) {
        return false; // Can't search with same constraints as last search
      }
    }

    return true;
  },

  /**
   * Get the number of matching datasets.
   *
   * @returns {number} Count of results (0 if no search performed)
   */
  getResultCount: () => {
    const { results } = get();
    return results ? results.length : 0;
  },
}));

export default useSpatialTemporalSearchStore;
