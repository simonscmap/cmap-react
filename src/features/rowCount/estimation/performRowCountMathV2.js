/**
 * Row Count Estimation v2 - Strategy Selection Pattern
 *
 * Calculates estimated row count by independently resolving each dimension:
 * - Spatial (lat/lon) - handles date line crossing
 * - Temporal - selects strategy based on resolution type
 * - Depth - uses depth model levels
 *
 * Each resolver is a decision tree that selects the appropriate
 * calculation strategy based on dataset metadata. This design is:
 * - Idempotent: no mutation, no shared state
 * - Order-independent: dimensions calculated independently
 * - Self-documenting: resolvers read as decision trees
 * - Extensible: new strategy = new condition + new function
 */

// ============ UTILITIES ============

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ============ BOUNDS CLAMPING ============

function clampSpatialBounds(queryBounds, datasetBounds) {
  if (
    queryBounds.latMin > datasetBounds.latMax ||
    queryBounds.latMax < datasetBounds.latMin ||
    queryBounds.lonMin > datasetBounds.lonMax ||
    queryBounds.lonMax < datasetBounds.lonMin
  ) {
    return null;
  }

  return {
    latMin: clamp(queryBounds.latMin, datasetBounds.latMin, datasetBounds.latMax),
    latMax: clamp(queryBounds.latMax, datasetBounds.latMin, datasetBounds.latMax),
    lonMin: clamp(queryBounds.lonMin, datasetBounds.lonMin, datasetBounds.lonMax),
    lonMax: clamp(queryBounds.lonMax, datasetBounds.lonMin, datasetBounds.lonMax),
  };
}

function clampTemporalRange(queryRange, datasetRange) {
  const queryMin = new Date(queryRange.timeMin);
  const queryMax = new Date(queryRange.timeMax);
  const datasetMin = new Date(datasetRange.timeMin);
  const datasetMax = new Date(datasetRange.timeMax);

  if (queryMin > datasetMax || queryMax < datasetMin) {
    return null;
  }

  return {
    timeMin: new Date(Math.max(queryMin.getTime(), datasetMin.getTime())),
    timeMax: new Date(Math.min(queryMax.getTime(), datasetMax.getTime())),
  };
}

function clampDepthRange(queryRange, datasetRange) {
  if (
    queryRange.depthMin > datasetRange.depthMax ||
    queryRange.depthMax < datasetRange.depthMin
  ) {
    return null;
  }

  return {
    depthMin: clamp(queryRange.depthMin, datasetRange.depthMin, datasetRange.depthMax),
    depthMax: clamp(queryRange.depthMax, datasetRange.depthMin, datasetRange.depthMax),
  };
}

/**
 * Clamp all constraint bounds to dataset coverage.
 * Returns effective constraints or null if no overlap.
 */
function clampAllBounds(inputs, constraints) {
  const { spatialBounds: dsBounds, temporalBounds: dsTemporal, depthBounds: dsDepth } = inputs;
  let effective = { ...constraints };

  // Spatial clamping
  const hasDatasetSpatialBounds =
    dsBounds.latMin !== null && dsBounds.latMin !== undefined &&
    dsBounds.latMax !== null && dsBounds.latMax !== undefined;

  if (hasDatasetSpatialBounds) {
    const clampedSpatial = clampSpatialBounds(constraints.spatialBounds, dsBounds);
    if (clampedSpatial === null) return null;
    effective.spatialBounds = clampedSpatial;
  }

  // Temporal clamping
  const hasTemporalConstraints =
    constraints.temporalEnabled &&
    constraints.temporalRange.timeMin &&
    constraints.temporalRange.timeMax;

  const hasDatasetTemporalBounds = dsTemporal.timeMin && dsTemporal.timeMax;

  if (hasTemporalConstraints && hasDatasetTemporalBounds) {
    const clampedTemporal = clampTemporalRange(constraints.temporalRange, dsTemporal);
    if (clampedTemporal === null) return null;
    effective.temporalRange = {
      timeMin: clampedTemporal.timeMin.toISOString(),
      timeMax: clampedTemporal.timeMax.toISOString(),
    };
  }

  // Depth clamping
  const hasDepthConstraints =
    constraints.depthEnabled &&
    constraints.depthRange.depthMin !== null &&
    constraints.depthRange.depthMax !== null;

  const hasDatasetDepthBounds =
    dsDepth.depthMin !== null && dsDepth.depthMin !== undefined &&
    dsDepth.depthMax !== null && dsDepth.depthMax !== undefined;

  if (hasDepthConstraints && hasDatasetDepthBounds) {
    const clampedDepth = clampDepthRange(constraints.depthRange, dsDepth);
    if (clampedDepth === null) return null;
    effective.depthRange = clampedDepth;
  }

  return effective;
}

