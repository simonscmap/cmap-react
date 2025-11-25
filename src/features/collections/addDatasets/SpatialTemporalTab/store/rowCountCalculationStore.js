import { create } from 'zustand';
import collectionsAPI from '../../../api/collectionsApi';
import { areConstraintsEqual } from '../utils/constraintComparison';
import { isValidTemporalRange, isValidDepthRange } from '../utils/validation';
import useSpatialTemporalSearchStore from './spatialTemporalSearchStore';
import logInit from '../../../../../Services/log-service';
import isEligibleForEstimation from '../../../../../shared/estimation/isEligibleForEstimation';
import estimateRowCount from '../../../../../shared/estimation/estimateRowCount';
import { getSearchDatabaseApi } from '../../../../catalogSearch/api';

const log = logInit('SpatialTemporalTab/rowCountCalculationStore');

/**
 * Zustand store managing row count calculation state and actions.
 *
 * This store provides centralized state management for:
 * - Row count calculation results for datasets
 * - Loading states for individual datasets
 * - Error handling and skipped datasets (satellite/model types)
 *
 * Separated from spatialTemporalSearchStore to isolate row count concerns.
 *
 * @module rowCountCalculationStore
 */

const useRowCountCalculationStore = create((set, get) => ({
  // ===========================================
  // State Fields
  // ===========================================

  /**
   * Row count calculation state
   */
  calculatedRowCounts: {}, // Map of shortName → count
  rowCountsLoading: false,
  rowCountLoadingDatasets: new Set(), // Set of shortNames currently being calculated
  rowCountError: null,
  skippedDatasets: [], // Array of shortNames for cluster-only datasets that were skipped
  failedRowCounts: [], // Datasets that failed calculation
  estimatedRowCounts: new Set(), // Set of shortNames that were calculated via frontend estimation (vs backend recalculation)

  /**
   * Per-dataset constraint snapshots capturing constraint state when each dataset's row count was calculated.
   * Used to detect when current constraints differ from the constraints used for that specific dataset,
   * enabling per-dataset staleness detection for cached row counts.
   *
   * Structure: Map of shortName → snapshot object
   * Each snapshot contains:
   * @property {Object} spatialBounds - Spatial bounds at calculation time
   * @property {number} spatialBounds.latMin - Minimum latitude
   * @property {number} spatialBounds.latMax - Maximum latitude
   * @property {number} spatialBounds.lonMin - Minimum longitude
   * @property {number} spatialBounds.lonMax - Maximum longitude
   * @property {Object} temporalRange - Temporal range at calculation time
   * @property {Date|null} temporalRange.timeMin - Start date
   * @property {Date|null} temporalRange.timeMax - End date
   * @property {Object} depthRange - Depth range at calculation time
   * @property {number|null} depthRange.depthMin - Minimum depth in meters
   * @property {number|null} depthRange.depthMax - Maximum depth in meters
   * @property {boolean} temporalEnabled - Whether temporal constraints were active
   * @property {boolean} depthEnabled - Whether depth constraints were active
   * @property {boolean} includePartialOverlaps - Whether partial overlap mode was enabled
   * @property {Date} timestamp - When the calculation was performed
   *
   * @type {Object} - Map of shortName → snapshot (empty object {} before any calculations)
   */
  datasetConstraintSnapshots: {},

  /**
   * Tracks whether the user has used the "Recalculate All" button for the current search.
   * This flag only tracks GLOBAL recalculation, not individual dataset recalculations.
   * Reset only when a new search is performed (clearRowCounts called).
   *
   * @type {boolean}
   */
  hasUsedGlobalRecalculation: false,

  /**
   * Tracks dataset IDs from the last successful search.
   * Used to detect if a dataset is no longer in the current search results,
   * which indicates the calculated row count may be stale.
   *
   * @type {Set<string>} - Set of dataset short names from last search
   */
  lastSearchDatasetIds: new Set(),

  // ===========================================
  // Selectors
  // ===========================================

  /**
   * Determines if a dataset's row count is stale based on current constraints
   * and per-dataset recalculation history.
   *
   * Staleness detection rules:
   * - Satellite/Model datasets: Never stale (excluded from recalculation)
   * - Dataset not in search results: Stale if has calculated row count (search results changed)
   * - No snapshot for this dataset: Stale if temporal/depth enabled WITH VALID VALUES OR spatial partial coverage
   * - Snapshot exists for this dataset: Stale if current constraints differ from dataset's snapshot
   *
   * @param {string} shortName - Dataset identifier
   * @param {Object} currentConstraints - Current constraint configuration
   * @param {Object} currentConstraints.spatialBounds - Spatial bounds { latMin, latMax, lonMin, lonMax }
   * @param {Object} currentConstraints.temporalRange - Temporal range { timeMin: Date|null, timeMax: Date|null }
   * @param {Object} currentConstraints.depthRange - Depth range { depthMin: number|null, depthMax: number|null }
   * @param {boolean} currentConstraints.temporalEnabled - Whether temporal constraints are active
   * @param {boolean} currentConstraints.depthEnabled - Whether depth constraints are active
   * @param {boolean} currentConstraints.includePartialOverlaps - Whether partial overlap mode is enabled
   * @param {number} datasetUtilization - Dataset's spatial utilization metric (0.0 to 1.0)
   * @param {string} datasetType - Dataset type (e.g., 'Satellite', 'Model', 'In-Situ')
   * @returns {{ isStale: boolean, reason: string|null }} Staleness state and reason
   *
   * @example
   * const { isStale, reason } = get().isDatasetStale(
   *   'dataset_1',
   *   currentConstraints,
   *   0.85,
   *   'In-Situ'
   * );
   * // Returns { isStale: true, reason: 'spatial_partial' }
   */
  isDatasetStale: (
    shortName,
    currentConstraints,
    datasetUtilization,
    datasetType,
  ) => {
    const {
      datasetConstraintSnapshots,
      calculatedRowCounts,
      lastSearchDatasetIds,
    } = get();
    const datasetSnapshot = datasetConstraintSnapshots[shortName];

    // Check if dataset is no longer in current search results but has a calculated row count
    // This means search results changed and the calculated value may no longer be relevant
    if (lastSearchDatasetIds.size > 0 && !lastSearchDatasetIds.has(shortName)) {
      // Only mark as stale if we have a calculated row count for this dataset
      if (calculatedRowCounts[shortName] !== undefined) {
        log.debug('Dataset stale', {
          shortName,
          reason: 'dataset_not_in_results',
        });
        return { isStale: true, reason: 'dataset_not_in_results' };
      }
    }

    // Case 1: No recalculation has been performed for this dataset yet
    if (!datasetSnapshot) {
      // Temporal enabled with valid values: stale (no utilization metrics available)
      if (currentConstraints.temporalEnabled) {
        const temporalConstraints = {
          enabled: true,
          ...currentConstraints.temporalRange,
        };
        if (isValidTemporalRange(temporalConstraints)) {
          log.debug('Dataset stale', { shortName, reason: 'temporal_enabled' });
          return { isStale: true, reason: 'temporal_enabled' };
        }
      }

      // Depth enabled with valid values: stale (no utilization metrics available)
      if (currentConstraints.depthEnabled) {
        const depthConstraints = {
          enabled: true,
          ...currentConstraints.depthRange,
        };
        if (isValidDepthRange(depthConstraints)) {
          log.debug('Dataset stale', { shortName, reason: 'depth_enabled' });
          return { isStale: true, reason: 'depth_enabled' };
        }
      }

      // Spatial-only: stale if partial coverage (< 1.0)
      if (datasetUtilization < 1.0) {
        log.debug('Dataset stale', { shortName, reason: 'spatial_partial' });
        return { isStale: true, reason: 'spatial_partial' };
      }

      // Full spatial coverage with no temporal/depth: not stale
      return { isStale: false, reason: null };
    }

    // Case 2: Dataset snapshot exists
    // First check if current constraints are valid
    // Invalid constraints can't make row counts stale (nothing to recalculate with)
    if (currentConstraints.temporalEnabled) {
      const temporalConstraints = {
        enabled: true,
        ...currentConstraints.temporalRange,
      };
      if (!isValidTemporalRange(temporalConstraints)) {
        return { isStale: false, reason: null };
      }
    }

    if (currentConstraints.depthEnabled) {
      const depthConstraints = {
        enabled: true,
        ...currentConstraints.depthRange,
      };
      if (!isValidDepthRange(depthConstraints)) {
        return { isStale: false, reason: null };
      }
    }

    // Now compare valid constraints against snapshot
    const constraintsMatch = areConstraintsEqual(
      currentConstraints,
      datasetSnapshot,
    );

    log.debug('Constraint equality check', {
      shortName,
      isEqual: constraintsMatch,
      current: currentConstraints,
      snapshot: datasetSnapshot,
    });

    if (!constraintsMatch) {
      log.debug('Dataset stale', { shortName, reason: 'constraints_changed' });
      return { isStale: true, reason: 'constraints_changed' };
    }

    // Constraints match dataset's snapshot: row count is still valid
    return { isStale: false, reason: null };
  },

  /**
   * Check if a dataset was skipped (cluster-only) during row count calculation.
   *
   * @param {string} shortName - Dataset identifier
   * @returns {boolean} True if dataset was skipped, false otherwise
   *
   * @example
   * const isSkipped = get().isDatasetSkipped('dataset_1');
   * // Returns true if dataset is cluster-only
   */
  isDatasetSkipped: (shortName) => {
    const { skippedDatasets } = get();
    return skippedDatasets.includes(shortName);
  },

  // ===========================================
  // Actions
  // ===========================================

  /**
   * Helper function that builds constraints object from current store state.
   * Used to get constraints from the spatialTemporalSearchStore.
   *
   * @returns {Object} Constraints object with all constraint fields
   */
  buildConstraintsFromStore: () => {
    const {
      spatialBounds,
      temporalRange,
      depthRange,
      temporalEnabled,
      depthEnabled,
      includePartialOverlaps,
    } = useSpatialTemporalSearchStore.getState();

    return {
      spatialBounds,
      temporalRange,
      depthRange,
      temporalEnabled,
      depthEnabled,
      includePartialOverlaps,
    };
  },

  /**
   * Calculate row counts for specific datasets.
   * Pure execution function - no staleness filtering.
   * Always stores per-dataset constraint snapshots for calculated datasets.
   *
   * Uses frontend estimation for eligible datasets (regular gridded, Darwin/PISCES depth).
   * Sends remaining datasets to backend for calculation in a single bulk request.
   *
   * @param {Array<Object>} datasets - Array of dataset objects with metadata
   * @param {Object} constraints - Constraint configuration
   * @param {Object} constraints.spatialBounds - Spatial bounds { latMin, latMax, lonMin, lonMax }
   * @param {Object} constraints.temporalRange - Temporal range { timeMin: Date|null, timeMax: Date|null }
   * @param {Object} constraints.depthRange - Depth range { depthMin: number|null, depthMax: number|null }
   * @param {boolean} constraints.temporalEnabled - Whether temporal constraints are active
   * @param {boolean} constraints.depthEnabled - Whether depth constraints are active
   * @param {boolean} constraints.includePartialOverlaps - Whether partial overlap mode is enabled
   * @param {Array<string>} skippedDatasets - Array of dataset short names that were skipped (satellite/model)
   * @returns {Promise<void>}
   */
  calculateRowCountsForDatasets: async (
    datasets,
    constraints,
    skippedDatasets = [],
  ) => {
    // Can't calculate if no datasets
    if (!datasets || datasets.length === 0) {
      set({
        calculatedRowCounts: {},
        skippedDatasets: skippedDatasets,
        failedRowCounts: [],
        rowCountsLoading: false,
        rowCountLoadingDatasets: new Set(),
      });
      return;
    }

    // Mark all datasets as loading
    const shortNames = datasets.map((d) => d.shortName);
    const loadingSet = new Set(shortNames);
    set({ rowCountLoadingDatasets: loadingSet });

    // Start loading
    set({ rowCountsLoading: true, rowCountError: null });

    try {
      // Get catalog database API for estimation
      const catalogDb = getSearchDatabaseApi();

      // Separate eligible vs non-eligible datasets
      const estimated = [];
      const needBackend = [];

      for (const dataset of datasets) {
        try {
          // Extract metadata fields (backend converts to camelCase before storing in SQLite)
          const spatialResolution = dataset.metadata.spatialResolution;
          const temporalResolution = dataset.metadata.temporalResolution;
          const tableName = dataset.metadata.tableName || dataset.shortName;

          // Check eligibility (pure, synchronous, fast)
          const eligible = isEligibleForEstimation(
            {
              spatialResolution,
              temporalResolution,
              tableName,
            },
            constraints,
          );

          if (eligible) {
            // Build dataset metadata object for estimation
            const datasetMetadata = {
              Spatial_Resolution: spatialResolution,
              Temporal_Resolution: temporalResolution,
              Table_Name: tableName,
            };

            // Estimate row count (async, uses catalogDb)
            const count = await estimateRowCount(
              datasetMetadata,
              constraints,
              catalogDb,
            );
            estimated.push({ shortName: dataset.shortName, rowCount: count });
            log.debug('estimated row count', {
              shortName: dataset.shortName,
              count,
            });
          } else {
            needBackend.push(dataset.shortName);
            log.debug('dataset not eligible for estimation, will use backend', {
              shortName: dataset.shortName,
            });
          }
        } catch (error) {
          // Estimation failed, fallback to backend
          log.error('estimation failed, falling back to backend', {
            shortName: dataset.shortName,
            error: error.message,
          });
          needBackend.push(dataset.shortName);
        }
      }

      // === PHASE 1: Apply estimated results immediately ===
      if (estimated.length > 0) {
        log.debug('applying estimated row counts immediately', {
          count: estimated.length,
        });

        // Build estimated row counts object
        const estimatedRowCounts = {};
        estimated.forEach((e) => {
          estimatedRowCounts[e.shortName] = e.rowCount;
        });

        // Build snapshots for estimated datasets
        const estimatedSnapshots = { ...get().datasetConstraintSnapshots };
        estimated.forEach((e) => {
          const snapshot = {
            spatialBounds: { ...constraints.spatialBounds },
            temporalRange: { ...constraints.temporalRange },
            depthRange: { ...constraints.depthRange },
            temporalEnabled: constraints.temporalEnabled,
            depthEnabled: constraints.depthEnabled,
            includePartialOverlaps: constraints.includePartialOverlaps,
            timestamp: new Date(),
          };
          estimatedSnapshots[e.shortName] = snapshot;
          log.debug('estimation snapshot captured', {
            shortName: e.shortName,
            snapshot,
          });
        });

        // Remove estimated datasets from loading set (they're done)
        const updatedLoadingSet = new Set(
          [...loadingSet].filter((name) => !estimated.some((e) => e.shortName === name)),
        );

        // Track which datasets were estimated (for purple label)
        const newEstimatedSet = new Set(get().estimatedRowCounts);
        estimated.forEach((e) => newEstimatedSet.add(e.shortName));

        // Apply estimated results immediately
        set({
          calculatedRowCounts: {
            ...get().calculatedRowCounts,
            ...estimatedRowCounts,
          },
          datasetConstraintSnapshots: estimatedSnapshots,
          estimatedRowCounts: newEstimatedSet,
          rowCountLoadingDatasets: updatedLoadingSet,
          // If no backend datasets, we're fully done
          rowCountsLoading: needBackend.length > 0,
        });
      }

      // === PHASE 2: Send backend request for non-eligible datasets (single bulk call) ===
      let data = { results: {}, skipped: [], failed: [] };

      if (needBackend.length > 0) {
        log.debug('sending backend request for non-eligible datasets', {
          count: needBackend.length,
        });

        // Build constraints object matching backend format
        const backendConstraints = {
          spatial: {
            latMin: constraints.spatialBounds.latMin,
            latMax: constraints.spatialBounds.latMax,
            lonMin: constraints.spatialBounds.lonMin,
            lonMax: constraints.spatialBounds.lonMax,
          },
        };

        if (
          constraints.temporalEnabled &&
          constraints.temporalRange.timeMin &&
          constraints.temporalRange.timeMax
        ) {
          backendConstraints.temporal = {
            startDate: constraints.temporalRange.timeMin
              .toISOString()
              .split('T')[0],
            endDate: constraints.temporalRange.timeMax
              .toISOString()
              .split('T')[0],
          };
        }

        if (
          constraints.depthEnabled &&
          constraints.depthRange.depthMin !== null &&
          constraints.depthRange.depthMax !== null
        ) {
          backendConstraints.spatial.depthMin = constraints.depthRange.depthMin;
          backendConstraints.spatial.depthMax = constraints.depthRange.depthMax;
        }

        const response = await collectionsAPI.calculateRowCounts(
          needBackend,
          backendConstraints,
        );

        if (!response.ok) {
          throw new Error('Failed to calculate row counts');
        }

        data = await response.json();
      }

      // Merge skipped datasets from frontend filter with any from backend
      // Backend returns array of shortNames for cluster-only datasets
      const backendSkipped = Array.isArray(data.skipped) ? data.skipped : [];
      const allSkippedDatasets = Array.from(
        new Set([...skippedDatasets, ...backendSkipped]),
      );

      // Store per-dataset snapshots for backend-calculated datasets only
      // (Estimated datasets already have snapshots from Phase 1)
      const backendSnapshots = { ...get().datasetConstraintSnapshots };
      Object.keys(data.results).forEach((shortName) => {
        // Only store snapshot if calculation was successful (not failed/skipped)
        if (
          !data.failed.includes(shortName) &&
          !allSkippedDatasets.includes(shortName)
        ) {
          const snapshot = {
            spatialBounds: { ...constraints.spatialBounds },
            temporalRange: { ...constraints.temporalRange },
            depthRange: { ...constraints.depthRange },
            temporalEnabled: constraints.temporalEnabled,
            depthEnabled: constraints.depthEnabled,
            includePartialOverlaps: constraints.includePartialOverlaps,
            timestamp: new Date(),
          };
          backendSnapshots[shortName] = snapshot;
          log.debug('recalculation snapshot captured', { shortName, snapshot });
        }
      });

      // Remove backend-recalculated datasets from estimatedRowCounts Set
      // (They were recalculated via backend, not estimated)
      const updatedEstimatedSet = new Set(get().estimatedRowCounts);
      Object.keys(data.results).forEach((shortName) => {
        updatedEstimatedSet.delete(shortName);
      });

      // State update with backend row counts only (estimated results already applied in Phase 1)
      set({
        calculatedRowCounts: { ...get().calculatedRowCounts, ...data.results },
        datasetConstraintSnapshots: backendSnapshots,
        estimatedRowCounts: updatedEstimatedSet,
        skippedDatasets: allSkippedDatasets,
        failedRowCounts: data.failed,
        rowCountsLoading: false,
        rowCountLoadingDatasets: new Set(),
      });
    } catch (error) {
      set({
        rowCountsLoading: false,
        rowCountLoadingDatasets: new Set(),
        rowCountError: error.message || 'Failed to calculate row counts',
      });
    }
  },

  /**
   * Calculate row counts for stale datasets only.
   * This is the "Recalculate All" action triggered from the table header button.
   * Sets hasUsedGlobalRecalculation flag to true.
   *
   * @param {Array<Object>} results - Array of dataset objects with type and shortName
   * @param {Object} constraints - Current constraint configuration (from buildConstraintsFromStore)
   * @returns {Promise<void>}
   */
  calculateRowCountsForStale: async (results, constraints) => {
    // Can't calculate if no results
    if (!results || results.length === 0) {
      return;
    }

    // Filter to only include stale datasets
    const staleDatasets = results.filter((dataset) => {
      const { isStale } = get().isDatasetStale(
        dataset.shortName,
        constraints,
        dataset.datasetUtilization,
        dataset.type,
      );
      return isStale;
    });

    // Delegate to calculateRowCountsForDatasets (per-dataset snapshots stored automatically)
    await get().calculateRowCountsForDatasets(staleDatasets, constraints);

    // Set global recalculation flag (consumed opportunity for "Recalculate All" button)
    set({ hasUsedGlobalRecalculation: true });
  },

  /**
   * Clear row count calculation results.
   * Called when a new search is performed.
   */
  clearRowCounts: () => {
    set({
      calculatedRowCounts: {},
      rowCountError: null,
      skippedDatasets: [],
      failedRowCounts: [],
      estimatedRowCounts: new Set(),
      rowCountLoadingDatasets: new Set(),
      datasetConstraintSnapshots: {},
      hasUsedGlobalRecalculation: false, // Reset for new search
    });
  },

  /**
   * Reset only the global recalculation flag without clearing calculated row counts.
   * Called when a new search is performed to make "Recalculate All" button reappear
   * while preserving existing calculated row count values.
   */
  resetGlobalRecalculation: () => {
    set({ hasUsedGlobalRecalculation: false });
  },

  /**
   * Store dataset IDs from the last successful search.
   * Used to detect when datasets are no longer in search results for staleness detection.
   *
   * @param {Array<string>} datasetIds - Array of dataset short names from search results
   */
  setLastSearchDatasetIds: (datasetIds) => {
    set({ lastSearchDatasetIds: new Set(datasetIds) });
  },
}));

export default useRowCountCalculationStore;
