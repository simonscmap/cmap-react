/**
 * Pure Row Count Math
 *
 * Performs row count calculation using pre-resolved inputs.
 * No database access - all values must be numeric and resolved.
 *
 * Contains pure, synchronous calculation functions for:
 * - Spatial grid cell counting
 * - Temporal data point counting
 * - Constraint clamping to dataset bounds
 */

/**
 * Clamp a value between min and max bounds.
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Clamp query spatial bounds to dataset coverage. Returns null if no overlap.
 */
export function clampSpatialBounds(queryBounds, datasetBounds) {
  if (
    queryBounds.latMin > datasetBounds.latMax ||
    queryBounds.latMax < datasetBounds.latMin ||
    queryBounds.lonMin > datasetBounds.lonMax ||
    queryBounds.lonMax < datasetBounds.lonMin
  ) {
    return null;
  }

  return {
    latMin: clamp(
      queryBounds.latMin,
      datasetBounds.latMin,
      datasetBounds.latMax,
    ),
    latMax: clamp(
      queryBounds.latMax,
      datasetBounds.latMin,
      datasetBounds.latMax,
    ),
    lonMin: clamp(
      queryBounds.lonMin,
      datasetBounds.lonMin,
      datasetBounds.lonMax,
    ),
    lonMax: clamp(
      queryBounds.lonMax,
      datasetBounds.lonMin,
      datasetBounds.lonMax,
    ),
  };
}

/**
 * Clamp query temporal range to dataset coverage. Returns null if no overlap.
 */
