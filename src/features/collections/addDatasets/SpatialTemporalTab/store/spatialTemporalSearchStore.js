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
import { messages } from '../../../../../shared/filtering/utils/validationMessages';
import { dateToUTCDateString } from '../../../../../shared/filtering/utils/dateHelpers';
import { DATASET_TYPES, createDataTypesSet } from '../../../../../shared/utility/getDatasetType';

const FULL_CONTAINMENT_THRESHOLD = 0.9999;

const isIntermediate = (v) => {
  let s = String(v).trim();
  return s === '' || s === '-' || s === '.' || s === '-.' || s === '-0' || s === '0.';
};

const SPATIAL_FIELD_LABELS = {
  latMin: 'Start Latitude',
  latMax: 'End Latitude',
  lonMin: 'Start Longitude',
  lonMax: 'End Longitude',
};

const SPATIAL_FIELD_BOUNDS = {
  latMin: { min: -90, max: 90 },
  latMax: { min: -90, max: 90 },
  lonMin: { min: -180, max: 180 },
  lonMax: { min: -180, max: 180 },
};

const DEPTH_FIELD_LABELS = {
  depthMin: 'Min Depth',
  depthMax: 'Max Depth',
};

const validateSpatialField = (field, value, allValues) => {
  let label = SPATIAL_FIELD_LABELS[field];
  let bounds = SPATIAL_FIELD_BOUNDS[field];
  let trimmed = String(value).trim();

  if (trimmed === '') {
    return { message: messages.required(label), blurOnly: true };
  }

  if (isIntermediate(trimmed)) {
    return { message: messages.invalidNumber(label), blurOnly: true };
  }

  let numValue = Number(trimmed);
  if (isNaN(numValue)) {
    return { message: messages.invalidNumber(label), blurOnly: false };
  }

  if (numValue < bounds.min) {
    return { message: messages.belowMin(label, bounds.min), blurOnly: false };
  }
  if (numValue > bounds.max) {
    return { message: messages.aboveMax(label, bounds.max), blurOnly: false };
  }

  if (field === 'latMin') {
    let otherVal = allValues.latMax;
    if (!isIntermediate(otherVal)) {
      let otherNum = Number(otherVal);
      if (!isNaN(otherNum) && numValue > otherNum) {
        return { message: messages.rangeInverted('Start Latitude', 'End Latitude'), blurOnly: false };
      }
    }
  }

  return { message: '', blurOnly: false };
};

const validateDepthField = (field, value, allValues) => {
  let label = DEPTH_FIELD_LABELS[field];
  let trimmed = String(value).trim();

  if (trimmed === '') {
    return { message: messages.required(label), blurOnly: true };
  }

  if (trimmed === '.' || trimmed === '0.') {
    return { message: messages.invalidNumber(label), blurOnly: true };
  }

  if (trimmed === '-' || trimmed === '-.' || trimmed === '-0') {
    return { message: messages.belowMin(label, 0), blurOnly: false };
  }

  let numValue = Number(trimmed);
  if (isNaN(numValue)) {
    return { message: messages.invalidNumber(label), blurOnly: false };
  }

  if (numValue < 0) {
    return { message: messages.belowMin(label, 0), blurOnly: false };
  }

  if (field === 'depthMin') {
    let otherVal = allValues.depthMax;
    if (!isIntermediate(otherVal) && otherVal !== '') {
      let otherNum = Number(otherVal);
      if (!isNaN(otherNum) && numValue > otherNum) {
        return { message: messages.rangeInverted('Min Depth', 'Max Depth'), blurOnly: false };
      }
    }
  }

  return { message: '', blurOnly: false };
};

