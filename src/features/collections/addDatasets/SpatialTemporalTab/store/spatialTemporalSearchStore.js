import { create } from 'zustand';
import {
  initializeCatalogSearch,
  searchCatalog,
  createSearchQuery,
} from '../../../../catalogSearch/api';
import { transformSpatialTemporalResults } from '../utils/spatialTemporalTransformer';

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

    // If clicking the same mode, toggle direction
    if (currentSortMode === mode) {
      const newDirection = currentSortDirection === 'desc' ? 'asc' : 'desc';
      set({ sortDirection: newDirection });
    } else {
      // New mode - set it and reset to descending
      set({ sortMode: mode, sortDirection: 'desc' });
    }

    // Trigger new search with updated sort mode/direction
    get().search();
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
      hasValidSpatialBounds,
      canSearch,
    } = get();

    // Validation
    if (!canSearch()) {
      set({
        searchError:
          'Invalid search constraints. Please check all inputs and try again.',
      });
      return;
    }

    // Start search
    set({ isSearching: true, searchError: null });

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

      // Auto-collapse constraints after search completes (if user hasn't manually toggled)
      const { userHasManuallyToggled, isConstraintsExpanded } = get();
      const shouldAutoCollapse =
        !userHasManuallyToggled &&
        isConstraintsExpanded &&
        enhancedResults.length > 0;

      set({
        results: enhancedResults,
        isSearching: false,
        ...(shouldAutoCollapse && { isConstraintsExpanded: false }),
      });
    } catch (error) {
      set({
        isSearching: false,
        searchError: error.message || 'Search failed. Please try again.',
      });
    }
  },

  /**
   * Clear search results and error state.
   */
  clearResults: () => {
    // TODO: Implement in T024
    set({ results: null, searchError: null });
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
      includePartialOverlaps: true,
      selectedPreset: 'BATS Region',
      selectedDataTypes: new Set(['Model', 'Satellite', 'In-Situ']),
      results: null,
      searchError: null,
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
    // TODO: Implement in T025
    const { spatialBounds } = get();

    // All fields must be present
    if (
      spatialBounds.latMin === null ||
      spatialBounds.latMax === null ||
      spatialBounds.lonMin === null ||
      spatialBounds.lonMax === null
    ) {
      return false;
    }

    // Latitude validation
    if (
      spatialBounds.latMin < -90 ||
      spatialBounds.latMin > 90 ||
      spatialBounds.latMax < -90 ||
      spatialBounds.latMax > 90
    ) {
      return false;
    }

    // North > South
    if (spatialBounds.latMin >= spatialBounds.latMax) {
      return false;
    }

    // Longitude validation
    if (
      spatialBounds.lonMin < -180 ||
      spatialBounds.lonMin > 180 ||
      spatialBounds.lonMax < -180 ||
      spatialBounds.lonMax > 180
    ) {
      return false;
    }

    // Longitude can wrap (lonMin > lonMax is valid for date line crossing)

    return true;
  },

  /**
   * Check if all required conditions are met to execute a search.
   *
   * @returns {boolean} True if search can be executed
   */
  canSearch: () => {
    // TODO: Implement in T025
    const {
      isInitialized,
      isSearching,
      temporalEnabled,
      temporalRange,
      depthEnabled,
      depthRange,
      hasValidSpatialBounds,
    } = get();

    // Must be initialized and not currently searching
    if (!isInitialized || isSearching) {
      return false;
    }

    // Spatial bounds must be valid
    if (!hasValidSpatialBounds()) {
      return false;
    }

    // If temporal enabled, range must be valid
    if (temporalEnabled) {
      if (!temporalRange.timeMin || !temporalRange.timeMax) {
        return false;
      }
      if (temporalRange.timeMin > temporalRange.timeMax) {
        return false;
      }
    }

    // If depth enabled, range must be valid
    if (depthEnabled) {
      if (depthRange.depthMin === null || depthRange.depthMax === null) {
        return false;
      }
      if (depthRange.depthMin > depthRange.depthMax) {
        return false;
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