// ============ SPATIAL RESOLUTION ============

/**
 * Count data points within a query range for a single spatial dimension.
 * Finds first point >= queryMin and last point <= queryMax, returns inclusive count.
 */
function countSpatialDataPoints(queryMin, queryMax, datasetMin, resolution) {
  const offsetToQueryMin = queryMin - datasetMin;
  const offsetToQueryMax = queryMax - datasetMin;
  const firstPointIndex = Math.ceil(offsetToQueryMin / resolution);
  const lastPointIndex = Math.floor(offsetToQueryMax / resolution);
  const count = lastPointIndex - firstPointIndex + 1;
  return count < 1 ? 1 : count;
}

/**
 * Resolve latitude count.
 * Strategy: Simple grid point counting based on resolution.
 */
function resolveLatCount(inputs, effective) {
  const { spatialBounds: dsBounds, resolutions } = inputs;
  const { latMin, latMax } = effective.spatialBounds;

  return countSpatialDataPoints(latMin, latMax, dsBounds.latMin, resolutions.spatialDegrees);
}

/**
 * Resolve longitude count.
 * Decision tree:
 * 1. Date line crossing (lonMax < lonMin) -> split calculation
 * 2. Default -> simple grid point counting
 */
function resolveLonCount(inputs, effective) {
  const { spatialBounds: dsBounds, resolutions } = inputs;
  const { lonMin, lonMax } = effective.spatialBounds;

  const effectiveLonMin =
    dsBounds.lonMin !== null && dsBounds.lonMin !== undefined
      ? dsBounds.lonMin
      : dsBounds.latMin;

  // Strategy: Date line crossing
  if (lonMax < lonMin) {
    const countToDateLine = countSpatialDataPoints(lonMin, 180, effectiveLonMin, resolutions.spatialDegrees);
    const countFromDateLine = countSpatialDataPoints(-180, lonMax, effectiveLonMin, resolutions.spatialDegrees);
    return countToDateLine + countFromDateLine;
  }

  // Strategy: Default
  return countSpatialDataPoints(lonMin, lonMax, effectiveLonMin, resolutions.spatialDegrees);
}

// ============ TEMPORAL RESOLUTION ============

/**
 * Strategy: Monthly Climatology
 * Counts calendar months, capped at 12.
 */
function calculateClimatologyCount(startDate, endDate) {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();
  const monthCount = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  return Math.min(12, monthCount);
}

/**
 * Strategy: Monthly Resolution
 * Counts calendar months between dates.
 */
function calculateMonthlyCount(startDate, endDate) {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();
  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
}

/**
 * Strategy: Anchored Multi-day Resolution (3-day, weekly, 8-day)
 * Finds first point >= queryStart and last point <= queryEnd using dataset start as anchor.
 */
function calculateAnchoredCount(startDate, endDate, datasetStartDate, resolutionDays) {
  const datasetMin = new Date(datasetStartDate);
  const daysToQueryMin = (startDate - datasetMin) / 86400000;
  const daysToQueryMax = (endDate - datasetMin) / 86400000;
  const firstPointIndex = Math.ceil(daysToQueryMin / resolutionDays);
  const lastPointIndex = Math.floor(daysToQueryMax / resolutionDays);
  const count = lastPointIndex - firstPointIndex + 1;
  return count < 1 ? 1 : count;
}

