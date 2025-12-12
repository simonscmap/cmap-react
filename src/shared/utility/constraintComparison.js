/**
 * Constraint Comparison Utility
 *
 * Provides deep equality checking for spatial-temporal constraint configurations.
 * Used to detect changes between current constraints and recalculation snapshots.
 */

/**
 * Performs deep equality check between current constraint configuration
 * and recalculation snapshot to detect changes that invalidate cached row counts.
 *
 * Comparison rules:
 * - Spatial bounds: Always compared (latMin, latMax, lonMin, lonMax)
 * - Boolean flags: Always compared (temporalEnabled, depthEnabled, includePartialOverlaps)
 * - Temporal range: Only compared when temporalEnabled is true in BOTH configurations
 * - Depth range: Only compared when depthEnabled is true in BOTH configurations
 * - Date objects: Compared by value using .getTime(), not by reference
 *
 * @param {Object} current - Current constraint configuration
 * @param {Object} current.spatialBounds - Current spatial bounds
 * @param {number} current.spatialBounds.latMin - Minimum latitude (-90 to 90)
 * @param {number} current.spatialBounds.latMax - Maximum latitude (-90 to 90)
 * @param {number} current.spatialBounds.lonMin - Minimum longitude (-180 to 180)
 * @param {number} current.spatialBounds.lonMax - Maximum longitude (-180 to 180)
 * @param {Object} current.temporalRange - Current temporal range
 * @param {Date|null} current.temporalRange.timeMin - Start date of temporal constraint
 * @param {Date|null} current.temporalRange.timeMax - End date of temporal constraint
 * @param {Object} current.depthRange - Current depth range
 * @param {number|null} current.depthRange.depthMin - Minimum depth in meters
 * @param {number|null} current.depthRange.depthMax - Maximum depth in meters
 * @param {boolean} current.temporalEnabled - Whether temporal constraints are active
 * @param {boolean} current.depthEnabled - Whether depth constraints are active
 * @param {boolean} current.includePartialOverlaps - Whether partial overlap mode is enabled
 *
 * @param {Object} snapshot - Recalculation snapshot configuration (same structure as current)
 *
 * @returns {boolean} - true if constraints are equal, false if different
 *
 * @example
 * const current = {
 *   spatialBounds: { latMin: 30, latMax: 35, lonMin: -65, lonMax: -60 },
 *   temporalRange: { timeMin: new Date('2020-01-01'), timeMax: new Date('2023-12-31') },
 *   depthRange: { depthMin: 0, depthMax: 100 },
 *   temporalEnabled: true,
 *   depthEnabled: true,
 *   includePartialOverlaps: false,
 * };
 *
 * const snapshot = {
 *   spatialBounds: { latMin: 30, latMax: 35, lonMin: -65, lonMax: -60 },
 *   temporalRange: { timeMin: new Date('2020-01-01'), timeMax: new Date('2023-12-31') },
 *   depthRange: { depthMin: 0, depthMax: 100 },
 *   temporalEnabled: true,
 *   depthEnabled: true,
 *   includePartialOverlaps: false,
 * };
 *
 * areConstraintsEqual(current, snapshot); // returns true
 */
export const areConstraintsEqual = (current, snapshot) => {
  // Step 1: Compare boolean flags (enabled states and overlap mode)
  if (current.temporalEnabled !== snapshot.temporalEnabled) {
    return false;
  }

  if (current.depthEnabled !== snapshot.depthEnabled) {
    return false;
  }

  if (current.includePartialOverlaps !== snapshot.includePartialOverlaps) {
    return false;
  }

  // Step 2: Compare spatial bounds (all 4 values)
  if (
    current.spatialBounds.latMin !== snapshot.spatialBounds.latMin ||
    current.spatialBounds.latMax !== snapshot.spatialBounds.latMax ||
    current.spatialBounds.lonMin !== snapshot.spatialBounds.lonMin ||
    current.spatialBounds.lonMax !== snapshot.spatialBounds.lonMax
  ) {
    return false;
  }

  // Step 3: Compare temporal range (only if enabled in BOTH)
  if (current.temporalEnabled && snapshot.temporalEnabled) {
    // Compare Date objects by value using .getTime()
    const currentTimeMin = current.temporalRange.timeMin
      ? current.temporalRange.timeMin.getTime()
      : null;
    const snapshotTimeMin = snapshot.temporalRange.timeMin
      ? snapshot.temporalRange.timeMin.getTime()
      : null;
    const currentTimeMax = current.temporalRange.timeMax
      ? current.temporalRange.timeMax.getTime()
      : null;
    const snapshotTimeMax = snapshot.temporalRange.timeMax
      ? snapshot.temporalRange.timeMax.getTime()
      : null;

    if (
      currentTimeMin !== snapshotTimeMin ||
      currentTimeMax !== snapshotTimeMax
    ) {
      return false;
    }
  }

  // Step 4: Compare depth range (only if enabled in BOTH)
  if (current.depthEnabled && snapshot.depthEnabled) {
    if (
      current.depthRange.depthMin !== snapshot.depthRange.depthMin ||
      current.depthRange.depthMax !== snapshot.depthRange.depthMax
    ) {
      return false;
    }
  }

  // Step 5: All comparisons passed - constraints are equal
  return true;
};