function sortResultsByCoverage(results, sortMode, sortDirection) {
  const dir = sortDirection === 'desc' ? -1 : 1;

  const typeOrder = { 'In-Situ': 1, Satellite: 2, Model: 3 };
  const getTypeRank = (type) => typeOrder[type] || 4;

  return [...results].sort((a, b) => {
    switch (sortMode) {
      case 'spatial':
        if (a.overlap.spatial.coveragePercent !== b.overlap.spatial.coveragePercent) {
          return (b.overlap.spatial.coveragePercent - a.overlap.spatial.coveragePercent) * dir;
        }
        break;
      case 'temporal':
        const aTemporal = a.overlap.temporal ? a.overlap.temporal.coveragePercent : 0;
        const bTemporal = b.overlap.temporal ? b.overlap.temporal.coveragePercent : 0;
        if (aTemporal !== bTemporal) {
          return (bTemporal - aTemporal) * dir;
        }
        break;
      case 'depth':
        const aDepth = (a.overlap.depth && typeof a.overlap.depth.coveragePercent === 'number') ? a.overlap.depth.coveragePercent : 0;
        const bDepth = (b.overlap.depth && typeof b.overlap.depth.coveragePercent === 'number') ? b.overlap.depth.coveragePercent : 0;
        if (aDepth !== bDepth) {
          return (bDepth - aDepth) * dir;
        }
        break;
      case 'utilization':
        if (a.datasetUtilization !== b.datasetUtilization) {
          return (b.datasetUtilization - a.datasetUtilization) * dir;
        }
        break;
      default:
        break;
    }

    // Secondary sort: type → utilization → spatial → alphabetical
    const typeRankDiff = getTypeRank(a.type) - getTypeRank(b.type);
    if (typeRankDiff !== 0) return typeRankDiff;

    const utilDiff = (b.datasetUtilization - a.datasetUtilization) * dir;
    if (Math.abs(utilDiff) > 0.0001) return utilDiff;

    const spatialDiff = (b.overlap.spatial.coveragePercent - a.overlap.spatial.coveragePercent) * dir;
    if (Math.abs(spatialDiff) > 0.0001) return spatialDiff;

    return a.shortName.localeCompare(b.shortName);
  });
}

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

  spatialFieldErrors: {
    latMin: { message: '', blurOnly: false },
    latMax: { message: '', blurOnly: false },
    lonMin: { message: '', blurOnly: false },
    lonMax: { message: '', blurOnly: false },
  },
  spatialWarnings: [],

  // Field interaction state for spatial: null = pristine, false = focused, true = blurred
  spatialFieldInteraction: {
    latMin: null,
    latMax: null,
    lonMin: null,
    lonMax: null,
  },
  // Tracks whether an error has been revealed for each spatial field
  spatialErrorRevealed: {
    latMin: false,
    latMax: false,
    lonMin: false,
    lonMax: false,
  },

  temporalFieldErrors: {
    timeMin: { message: '', blurOnly: false },
    timeMax: { message: '', blurOnly: false },
  },

  depthFieldErrors: {
    depthMin: { message: '', blurOnly: false },
    depthMax: { message: '', blurOnly: false },
  },

  // Field interaction state: null = pristine (never touched), false = focused, true = blurred
  temporalFieldInteraction: {
    timeMin: null,
    timeMax: null,
  },
  depthFieldInteraction: {
    depthMin: null,
    depthMax: null,
  },
  // Tracks whether an error has been revealed (shown) for each field.
  // Once revealed, error stays visible until resolved.
  temporalErrorRevealed: {
    timeMin: false,
    timeMax: false,
  },
  depthErrorRevealed: {
    depthMin: false,
    depthMax: false,
  },

  selectedPreset: 'BATS Region',
  selectedDataTypes: createDataTypesSet(),
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
    get().updateSpatialWarnings();
  },

  updateSpatialWarnings: () => {
    const { spatialBounds } = get();
    const warnings = [];
    const { lonMin, lonMax } = spatialBounds;
    if (typeof lonMin === 'number' && typeof lonMax === 'number' && lonMin > lonMax) {
      warnings.push('The selected longitude values cross the dateline (antimeridian).');
    }
    set({ spatialWarnings: warnings });
  },

  validateSpatialInput: (rawValues) => {
    let errors = {};
    ['latMin', 'latMax', 'lonMin', 'lonMax'].forEach((field) => {
      errors[field] = validateSpatialField(field, rawValues[field], rawValues);
    });

    const { spatialBounds, selectedPreset } = get();
    if (selectedPreset) {
      let presetChanged = ['latMin', 'latMax', 'lonMin', 'lonMax'].some((field) => {
        let rawVal = String(rawValues[field]).trim();
        let storeVal = String(spatialBounds[field]);
        return rawVal !== storeVal;
      });
      if (presetChanged) {
        set({ spatialFieldErrors: errors, selectedPreset: null });
        return;
      }
    }

    set({ spatialFieldErrors: errors });
  },

  /**
   * Enable/disable temporal constraints and optionally update range.
   * @param {boolean} enabled
   * @param {Object} [range] - { timeMin: Date, timeMax: Date }
   */
  setTemporalConstraints: (enabled, range) => {
    let wasEnabled = get().temporalEnabled;
    let updates = {
      temporalEnabled: enabled,
    };
    if (range) {
      updates.temporalRange = { ...get().temporalRange, ...range };
    }
    if (enabled && !wasEnabled) {
      updates.temporalFieldInteraction = { timeMin: null, timeMax: null };
    }
    set(updates);
  },

  validateTemporalInput: (localRange) => {
    const { temporalEnabled } = get();
    const emptyErrors = {
      timeMin: { message: '', blurOnly: false },
      timeMax: { message: '', blurOnly: false },
    };

    if (!temporalEnabled) {
      set({ temporalFieldErrors: emptyErrors });
      return;
    }

    let errors = { ...emptyErrors };

    if (!localRange.timeMin) {
      errors.timeMin = { message: messages.required('Start Date'), blurOnly: true };
    }
    if (!localRange.timeMax) {
      errors.timeMax = { message: messages.required('End Date'), blurOnly: true };
    }

    if (localRange.timeMin && localRange.timeMax) {
      if (localRange.timeMin > localRange.timeMax) {
        errors.timeMin = { message: messages.dateRangeInverted(), blurOnly: false };
      }
    }

    set({ temporalFieldErrors: errors });
  },

  /**
   * Enable/disable depth constraints and optionally update range.
   * @param {boolean} enabled
   * @param {Object} [range] - { depthMin: number, depthMax: number }
   */
  setDepthConstraints: (enabled, range) => {
    let wasEnabled = get().depthEnabled;
    let updates = {
      depthEnabled: enabled,
    };
    if (range) {
      updates.depthRange = { ...get().depthRange, ...range };
    }
    if (enabled && !wasEnabled) {
      updates.depthFieldInteraction = { depthMin: null, depthMax: null };
    }
    set(updates);
  },

  validateDepthInput: (rawValues) => {
    const { depthEnabled } = get();
    if (!depthEnabled) {
      set({
        depthFieldErrors: {
          depthMin: { message: '', blurOnly: false },
          depthMax: { message: '', blurOnly: false },
        },
      });
      return;
    }
    let errors = {
      depthMin: validateDepthField('depthMin', rawValues.depthMin, rawValues),
      depthMax: validateDepthField('depthMax', rawValues.depthMax, rawValues),
    };
    set({ depthFieldErrors: errors });
  },

  /**
   * Mark a field as focused (user clicked into it).
   * @param {'spatial'|'temporal'|'depth'} section
   * @param {string} field
   */
  markFieldFocused: (section, field) => {
    let key = section === 'spatial' ? 'spatialFieldInteraction'
      : section === 'temporal' ? 'temporalFieldInteraction'
      : 'depthFieldInteraction';
    set((state) => ({
      [key]: { ...state[key], [field]: false },
    }));
  },

  /**
   * Mark a field as blurred (user left it).
   * @param {'spatial'|'temporal'|'depth'} section
   * @param {string} field
   */
  markFieldBlurred: (section, field) => {
    let key = section === 'spatial' ? 'spatialFieldInteraction'
      : section === 'temporal' ? 'temporalFieldInteraction'
      : 'depthFieldInteraction';
    set((state) => ({
      [key]: { ...state[key], [field]: true },
    }));
  },

  /**
   * Reset field interaction state to pristine.
   * @param {'spatial'|'temporal'|'depth'} section
   */
  resetFieldInteraction: (section) => {
    if (section === 'spatial') {
      set({
        spatialFieldInteraction: { latMin: null, latMax: null, lonMin: null, lonMax: null },
        spatialErrorRevealed: { latMin: false, latMax: false, lonMin: false, lonMax: false },
      });
    } else if (section === 'temporal') {
      set({
        temporalFieldInteraction: { timeMin: null, timeMax: null },
        temporalErrorRevealed: { timeMin: false, timeMax: false },
      });
    } else {
      set({
        depthFieldInteraction: { depthMin: null, depthMax: null },
        depthErrorRevealed: { depthMin: false, depthMax: false },
      });
    }
  },

  /**
   * Mark an error as revealed (has been shown to user).
   * Once revealed, error stays visible until resolved.
   * @param {'spatial'|'temporal'|'depth'} section
   * @param {string} field
   */
  revealError: (section, field) => {
    let key = section === 'spatial' ? 'spatialErrorRevealed'
      : section === 'temporal' ? 'temporalErrorRevealed'
      : 'depthErrorRevealed';
    set((state) => ({
      [key]: { ...state[key], [field]: true },
    }));
  },

  /**
   * Clear the revealed state for a field (when error is resolved).
   * @param {'spatial'|'temporal'|'depth'} section
   * @param {string} field
   */
  clearErrorRevealed: (section, field) => {
    let key = section === 'spatial' ? 'spatialErrorRevealed'
      : section === 'temporal' ? 'temporalErrorRevealed'
      : 'depthErrorRevealed';
    set((state) => ({
      [key]: { ...state[key], [field]: false },
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
      spatialFieldErrors: {
        latMin: { message: '', blurOnly: false },
        latMax: { message: '', blurOnly: false },
        lonMin: { message: '', blurOnly: false },
        lonMax: { message: '', blurOnly: false },
      },
      spatialFieldInteraction: {
        latMin: null,
        latMax: null,
        lonMin: null,
        lonMax: null,
      },
      spatialErrorRevealed: {
        latMin: false,
        latMax: false,
        lonMin: false,
        lonMax: false,
      },
    });
    get().updateSpatialWarnings();
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

  setSortMode: (mode) => {
    const currentSortMode = get().sortMode;
    const currentSortDirection = get().sortDirection;
    const results = get().results;

    let newSortMode = mode;
    let newSortDirection = 'desc';

    if (currentSortMode === mode) {
      newSortDirection = currentSortDirection === 'desc' ? 'asc' : 'desc';
    }

    if (results !== null && results.length > 0) {
      const sortedResults = sortResultsByCoverage(results, newSortMode, newSortDirection);
      set({ sortMode: newSortMode, sortDirection: newSortDirection, results: sortedResults });
    } else {
      set({ sortMode: newSortMode, sortDirection: newSortDirection });
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

      // SQL IN clause filtering when not all types selected
      if (selectedDataTypes.size > 0 && selectedDataTypes.size < DATASET_TYPES.length) {
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

      let enhancedResults = transformSpatialTemporalResults(rawResults, {
        spatial: spatialBounds,
        temporal: temporalEnabled ? temporalRange : null,
        depth: depthEnabled ? depthRange : null,
      });

      if (!includePartialOverlaps) {
        enhancedResults = enhancedResults.filter((dataset) => {
          const spatialOk = dataset.datasetUtilization >= FULL_CONTAINMENT_THRESHOLD;
          const temporalOk = !temporalEnabled ||
            (dataset.overlap.temporal && dataset.overlap.temporal.utilization >= FULL_CONTAINMENT_THRESHOLD);
          const depthOk = !depthEnabled ||
            (dataset.overlap.depth && dataset.overlap.depth.utilization >= FULL_CONTAINMENT_THRESHOLD);
          return spatialOk && temporalOk && depthOk;
        });
      }

      enhancedResults = sortResultsByCoverage(enhancedResults, sortMode, sortDirection);

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
      spatialFieldErrors: {
        latMin: { message: '', blurOnly: false },
        latMax: { message: '', blurOnly: false },
        lonMin: { message: '', blurOnly: false },
        lonMax: { message: '', blurOnly: false },
      },
      spatialWarnings: [],
      spatialFieldInteraction: {
        latMin: null,
        latMax: null,
        lonMin: null,
        lonMax: null,
      },
      spatialErrorRevealed: {
        latMin: false,
        latMax: false,
        lonMin: false,
        lonMax: false,
      },
      temporalFieldErrors: {
        timeMin: { message: '', blurOnly: false },
        timeMax: { message: '', blurOnly: false },
      },
      depthFieldErrors: {
        depthMin: { message: '', blurOnly: false },
        depthMax: { message: '', blurOnly: false },
      },
      temporalFieldInteraction: {
        timeMin: null,
        timeMax: null,
      },
      depthFieldInteraction: {
        depthMin: null,
        depthMax: null,
      },
      temporalErrorRevealed: {
        timeMin: false,
        timeMax: false,
      },
      depthErrorRevealed: {
        depthMin: false,
        depthMax: false,
      },
      selectedPreset: 'BATS Region',
      selectedDataTypes: createDataTypesSet(),
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
      spatialFieldErrors,
      temporalFieldErrors,
      depthFieldErrors,
    } = get();

    if (!isInitialized || isSearching) {
      return false;
    }

    let hasSpatialErrors = Object.values(spatialFieldErrors).some((e) => e.message);
    if (hasSpatialErrors || !isValidSpatialBounds(spatialBounds)) {
      return false;
    }

    if (temporalEnabled) {
      let hasTemporalErrors = Object.values(temporalFieldErrors).some((e) => e.message);
      if (hasTemporalErrors) {
        return false;
      }
      const temporalConstraints = { enabled: true, ...temporalRange };
      if (!isValidTemporalRange(temporalConstraints)) {
        return false;
      }
    }

    if (depthEnabled) {
      let hasDepthErrors = Object.values(depthFieldErrors).some((e) => e.message);
      if (hasDepthErrors) {
        return false;
      }
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
