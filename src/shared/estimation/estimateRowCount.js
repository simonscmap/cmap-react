/**
 * Frontend Row Count Estimation
 *
 * Pure calculation functions for estimating dataset row counts based on
 * spatial, temporal, and depth constraints. Replicates logic from the legacy
 * estimateDataSize.js but adapted for Collections feature.
 *
 * IMPORTANT: The calling function must check eligibility BEFORE calling estimateRowCount.
 * Use isEligibleForEstimation() to determine if a dataset can be estimated.
 *
 * Key differences from legacy estimateDataSize.js:
 * - No /200 division (Collections doesn't use visualization types)
 * - Works with SQLite resolution mappings instead of hardcoded enums
 * - Uses pure functions for calculations (testable, maintainable)
 */

import logInit from '../../Services/log-service';
import {
  querySpatialResolutionMapping,
  queryTemporalResolutionMapping,
  queryDatasetDepthModel,
  queryDarwinDepthCount,
  queryPiscesDepthCount,
} from './queryEstimationTables';

const log = logInit('shared/estimation/estimateRowCount');

/**
 * Calculate spatial grid cell count (pure function).
 *
 * Handles longitude wraparound when lon2 < lon1 (date line crossing).
 *
 * @param {Object} constraints - Store constraints object
 * @param {Object} constraints.spatialBounds - Spatial bounds { latMin, latMax, lonMin, lonMax }
 * @param {number} spatialResolutionDegrees - Spatial resolution in degrees
 * @returns {{ latCount: number, lonCount: number }} Grid cell counts
 */
function calculateSpatialCount(constraints, spatialResolutionDegrees) {
  const { latMin, latMax, lonMin, lonMax } = constraints.spatialBounds;

  const latCount = (latMax - latMin) / spatialResolutionDegrees;

  // Handle longitude wraparound (date line crossing)
  const lonCount =
    lonMax > lonMin
      ? (lonMax - lonMin) / spatialResolutionDegrees
      : (180 - lonMin + (lonMax + 180)) / spatialResolutionDegrees;

  return { latCount, lonCount };
}

/**
 * Calculate month count for Monthly Climatology datasets (pure function).
 *
 * Infers the number of months based on the date range:
 * - If range >= 12 months, all 12 months are covered
 * - Otherwise, counts the specific months from start to end
 *
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Number of months (1-12)
 */