/**
 * Strategy: Simple Day Division
 * Divides day span by resolution.
 */
function calculateSimpleTemporalCount(startDate, endDate, resolutionDays) {
  const dayDiff = (endDate - startDate) / 86400000;
  const inclusiveDays = dayDiff + 1;
  return Math.ceil(inclusiveDays / resolutionDays);
}

/**
 * Resolve temporal count.
 * Decision tree (first match wins):
 * 1. Monthly Climatology -> capped at 12
 * 2. Monthly (30-day) -> calendar month counting
 * 3. Multi-day (3/7/8-day) -> anchor-based counting
 * 4. Default -> simple day division
 */
function resolveTemporalCount(inputs, effective) {
  const { resolutions, temporalBounds: dsTemporal } = inputs;
  const { temporalDays, isMonthlyClimatology } = resolutions;

  const hasTemporalConstraints =
    effective.temporalEnabled &&
    effective.temporalRange.timeMin &&
    effective.temporalRange.timeMax;

  // No constraints: use dataset full range or climatology default
  if (!hasTemporalConstraints) {
    if (isMonthlyClimatology) return 12;
    if (dsTemporal.timeMin && dsTemporal.timeMax) {
      const date1 = new Date(dsTemporal.timeMin);
      const date2 = new Date(dsTemporal.timeMax);
      // Use same decision tree for full dataset range
      if (temporalDays === 30) return calculateMonthlyCount(date1, date2);
      if ([3, 7, 8].includes(temporalDays)) {
        return calculateAnchoredCount(date1, date2, dsTemporal.timeMin, temporalDays);
      }
      return calculateSimpleTemporalCount(date1, date2, temporalDays);
    }
    return 1;
  }

  // With constraints: apply decision tree
  const date1 = new Date(effective.temporalRange.timeMin);
  const date2 = new Date(effective.temporalRange.timeMax);

  // Strategy 1: Monthly Climatology
  if (isMonthlyClimatology) {
    return calculateClimatologyCount(date1, date2);
  }

  // Strategy 2: Monthly Resolution
  if (temporalDays === 30) {
    return calculateMonthlyCount(date1, date2);
  }

  // Strategy 3: Anchored Multi-day Resolution
  if ([3, 7, 8].includes(temporalDays) && dsTemporal.timeMin) {
    return calculateAnchoredCount(date1, date2, dsTemporal.timeMin, temporalDays);
  }

  // Strategy 4: Default
  return Math.max(1, calculateSimpleTemporalCount(date1, date2, temporalDays));
}

// ============ DEPTH RESOLUTION ============

/**
 * Resolve depth count.
 * Strategy: Use provided depth count in range, or 1 if no depth.
 */
function resolveDepthCount(inputs) {
  if (!inputs.hasDepth) return 1;
  if (inputs.depthCountInRange > 0) return inputs.depthCountInRange;
  return 1;
}

// ============ ORCHESTRATOR ============

/**
 * Row Count Estimation v2 - Strategy Selection Pattern
 *
 * Orchestrates dimension resolvers to calculate estimated row count.
 * Each resolver independently determines its count based on metadata.
 *
 * @param {Object} resolvedInputs - Pre-resolved dataset inputs
 * @param {Object} constraints - Store constraints object
 * @returns {number} Estimated row count
 */
function performRowCountMathV2(resolvedInputs, constraints) {
  // Clamp all bounds to dataset coverage
  const effective = clampAllBounds(resolvedInputs, constraints);
  if (!effective) return 0;

  // Resolve each dimension independently
  const latCount = resolveLatCount(resolvedInputs, effective);
  const lonCount = resolveLonCount(resolvedInputs, effective);
  const temporalCount = resolveTemporalCount(resolvedInputs, effective);
  const depthCount = resolveDepthCount(resolvedInputs);

  // Final calculation
  const tableCount = resolvedInputs.tableCount || 1;
  return Math.round(latCount * lonCount * temporalCount * depthCount * tableCount);
}

export default performRowCountMathV2;
