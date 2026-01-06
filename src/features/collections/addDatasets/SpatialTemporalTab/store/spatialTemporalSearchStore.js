import { create } from 'zustand';
import {
  initializeCatalogSearch,
  searchCatalog,
  createSearchQuery,
} from '../../../../catalogSearch/api';
import { transformSpatialTemporalResults } from '../utils/spatialTemporalTransformer';
import { areConstraintsEqual } from '../../../../../shared/utility/constraintComparison';
import { initializeRowCounts } from '../../../../rowCount';
import {
  isValidSpatialBounds,
  isValidTemporalRange,
  isValidDepthRange,
} from '../../../../../shared/utility/spatialTemporalDepthValidation';
import { dateToUTCDateString } from '../../../../../shared/filtering/utils/dateHelpers';

const useSpatialTemporalSearchStore = create((set, get) => ({
  // Initialization state
  isInitialized: false,
  isInitializing: false,
  initError: null,

  // Spatial constraints (required)
  spatialBounds: {
    latMin: 30.758824,
    latMax: 32.743847,
    lonMin: -65.166799,
    lonMax: -63.1667,
  },

  // Temporal constraints (optional)
  temporalEnabled: false,
  temporalRange: {
    timeMin: null, // Date object
    timeMax: null, // Date object
  },

  // Depth constraints (optional)
  depthEnabled: false,
  depthRange: {
    depthMin: null,
    depthMax: null,
  },

  // true: include partial overlaps, false: full containment only
  includePartialOverlaps: false,

  selectedPreset: 'BATS Region',
  selectedDataTypes: new Set(['Model', 'Satellite', 'In-Situ']),
  sortMode: 'default',
  sortDirection: 'desc',

  // null = no search performed yet, [] = search returned 0 results
  results: null,
  isSearching: false,
  searchError: null,

  // Snapshot of constraints from last successful search (prevents redundant searches)
  lastSearchConstraints: null,

  isConstraintsExpanded: true,
  // Prevents auto-collapse after manual toggle
  userHasManuallyToggled: false,

  /**
   * Initialize the catalog search subsystem.
   * @returns {Promise<void>}
   */
  initialize: async () => {
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
   * Update spatial constraints. Clears preset selection.
   * @param {Partial<BoundingBox>} bounds
   */
  setSpatialBounds: (bounds) => {
    set((state) => ({
      spatialBounds: {
        ...state.spatialBounds,
        ...bounds,
      },
      selectedPreset: null,
    }));
  },

  /**
   * Enable/disable temporal constraints and optionally update range.
   * @param {boolean} enabled
   * @param {Object} [range] - { timeMin: Date, timeMax: Date }
   */
  setTemporalConstraints: (enabled, range) => {
    set((state) => ({
      temporalEnabled: enabled,
      temporalRange: range
        ? { ...state.temporalRange, ...range }
        : state.temporalRange,
    }));
  },

  /**
   * Enable/disable depth constraints and optionally update range.
   * @param {boolean} enabled
   * @param {Object} [range] - { depthMin: number, depthMax: number }
   */
  setDepthConstraints: (enabled, range) => {
    set((state) => ({
      depthEnabled: enabled,
      depthRange: range ? { ...state.depthRange, ...range } : state.depthRange,
    }));
  },

  /**
   * Set overlap mode.
   * @param {boolean} value - true for partial overlaps, false for full containment
   */
  setIncludePartialOverlaps: (value) => {
    set({
      includePartialOverlaps: value,
    });
  },

  /**
   * Apply a preset geographic boundary.
   * @param {GeographicBoundary} preset
   */
  applyPreset: (preset) => {
    set({
      spatialBounds: {
        latMin: preset.southLatitude,
        latMax: preset.northLatitude,
        lonMin: preset.westLongitude,
        lonMax: preset.eastLongitude,
      },
      selectedPreset: preset.label,
      results: null,
      searchError: null,
    });
  },

  /**
   * Update data types and trigger search to refresh statistics.
   * @param {Set<string>} selectedTypes
   */
  setSelectedDataTypes: (selectedTypes) => {
    const newTypes = new Set(selectedTypes);
    set({ selectedDataTypes: newTypes });
    get().search();
  },

  /**
   * Set sort mode. Toggles direction if same mode clicked, otherwise resets to 'desc'.
   * @param {string} mode - 'default' | 'spatial' | 'temporal' | 'depth' | 'utilization'
   */
  setSortMode: (mode) => {
    const currentSortMode = get().sortMode;
    const currentSortDirection = get().sortDirection;
    const results = get().results;

    if (currentSortMode === mode) {
      const newDirection = currentSortDirection === 'desc' ? 'asc' : 'desc';
      set({ sortDirection: newDirection });
    } else {
      set({ sortMode: mode, sortDirection: 'desc' });
    }

    if (results !== null) {
      get().search();
    }
  },

  /**
   * Execute spatial-temporal search with current constraints.
   * @returns {Promise<void>}
   */
  search: async () => {
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

    if (!hasValidConstraints()) {
      set({
        searchError:
          'Invalid search constraints. Please check all inputs and try again.',
      });
      return;
    }

    set({
      isSearching: true,
      searchError: null,
    });

    try {
      const query = createSearchQuery()
        .withSpatialBounds(spatialBounds, includePartialOverlaps)
        .withOverlapMode(includePartialOverlaps)
        .withSortMode(sortMode, sortDirection);

      // SQL IN clause filtering when < 3 types selected
      if (selectedDataTypes.size > 0 && selectedDataTypes.size < 3) {
        query.withDatasetType(Array.from(selectedDataTypes));
      }

      if (temporalEnabled) {
        query.withTemporalRange(
          dateToUTCDateString(temporalRange.timeMin),
          dateToUTCDateString(temporalRange.timeMax),
          includePartialOverlaps,
        );
      }

      if (depthEnabled) {
        query.withDepthRange(
          { depthMin: depthRange.depthMin, depthMax: depthRange.depthMax },
          includePartialOverlaps,
        );
      }

      const rawResults = await searchCatalog(query.build());

      const enhancedResults = transformSpatialTemporalResults(rawResults, {
        spatial: spatialBounds,
        temporal: temporalEnabled ? temporalRange : null,
        depth: depthEnabled ? depthRange : null,
      });

      const lastSearchConstraints = {
        spatialBounds: { ...spatialBounds },
        temporalEnabled,
        temporalRange: { ...temporalRange },
        depthEnabled,
        depthRange: { ...depthRange },
        includePartialOverlaps,
      };

      // Auto-collapse if user hasn't manually toggled
      const { userHasManuallyToggled, isConstraintsExpanded } = get();
      const shouldAutoCollapse =
        !userHasManuallyToggled &&
        isConstraintsExpanded &&
        enhancedResults.length > 0;

      const estimationConstraints = {
        spatialBounds,
        temporalRange,
        depthRange,
        temporalEnabled,
        depthEnabled,
        includePartialOverlaps,
      };
      await initializeRowCounts(
        enhancedResults.map((r) => r.shortName),
        estimationConstraints,
      );

      set({
        results: enhancedResults,
        isSearching: false,
        lastSearchConstraints,
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
   * Clear search results, error state, and last constraints.
   */
  clearResults: () => {
    set({ results: null, searchError: null, lastSearchConstraints: null });
  },

  /**
   * Toggle constraints section. Sets userHasManuallyToggled to prevent/allow auto-collapse.
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
      isSearching: false,
      lastSearchConstraints: null,
      isConstraintsExpanded: true,
      userHasManuallyToggled: false,
    });
  },

  /**
   * @returns {boolean} True if spatial bounds are valid
   */
  hasValidSpatialBounds: () => {
    const { spatialBounds } = get();
    return isValidSpatialBounds(spatialBounds);
  },

  /**
   * Check if constraints are valid for searching (no deduplication check).
   * @returns {boolean}
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
   * Check if search can be executed (includes deduplication check for UI button state).
   * @returns {boolean}
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
        return false;
      }
    }

    return true;
  },

  /**
   * @returns {number} Count of results (0 if no search performed)
   */
  getResultCount: () => {
    const { results } = get();
    return results ? results.length : 0;
  },
}));

export default useSpatialTemporalSearchStore;