function calculateMonthlyClimatologyCount(startDate, endDate) {
  const startMonth = startDate.getMonth(); // 0-11
  const endMonth = endDate.getMonth();
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  // Total months from start to end (inclusive)
  const totalMonthSpan =
    (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

  // If >= 12 months, all 12 are covered
  if (totalMonthSpan >= 12) {
    return 12;
  }

  return totalMonthSpan;
}

/**
 * Calculate temporal count with Monthly Climatology support (pure function).
 *
 * Applies 1.4x multiplier for SQL indexing weight (origin unknown, preserved from legacy).
 *
 * @param {Object} constraints - Store constraints object
 * @param {Object} constraints.temporalRange - Temporal range { timeMin, timeMax }
 * @param {number} temporalResolutionDays - Temporal resolution in days
 * @param {boolean} isMonthlyClimatology - Whether dataset uses Monthly Climatology
 * @returns {number} Temporal count (with 1.4x multiplier applied)
 */
function calculateTemporalCount(
  constraints,
  temporalResolutionDays,
  isMonthlyClimatology,
) {
  const date1 = new Date(constraints.temporalRange.timeMin);
  const date2 = new Date(constraints.temporalRange.timeMax);

  let dateCount;

  if (isMonthlyClimatology) {
    // Monthly Climatology: infer months from date range
    // If range >= 1 year, all 12 months are covered
    // Otherwise, count the specific months from start to end
    dateCount = calculateMonthlyClimatologyCount(date1, date2);
  } else {
    // Regular temporal resolution: count intervals
    const dayDiff = (date2 - date1) / 86400000; // milliseconds to days
    dateCount = Math.floor(dayDiff / temporalResolutionDays) || 1;
  }

  // Apply SQL indexing weight (1.4x multiplier)
  // Origin unknown, but preserved from legacy estimateDataSize.js
  dateCount *= 1.4;

  return dateCount;
}

/**
 * Main estimation orchestrator (not pure, async).
 *
 * Combines spatial, temporal, and depth calculations to estimate row count.
 * Queries SQLite catalog database for resolution mappings and depth models.
 *
 * IMPORTANT: Call isEligibleForEstimation() BEFORE calling this function.
 * This function assumes all inputs are valid for estimation.
 *
 * @param {Object} datasetMetadata - Dataset metadata
 * @param {string} datasetMetadata.Spatial_Resolution - Spatial resolution (e.g., "1/2° X 1/2°")
 * @param {string} datasetMetadata.Temporal_Resolution - Temporal resolution (e.g., "Weekly")
 * @param {string} datasetMetadata.Table_Name - Dataset table name
 * @param {Object} constraints - Store constraints object
 * @param {Object} constraints.spatialBounds - Spatial bounds { latMin, latMax, lonMin, lonMax }
 * @param {boolean} constraints.temporalEnabled - Whether temporal constraints are enabled
 * @param {Object} constraints.temporalRange - Temporal range { timeMin, timeMax }
 * @param {boolean} constraints.depthEnabled - Whether depth constraints are enabled
 * @param {Object} constraints.depthRange - Depth range { depthMin, depthMax }
 * @param {Object} catalogDb - SQLite catalog database API instance
 * @returns {Promise<number>} Estimated row count
 * @throws {Error} If resolution mappings not found or database queries fail
 */
async function estimateRowCount(datasetMetadata, constraints, catalogDb) {
  try {
    log.debug('starting row count estimation', {
      dataset: datasetMetadata.Table_Name,
      spatialResolution: datasetMetadata.Spatial_Resolution,
      temporalResolution: datasetMetadata.Temporal_Resolution,
      constraints,
    });

    // Step 1: Query resolution mappings from SQLite
    const spatialMapping = await querySpatialResolutionMapping(
      catalogDb,
      datasetMetadata.Spatial_Resolution,
    );
    const temporalMapping = await queryTemporalResolutionMapping(
      catalogDb,
      datasetMetadata.Temporal_Resolution,
    );

    if (!spatialMapping || spatialMapping.value === null) {
      throw new Error(
        `Spatial resolution mapping not found: ${datasetMetadata.Spatial_Resolution}`,
      );
    }

    // Temporal mapping can be null for Monthly Climatology (handled below)
    const isMonthlyClimatology =
      datasetMetadata.Temporal_Resolution === 'Monthly Climatology';

    if (
      !isMonthlyClimatology &&
      (!temporalMapping || temporalMapping.value === null)
    ) {
      throw new Error(
        `Temporal resolution mapping not found: ${datasetMetadata.Temporal_Resolution}`,
      );
    }

    // Step 2: Calculate spatial count (pure function)
    const { latCount, lonCount } = calculateSpatialCount(
      constraints,
      spatialMapping.value,
    );

    // Step 3: Calculate temporal count (pure function)
    // Convert temporal resolution from seconds to days
    const temporalResolutionDays = isMonthlyClimatology
      ? 0 // Not used for Monthly Climatology
      : temporalMapping.value / 86400; // seconds to days

    const dateCount = calculateTemporalCount(
      constraints,
      temporalResolutionDays,
      isMonthlyClimatology,
    );

    // Step 4: Calculate depth count (async, queries database)
    let depthCount = 1; // Default: no depth dimension

    const hasDepthConstraints =
      constraints.depthEnabled &&
      constraints.depthRange.depthMin !== null &&
      constraints.depthRange.depthMax !== null;

    if (hasDepthConstraints) {
      const depthModel = await queryDatasetDepthModel(
        catalogDb,
        datasetMetadata.Table_Name,
      );

      if (depthModel === 'darwin') {
        depthCount = await queryDarwinDepthCount(
          catalogDb,
          constraints.depthRange.depthMin,
          constraints.depthRange.depthMax,
        );
      } else if (depthModel === 'pisces') {
        depthCount = await queryPiscesDepthCount(
          catalogDb,
          constraints.depthRange.depthMin,
          constraints.depthRange.depthMax,
        );
      }
      // If depthModel is null (not Darwin/PISCES), depthCount stays 1
    }

    // Step 5: Combine counts to estimate total row count
    const pointCount = lonCount * latCount * depthCount * dateCount;

    log.debug('row count estimation complete', {
      dataset: datasetMetadata.Table_Name,
      latCount,
      lonCount,
      dateCount,
      depthCount,
      pointCount,
    });

    return Math.round(pointCount);
  } catch (error) {
    log.error('row count estimation failed', {
      dataset: datasetMetadata.Table_Name,
      error: error.message,
    });
    throw error;
  }
}

export default estimateRowCount;