export function clampTemporalRange(queryRange, datasetRange) {
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

/**
 * Clamp query depth range to dataset coverage. Returns null if no overlap.
 */
export function clampDepthRange(queryRange, datasetRange) {
  if (
    queryRange.depthMin > datasetRange.depthMax ||
    queryRange.depthMax < datasetRange.depthMin
  ) {
    return null;
  }

  return {
    depthMin: clamp(
      queryRange.depthMin,
      datasetRange.depthMin,
      datasetRange.depthMax,
    ),
    depthMax: clamp(
      queryRange.depthMax,
      datasetRange.depthMin,
      datasetRange.depthMax,
    ),
  };
}

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
 * Calculate spatial grid cell count. Handles date line crossing.
 */
function calculateSpatialCount(
  spatialBounds,
  spatialResolutionDegrees,
  datasetLatMin,
  datasetLonMin,
) {
  const { latMin, latMax, lonMin, lonMax } = spatialBounds;

  const effectiveLonMin =
    datasetLonMin !== null && datasetLonMin !== undefined
      ? datasetLonMin
      : datasetLatMin;

  const latCount = countSpatialDataPoints(
    latMin,
    latMax,
    datasetLatMin,
    spatialResolutionDegrees,
  );

  let lonCount;
  if (lonMax > lonMin) {
    lonCount = countSpatialDataPoints(
      lonMin,
      lonMax,
      effectiveLonMin,
      spatialResolutionDegrees,
    );
  } else {
    // Date line crossing
    const countToDateLine = countSpatialDataPoints(
      lonMin,
      180,
      effectiveLonMin,
      spatialResolutionDegrees,
    );
    const countFromDateLine = countSpatialDataPoints(
      -180,
      lonMax,
      effectiveLonMin,
      spatialResolutionDegrees,
    );
    lonCount = countToDateLine + countFromDateLine;
  }

  return { latCount, lonCount };
}

/**
 * Count calendar months between two dates.
 */
function calculateMonthlyCount(startDate, endDate) {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();

  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
}

/**
 * Count months for Monthly Climatology (capped at 12).
 */
function calculateMonthlyClimatologyCount(startDate, endDate) {
  return Math.min(12, calculateMonthlyCount(startDate, endDate));
}

/**
 * Count data points for multi-day resolution datasets (3-day, weekly, 8-day).
 * Finds first point >= queryStart and last point <= queryEnd, returns inclusive count.
 */
function countWeeklyDataPoints(
  queryStart,
  queryEnd,
  datasetMin,
  resolutionDays,
) {
  const daysToQueryMin = (queryStart - datasetMin) / 86400000;
  const daysToQueryMax = (queryEnd - datasetMin) / 86400000;
  const firstPointIndex = Math.ceil(daysToQueryMin / resolutionDays);
  const lastPointIndex = Math.floor(daysToQueryMax / resolutionDays);
  const count = lastPointIndex - firstPointIndex + 1;
  return count < 1 ? 1 : count;
}

/**
 * Calculate temporal data point count based on resolution type.
 */
function calculateTemporalCount(
  temporalRange,
  temporalResolutionDays,
  isMonthlyClimatology,
  datasetTimeMin,
) {
  const date1 = new Date(temporalRange.timeMin);
  const date2 = new Date(temporalRange.timeMax);

  let dateCount;

  if (isMonthlyClimatology) {
    dateCount = calculateMonthlyClimatologyCount(date1, date2);
  } else if (temporalResolutionDays === 30) {
    dateCount = calculateMonthlyCount(date1, date2);
  } else {
    const dayDiff = (date2 - date1) / 86400000;
    const inclusiveDays = dayDiff + 1;

    // Multi-day resolutions need anchor-based counting
    const needsTemporalAnchor =
      temporalResolutionDays === 3 ||
      temporalResolutionDays === 7 ||
      temporalResolutionDays === 8;

    if (needsTemporalAnchor && datasetTimeMin) {
      dateCount = countWeeklyDataPoints(
        date1,
        date2,
        new Date(datasetTimeMin),
        temporalResolutionDays,
      );
    } else {
      dateCount = Math.ceil(inclusiveDays / temporalResolutionDays);
    }
  }

  return Math.max(1, dateCount);
}

/**
 * Performs pure row count calculation using pre-resolved inputs.
 * No database access - all values must be numeric and resolved.
 *
 * @param {Object} resolvedInputs - Pre-resolved dataset inputs
 * @param {Object} resolvedInputs.spatialBounds - Dataset spatial bounds
 * @param {Object} resolvedInputs.temporalBounds - Dataset temporal bounds
 * @param {Object} resolvedInputs.depthBounds - Dataset depth bounds
 * @param {Object} resolvedInputs.resolutions - Resolved resolution values
 * @param {number} resolvedInputs.resolutions.spatialDegrees - Spatial resolution in degrees
 * @param {number} resolvedInputs.resolutions.temporalDays - Temporal resolution in days
 * @param {boolean} resolvedInputs.resolutions.isMonthlyClimatology - Whether dataset is monthly climatology
 * @param {boolean} resolvedInputs.hasDepth - Whether dataset has depth data
 * @param {number} resolvedInputs.tableCount - Number of tables (default 1)
 * @param {Object} constraints - Store constraints object
 * @param {Object} constraints.spatialBounds - Spatial bounds { latMin, latMax, lonMin, lonMax }
 * @param {boolean} constraints.temporalEnabled - Whether temporal constraints are enabled
 * @param {Object} constraints.temporalRange - Temporal range { timeMin, timeMax }
 * @param {boolean} constraints.depthEnabled - Whether depth constraints are enabled
 * @param {Object} constraints.depthRange - Depth range { depthMin, depthMax }
 * @param {number} depthCountInRange - Number of depth levels in constrained range (default 1)
 * @returns {number} Estimated row count
 */
function performRowCountMath(resolvedInputs, constraints, depthCountInRange) {
  const {
    spatialBounds: datasetSpatialBounds,
    temporalBounds: datasetTemporalBounds,
    depthBounds: datasetDepthBounds,
    resolutions,
    hasDepth,
    tableCount,
  } = resolvedInputs;

  const { spatialDegrees, temporalDays, isMonthlyClimatology } = resolutions;

  // Start with the query constraints
  let effectiveConstraints = { ...constraints };

  // Clamp spatial bounds to dataset coverage
  const hasDatasetSpatialBounds =
    datasetSpatialBounds.latMin !== null &&
    datasetSpatialBounds.latMin !== undefined &&
    datasetSpatialBounds.latMax !== null &&
    datasetSpatialBounds.latMax !== undefined;

  if (hasDatasetSpatialBounds) {
    const clampedSpatial = clampSpatialBounds(
      constraints.spatialBounds,
      datasetSpatialBounds,
    );

    if (clampedSpatial === null) {
      return 0;
    }

    effectiveConstraints = {
      ...effectiveConstraints,
      spatialBounds: clampedSpatial,
    };
  }

  // Clamp temporal range to dataset coverage
  const hasTemporalConstraints =
    constraints.temporalEnabled &&
    constraints.temporalRange.timeMin &&
    constraints.temporalRange.timeMax;

  const hasDatasetTemporalBounds =
    datasetTemporalBounds.timeMin && datasetTemporalBounds.timeMax;

  if (hasTemporalConstraints && hasDatasetTemporalBounds) {
    const clampedTemporal = clampTemporalRange(
      constraints.temporalRange,
      datasetTemporalBounds,
    );

    if (clampedTemporal === null) {
      return 0;
    }

    effectiveConstraints = {
      ...effectiveConstraints,
      temporalRange: {
        timeMin: clampedTemporal.timeMin.toISOString(),
        timeMax: clampedTemporal.timeMax.toISOString(),
      },
    };
  }

  // Clamp depth range to dataset coverage
  const hasDepthConstraints =
    constraints.depthEnabled &&
    constraints.depthRange.depthMin !== null &&
    constraints.depthRange.depthMax !== null;

  const hasDatasetDepthBounds =
    datasetDepthBounds.depthMin !== null &&
    datasetDepthBounds.depthMin !== undefined &&
    datasetDepthBounds.depthMax !== null &&
    datasetDepthBounds.depthMax !== undefined;

  if (hasDepthConstraints && hasDatasetDepthBounds) {
    const clampedDepth = clampDepthRange(
      constraints.depthRange,
      datasetDepthBounds,
    );

    if (clampedDepth === null) {
      return 0;
    }

    effectiveConstraints = {
      ...effectiveConstraints,
      depthRange: clampedDepth,
    };
  }

  // Calculate spatial count
  const { latCount, lonCount } = calculateSpatialCount(
    effectiveConstraints.spatialBounds,
    spatialDegrees,
    datasetSpatialBounds.latMin,
    datasetSpatialBounds.lonMin,
  );

  // Calculate temporal count
  let dateCount = 1;

  if (hasTemporalConstraints) {
    dateCount = calculateTemporalCount(
      effectiveConstraints.temporalRange,
      temporalDays,
      isMonthlyClimatology,
      datasetTemporalBounds.timeMin,
    );
  } else if (isMonthlyClimatology) {
    dateCount = 12;
  } else if (hasDatasetTemporalBounds) {
    const datasetTemporalRange = {
      timeMin: datasetTemporalBounds.timeMin,
      timeMax: datasetTemporalBounds.timeMax,
    };
    dateCount = calculateTemporalCount(
      datasetTemporalRange,
      temporalDays,
      false,
      datasetTemporalBounds.timeMin,
    );
  }

  // Calculate depth count
  let depthCount = 1;
  if (hasDepth && depthCountInRange > 0) {
    depthCount = depthCountInRange;
  }

  // Calculate final row count
  const effectiveTableCount = tableCount || 1;
  const pointCount =
    lonCount * latCount * depthCount * dateCount * effectiveTableCount;

  return Math.round(pointCount);
}

export default performRowCountMath;
