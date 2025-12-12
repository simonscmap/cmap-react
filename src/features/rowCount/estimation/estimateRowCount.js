/**
 * Frontend Row Count Estimation
 *
 * Pure calculation functions for estimating dataset row counts based on
 * spatial, temporal, and depth constraints.
 *
 * IMPORTANT: Call isEligibleForEstimation() before calling estimateRowCount.
 */

import logInit from '../../../Services/log-service';
import {
  querySpatialResolutionMapping,
  queryTemporalResolutionMapping,
  queryDatasetDepthModel,
  queryDepthCount,
} from './queryEstimationTables';

const log = logInit('rowCount/estimation/estimateRowCount');

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Clamp query spatial bounds to dataset coverage. Returns null if no overlap.
 */
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

/**
 * Clamp query depth range to dataset coverage. Returns null if no overlap.
 */
function clampDepthRange(queryRange, datasetRange) {
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
  constraints,
  spatialResolutionDegrees,
  datasetLatMin,
  datasetLonMin,
) {
  const { latMin, latMax, lonMin, lonMax } = constraints.spatialBounds;

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
  constraints,
  temporalResolutionDays,
  isMonthlyClimatology,
  datasetTimeMin,
) {
  const date1 = new Date(constraints.temporalRange.timeMin);
  const date2 = new Date(constraints.temporalRange.timeMax);

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
 * Combines spatial, temporal, and depth calculations to estimate row count.
 * Queries SQLite catalog database for resolution mappings and depth models.
 *
 * @param {Object} datasetMetadata - Dataset metadata
 * @param {string} datasetMetadata.spatialResolution - Spatial resolution (e.g., "1/2° X 1/2°")
 * @param {string} datasetMetadata.temporalResolution - Temporal resolution (e.g., "Weekly")
 * @param {string} datasetMetadata.tableName - Dataset table name
 * @param {string} datasetMetadata.shortName - Dataset short name (for depth model lookup)
 * @param {boolean} datasetMetadata.hasDepth - Whether dataset has depth data
 * @param {Object} constraints - Store constraints object
 * @param {Object} constraints.spatialBounds - Spatial bounds { latMin, latMax, lonMin, lonMax }
 * @param {boolean} constraints.temporalEnabled - Whether temporal constraints are enabled
 * @param {Object} constraints.temporalRange - Temporal range { timeMin, timeMax }
 * @param {boolean} constraints.depthEnabled - Whether depth constraints are enabled
 * @param {Object} constraints.depthRange - Depth range { depthMin, depthMax }
 * @param {Object} catalogDb - SQLite catalog database
 */
async function estimateRowCount(datasetMetadata, constraints, catalogDb) {
  let result = null;
  let error = null;

  try {
    const datasetSpatialBounds = {
      latMin: datasetMetadata.latMin,
      latMax: datasetMetadata.latMax,
      lonMin: datasetMetadata.lonMin,
      lonMax: datasetMetadata.lonMax,
    };

    const hasDatasetSpatialBounds =
      datasetSpatialBounds.latMin !== null &&
      datasetSpatialBounds.latMin !== undefined &&
      datasetSpatialBounds.latMax !== null &&
      datasetSpatialBounds.latMax !== undefined;

    let effectiveConstraints = constraints;

    if (hasDatasetSpatialBounds) {
      const clampedSpatial = clampSpatialBounds(
        constraints.spatialBounds,
        datasetSpatialBounds,
      );

      if (clampedSpatial === null) {
        return 0;
      }

      effectiveConstraints = {
        ...constraints,
        spatialBounds: clampedSpatial,
      };
    }

    const hasTemporalConstraints =
      constraints.temporalEnabled &&
      constraints.temporalRange.timeMin &&
      constraints.temporalRange.timeMax;

    const hasDatasetTemporalBounds =
      datasetMetadata.timeMin && datasetMetadata.timeMax;

    if (hasTemporalConstraints && hasDatasetTemporalBounds) {
      const clampedTemporal = clampTemporalRange(constraints.temporalRange, {
        timeMin: datasetMetadata.timeMin,
        timeMax: datasetMetadata.timeMax,
      });

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

    const hasDepthConstraints =
      constraints.depthEnabled &&
      constraints.depthRange.depthMin !== null &&
      constraints.depthRange.depthMax !== null;

    const hasDatasetDepthBounds =
      datasetMetadata.depthMin !== null &&
      datasetMetadata.depthMin !== undefined &&
      datasetMetadata.depthMax !== null &&
      datasetMetadata.depthMax !== undefined;

    if (hasDepthConstraints && hasDatasetDepthBounds) {
      const clampedDepth = clampDepthRange(constraints.depthRange, {
        depthMin: datasetMetadata.depthMin,
        depthMax: datasetMetadata.depthMax,
      });

      if (clampedDepth === null) {
        return 0;
      }

      effectiveConstraints = {
        ...effectiveConstraints,
        depthRange: clampedDepth,
      };
    }

    const spatialMapping = await querySpatialResolutionMapping(
      catalogDb,
      datasetMetadata.spatialResolution,
    );
    const temporalMapping = await queryTemporalResolutionMapping(
      catalogDb,
      datasetMetadata.temporalResolution,
    );

    if (!spatialMapping || spatialMapping.value === null) {
      throw new Error(
        `Spatial resolution mapping not found: ${datasetMetadata.spatialResolution}`,
      );
    }

    const isMonthlyClimatology =
      datasetMetadata.temporalResolution === 'Monthly Climatology';

    if (
      !isMonthlyClimatology &&
      (!temporalMapping || temporalMapping.value === null)
    ) {
      throw new Error(
        `Temporal resolution mapping not found: ${datasetMetadata.temporalResolution}`,
      );
    }

    const { latCount, lonCount } = calculateSpatialCount(
      effectiveConstraints,
      spatialMapping.value,
      datasetMetadata.latMin,
      datasetMetadata.lonMin,
    );

    let dateCount = 1;

    const temporalResolutionDays = isMonthlyClimatology
      ? 0
      : temporalMapping.value / 86400;

    if (hasTemporalConstraints) {
      dateCount = calculateTemporalCount(
        effectiveConstraints,
        temporalResolutionDays,
        isMonthlyClimatology,
        datasetMetadata.timeMin,
      );
    } else if (isMonthlyClimatology) {
      dateCount = 12;
    } else if (datasetMetadata.timeMin && datasetMetadata.timeMax) {
      const datasetTemporalRange = {
        temporalRange: {
          timeMin: datasetMetadata.timeMin,
          timeMax: datasetMetadata.timeMax,
        },
      };
      dateCount = calculateTemporalCount(
        datasetTemporalRange,
        temporalResolutionDays,
        false,
        datasetMetadata.timeMin,
      );
    }

    let depthCount = 1;

    if (datasetMetadata.hasDepth) {
      const depthModel = await queryDatasetDepthModel(
        catalogDb,
        datasetMetadata.shortName,
      );

      if (depthModel) {
        if (hasDepthConstraints) {
          depthCount = await queryDepthCount(
            catalogDb,
            depthModel,
            effectiveConstraints.depthRange.depthMin,
            effectiveConstraints.depthRange.depthMax,
          );
        } else {
          depthCount = await queryDepthCount(catalogDb, depthModel);
        }
      }
    }

    const tableCount = datasetMetadata.tableCount || 1;
    const pointCount =
      lonCount * latCount * depthCount * dateCount * tableCount;

    result = Math.round(pointCount);
    return result;
  } catch (err) {
    error = err.message;
    throw err;
  } finally {
    if (result !== null || error !== null) {
      (error ? log.error : log.debug)('row count estimation', {
        datasetName: datasetMetadata.shortName,
        datasetTable: datasetMetadata.tableName,
        status: error ? 'error' : 'success',
        spatialRes: datasetMetadata.spatialResolution,
        temporalRes: datasetMetadata.temporalResolution,
        hasDepth: datasetMetadata.hasDepth,
        constraints,
        estimatedRows: result,
        ...(error && { error }),
      });
    }
  }
}

export default estimateRowCount;
