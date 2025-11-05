/**
 * Spatial-Temporal Result Transformer
 *
 * Transforms raw catalog search results into enhanced dataset objects with overlap metrics.
 * Enriches base dataset data with calculated coverage percentages and formatted overlap ranges
 * based on user-defined constraints.
 *
 * Note: Catalog search API returns temporal data as ISO strings (from SQLite database).
 * This transformer converts ISO strings to Date objects for use throughout the feature layer.
 */

import {
  formatSpatialExtent,
  formatTemporalRange,
  formatDepthRange,
} from './overlapFormatter.js';

/**
 * Convert ISO 8601 date string to Date object.
 * Helper function to convert catalog search API results (ISO strings) to Date objects
 * for use throughout the spatial-temporal feature layer.
 *
 * @param {string} isoString - ISO 8601 date string (YYYY-MM-DD)
 * @returns {Date} Date object
 * @private
 */
const parseISODate = (isoString) => {
  return new Date(isoString);
};

/**
 * Detect if a dataset has Monthly Climatology temporal resolution.
 *
 * Monthly Climatology datasets represent averaged data across multiple years for each month,
 * making them applicable to any temporal constraint (always 100% temporal coverage).
 *
 * @param {Object} dataset - Raw dataset with metadata
 * @param {Object} dataset.metadata - Parsed metadata object from database
 * @param {string} [dataset.metadata.temporalResolution] - Temporal resolution field
 * @param {boolean} [dataset.metadata.isClimatology] - Explicit climatology flag
 * @returns {boolean} True if dataset is Monthly Climatology
 *
 * @example
 * const dataset = {
 *   shortName: 'WOA_2018_Temperature',
 *   metadata: { temporalResolution: 'Monthly Climatology' }
 * };
 * const isClim = isClimatologyDataset(dataset);
 * // Returns true
 *
 * @example
 * const dataset = {
 *   shortName: 'HOT_LAVA',
 *   metadata: { temporalResolution: 'Daily' }
 * };
 * const isClim = isClimatologyDataset(dataset);
 * // Returns false
 */
export function isClimatologyDataset(dataset) {
  // Handle missing or invalid dataset
  if (!dataset || !dataset.metadata) {
    return false;
  }

  const metadata = dataset.metadata;

  // Check for explicit climatology flag
  if (metadata.isClimatology === true) {
    return true;
  }

  // Check for 'Monthly Climatology' in temporalResolution field
  if (
    metadata.temporalResolution &&
    typeof metadata.temporalResolution === 'string'
  ) {
    const resolution = metadata.temporalResolution.toLowerCase();
    if (
      resolution.includes('climatology') ||
      resolution.includes('monthly climatology')
    ) {
      return true;
    }
  }

  // Default: not a climatology dataset
  return false;
}

/**
 * Calculate the intersection rectangle of user bounds and dataset bounds.
 *
 * Computes the overlapping spatial region between user-defined bounding box
 * and dataset coverage area. This intersection is used for calculating spatial
 * coverage percentages and formatting extent displays.
 *
 * @param {Object} userBounds - User-defined bounding box
 * @param {number} userBounds.latMin - Minimum latitude (-90 to 90)
 * @param {number} userBounds.latMax - Maximum latitude (-90 to 90)
 * @param {number} userBounds.lonMin - Minimum longitude (-180 to 180)
 * @param {number} userBounds.lonMax - Maximum longitude (-180 to 180)
 * @param {Object} datasetBounds - Dataset spatial coverage
 * @param {number} datasetBounds.latMin - Dataset minimum latitude
 * @param {number} datasetBounds.latMax - Dataset maximum latitude
 * @param {number} datasetBounds.lonMin - Dataset minimum longitude
 * @param {number} datasetBounds.lonMax - Dataset maximum longitude
 * @returns {Object} Intersection bounds { latMin, latMax, lonMin, lonMax }
 *
 * @example
 * const userBounds = { latMin: 65, latMax: 80, lonMin: -80, lonMax: -50 };
 * const datasetBounds = { latMin: 68, latMax: 74, lonMin: -75, lonMax: -55 };
 * const intersection = calculateIntersectionBounds(userBounds, datasetBounds);
 * // Returns { latMin: 68, latMax: 74, lonMin: -75, lonMax: -55 }
 *
 * @example
 * const userBounds = { latMin: 20, latMax: 24, lonMin: -160, lonMax: -155 };
 * const datasetBounds = { latMin: 20.5, latMax: 23.0, lonMin: -158.5, lonMax: -156.0 };
 * const intersection = calculateIntersectionBounds(userBounds, datasetBounds);
 * // Returns { latMin: 20.5, latMax: 23.0, lonMin: -158.5, lonMax: -156.0 }
 */
export function calculateIntersectionBounds(userBounds, datasetBounds) {
  return {
    latMin: Math.max(userBounds.latMin, datasetBounds.latMin),
    latMax: Math.min(userBounds.latMax, datasetBounds.latMax),
    lonMin: Math.max(userBounds.lonMin, datasetBounds.lonMin),
    lonMax: Math.min(userBounds.lonMax, datasetBounds.lonMax),
  };
}

/**
 * Calculate the intersection period of user range and dataset range.
 *
 * Computes the overlapping temporal period between user-defined date range
 * and dataset temporal coverage. Uses Date object comparison.
 * This intersection is used for calculating temporal coverage percentages and
 * formatting range displays.
 *
 * @param {Object} userRange - User-defined temporal range
 * @param {Date} userRange.timeMin - Minimum date (Date object)
 * @param {Date} userRange.timeMax - Maximum date (Date object)
 * @param {Object} datasetRange - Dataset temporal coverage
 * @param {Date} datasetRange.timeMin - Dataset minimum date (Date object)
 * @param {Date} datasetRange.timeMax - Dataset maximum date (Date object)
 * @returns {Object} Intersection period { timeMin: Date, timeMax: Date }
 *
 * @example
 * const userRange = { timeMin: new Date("2015-01-01"), timeMax: new Date("2025-12-31") };
 * const datasetRange = { timeMin: new Date("2020-03-01"), timeMax: new Date("2023-09-30") };
 * const intersection = calculateIntersectionPeriod(userRange, datasetRange);
 * // Returns { timeMin: Date(2020-03-01), timeMax: Date(2023-09-30) }
 *
 * @example
 * const userRange = { timeMin: new Date("2010-01-01"), timeMax: new Date("2020-12-31") };
 * const datasetRange = { timeMin: new Date("2005-01-01"), timeMax: new Date("2025-12-31") };
 * const intersection = calculateIntersectionPeriod(userRange, datasetRange);
 * // Returns { timeMin: Date(2010-01-01), timeMax: Date(2020-12-31) }
 */
export function calculateIntersectionPeriod(userRange, datasetRange) {
  // Use Date comparison - compare timestamps directly
  return {
    timeMin:
      userRange.timeMin > datasetRange.timeMin
        ? userRange.timeMin
        : datasetRange.timeMin,
    timeMax:
      userRange.timeMax < datasetRange.timeMax
        ? userRange.timeMax
        : datasetRange.timeMax,
  };
}

/**
 * Calculate the intersection depth range of user range and dataset range.
 *
 * Computes the overlapping depth range between user-defined depth constraints
 * and dataset depth coverage. Handles datasets without depth data (NULL depth)
 * by returning null. This intersection is used for calculating depth coverage
 * percentages and formatting range displays.
 *
 * @param {Object} userRange - User-defined depth range
 * @param {number} userRange.depthMin - Minimum depth in meters (>= 0)
 * @param {number} userRange.depthMax - Maximum depth in meters (>= depthMin)
 * @param {Object|null} datasetRange - Dataset depth coverage or null if no depth data
 * @param {number} [datasetRange.depthMin] - Dataset minimum depth in meters
 * @param {number} [datasetRange.depthMax] - Dataset maximum depth in meters
 * @returns {Object|null} Intersection range { depthMin, depthMax } or null if dataset has no depth
 *
 * @example
 * const userRange = { depthMin: 0, depthMax: 1000 };
 * const datasetRange = { depthMin: 0, depthMax: 5000 };
 * const intersection = calculateIntersectionRange(userRange, datasetRange);
 * // Returns { depthMin: 0, depthMax: 1000 }
 *
 * @example
 * const userRange = { depthMin: 100, depthMax: 500 };
 * const datasetRange = { depthMin: 0, depthMax: 300 };
 * const intersection = calculateIntersectionRange(userRange, datasetRange);
 * // Returns { depthMin: 100, depthMax: 300 }
 *
 * @example
 * const userRange = { depthMin: 0, depthMax: 1000 };
 * const datasetRange = null;  // Dataset has no depth data
 * const intersection = calculateIntersectionRange(userRange, datasetRange);
 * // Returns null
 */
export function calculateIntersectionRange(userRange, datasetRange) {
  // Handle NULL depth case - dataset has no depth data
  if (datasetRange === null) {
    return null;
  }

  // Calculate intersection using Math.max for minimum and Math.min for maximum
  return {
    depthMin: Math.max(userRange.depthMin, datasetRange.depthMin),
    depthMax: Math.min(userRange.depthMax, datasetRange.depthMax),
  };
}

/**
 * Enhance a raw catalog search result with overlap metrics for spatial, temporal, and depth dimensions.
 *
 * Transforms raw dataset from catalog search into an enhanced object with calculated coverage
 * percentages and formatted overlap ranges based on user-defined constraints. This function
 * enriches base dataset data with overlap field containing metrics for each dimension.
 *
 * @param {Object} rawDataset - Raw dataset from catalog search API (output of transformSearchResult)
 * @param {number} rawDataset.datasetId - Unique dataset identifier
 * @param {string} rawDataset.shortName - Dataset short name (e.g., "HOT_LAVA")
 * @param {string} rawDataset.longName - Dataset full name
 * @param {string} rawDataset.description - Dataset description
 * @param {string} rawDataset.type - Dataset type (e.g., "In-Situ", "Satellite", "Model")
 * @param {string[]} rawDataset.regions - Geographic regions
 * @param {Object} rawDataset.spatial - Spatial extent
 * @param {number} rawDataset.spatial.latMin - Minimum latitude
 * @param {number} rawDataset.spatial.latMax - Maximum latitude
 * @param {number} rawDataset.spatial.lonMin - Minimum longitude
 * @param {number} rawDataset.spatial.lonMax - Maximum longitude
 * @param {Object} rawDataset.temporal - Temporal extent
 * @param {Date} rawDataset.temporal.timeMin - Start date (Date object)
 * @param {Date} rawDataset.temporal.timeMax - End date (Date object)
 * @param {Object|null} rawDataset.depth - Depth extent or null if no depth data
 * @param {number} [rawDataset.depth.depthMin] - Minimum depth in meters
 * @param {number} [rawDataset.depth.depthMax] - Maximum depth in meters
 * @param {Object} rawDataset.metadata - Dataset metadata (includes temporalResolution, etc.)
 * @param {number} rawDataset.rowCount - Number of data rows
 * @param {Object} userConstraints - User-defined search constraints
 * @param {Object} userConstraints.spatial - User's spatial bounds (required)
 * @param {number} userConstraints.spatial.latMin - User minimum latitude (-90 to 90)
 * @param {number} userConstraints.spatial.latMax - User maximum latitude (-90 to 90)
 * @param {number} userConstraints.spatial.lonMin - User minimum longitude (-180 to 180)
 * @param {number} userConstraints.spatial.lonMax - User maximum longitude (-180 to 180)
 * @param {Object|null} userConstraints.temporal - User's temporal range (null if disabled)
 * @param {Date} [userConstraints.temporal.timeMin] - User start date (Date object)
 * @param {Date} [userConstraints.temporal.timeMax] - User end date (Date object)
 * @param {Object|null} userConstraints.depth - User's depth range (null if disabled)
 * @param {number} [userConstraints.depth.depthMin] - User minimum depth in meters
 * @param {number} [userConstraints.depth.depthMax] - User maximum depth in meters
 * @returns {Object} Enhanced dataset with overlap field
 *
 * @example
 * const rawDataset = {
 *   datasetId: 123,
 *   shortName: "HOT_LAVA",
 *   longName: "Hawaii Ocean Time-series LAVA Cruise",
 *   type: "In-Situ",
 *   spatial: { latMin: 20.5, latMax: 23.0, lonMin: -158.5, lonMax: -156.0 },
 *   temporal: { timeMin: new Date("2010-01-01"), timeMax: new Date("2020-12-31") },
 *   depth: { depthMin: 0, depthMax: 5000 },
 *   metadata: { temporalResolution: "Daily" },
 *   // ... other fields
 * };
 *
 * const userConstraints = {
 *   spatial: { latMin: 20, latMax: 24, lonMin: -160, lonMax: -155 },
 *   temporal: { timeMin: new Date("2015-01-01"), timeMax: new Date("2020-12-31") },
 *   depth: null  // Depth constraints not enabled
 * };
 *
 * const enhanced = transformSpatialTemporalResult(rawDataset, userConstraints);
 * // Returns dataset with overlap.spatial and overlap.temporal, but no overlap.depth
 * // enhanced.overlap = {
 * //   spatial: { coveragePercent: 80, extent: "20.5°N-23°N, 158.5°W-156°W" },
 * //   temporal: { coveragePercent: 70, range: "2015-01-01 to 2020-12-31" }
 * // }
 */
export function transformSpatialTemporalResult(rawDataset, userConstraints) {
  // Convert raw dataset temporal ISO strings to Date objects
  // (Catalog search API returns ISO strings from SQLite database)
  const datasetWithDates = {
    ...rawDataset,
    temporal: {
      timeMin: parseISODate(rawDataset.temporal.timeMin),
      timeMax: parseISODate(rawDataset.temporal.timeMax),
    },
  };

  // Initialize the overlap object that will be added to the dataset
  const overlap = {};

  // 1. Calculate spatial overlap (always required)
  try {
    // Use SQL-calculated coverage value (already computed in database query)
    const spatialCoveragePercent = rawDataset.spatial_coverage || 0;

    // Calculate intersection bounds for formatting extent string
    const intersectionBounds = calculateIntersectionBounds(
      userConstraints.spatial,
      rawDataset.spatial,
    );

    // Format spatial extent string
    const spatialExtent = formatSpatialExtent(intersectionBounds);

    // Diagnostic logging for zero-area datasets
    const datasetArea =
      (rawDataset.spatial.latMax - rawDataset.spatial.latMin) *
      (rawDataset.spatial.lonMax - rawDataset.spatial.lonMin);
    const isZeroArea = datasetArea === 0;

    if (isZeroArea) {
      console.log('[SpatialTemporalTransformer] Zero-area dataset detected:', {
        shortName: rawDataset.shortName,
        spatial: rawDataset.spatial,
        userConstraints: userConstraints.spatial,
        spatialCoverageFromSQL: spatialCoveragePercent,
        datasetUtilization: rawDataset.dataset_utilization,
        intersectionBounds,
        isPoint:
          rawDataset.spatial.latMin === rawDataset.spatial.latMax &&
          rawDataset.spatial.lonMin === rawDataset.spatial.lonMax,
        isWithinBounds:
          rawDataset.spatial.latMin >= userConstraints.spatial.latMin &&
          rawDataset.spatial.latMax <= userConstraints.spatial.latMax &&
          rawDataset.spatial.lonMin >= userConstraints.spatial.lonMin &&
          rawDataset.spatial.lonMax <= userConstraints.spatial.lonMax,
      });
    }

    // Add spatial overlap to result
    overlap.spatial = {
      coveragePercent: spatialCoveragePercent,
      extent: spatialExtent,
    };
  } catch (error) {
    // Graceful degradation: log error but provide default values
    console.error('Error calculating spatial overlap:', error);
    overlap.spatial = {
      coveragePercent: 0,
      extent: '',
    };
  }

  // 2. Calculate temporal overlap (only if temporal constraints enabled)
  if (userConstraints.temporal !== null) {
    try {
      // Use SQL-calculated coverage value (already computed in database query)
      const temporalCoveragePercent = rawDataset.temporal_coverage || 0;

      // Detect if dataset is Monthly Climatology
      const isClimatology = isClimatologyDataset(datasetWithDates);

      // Calculate intersection period for formatting range string
      const intersectionPeriod = calculateIntersectionPeriod(
        userConstraints.temporal,
        datasetWithDates.temporal,
      );

      // Format temporal range string (Date objects)
      // Climatology datasets show 'Monthly Climatology' instead of date range since they apply to all time periods
      const temporalRange = isClimatology
        ? 'Monthly Climatology'
        : formatTemporalRange(intersectionPeriod);

      // Add temporal overlap to result
      overlap.temporal = {
        coveragePercent: temporalCoveragePercent,
        range: temporalRange,
      };
    } catch (error) {
      // Graceful degradation: log error but provide default values
      console.error('Error calculating temporal overlap:', error);
      overlap.temporal = {
        coveragePercent: 0,
        range: 'N/A',
      };
    }
  }

  // 3. Calculate depth overlap (only if depth constraints enabled)
  if (userConstraints.depth !== null) {
    try {
      // Use SQL-calculated coverage value (already computed in database query)
      // SQL returns null for datasets with no depth data
      const depthCoveragePercent =
        rawDataset.depth_coverage !== null ? rawDataset.depth_coverage : 'N/A';

      // Calculate intersection range for formatting range string
      const intersectionRange = calculateIntersectionRange(
        userConstraints.depth,
        rawDataset.depth,
      );

      // Format depth range string (returns "N/A" if intersectionRange is null)
      const depthRange = formatDepthRange(intersectionRange);

      // Add depth overlap to result
      overlap.depth = {
        coveragePercent: depthCoveragePercent,
        range: depthRange,
      };
    } catch (error) {
      // Graceful degradation: log error but provide default values
      console.error('Error calculating depth overlap:', error);
      overlap.depth = {
        coveragePercent: 'N/A',
        range: 'N/A',
      };
    }
  }

  // 4. Return enhanced dataset with overlap field
  // Use datasetWithDates (which has Date objects) and add overlap metrics
  // Map rowCount to rows for UI compatibility
  return {
    ...datasetWithDates,
    overlap,
    rows: rawDataset.rowCount || 0,
    // TEMPORARY: Dataset utilization field - will be deleted later
    datasetUtilization: rawDataset.dataset_utilization || 0,
  };
}

/**
 * Transform an array of raw catalog search results in bulk.
 *
 * Applies spatial-temporal overlap transformation to multiple datasets simultaneously.
 * Maps over the array and calls transformSpatialTemporalResult for each dataset with
 * the same user constraints. This is the primary function used by the Zustand store's
 * search action to process search results.
 *
 * @param {Array<Object>} rawResults - Array of raw datasets from catalog search API
 * @param {Object} userConstraints - User-defined search constraints (same structure as transformSpatialTemporalResult)
 * @param {Object} userConstraints.spatial - User's spatial bounds (required)
 * @param {Object|null} userConstraints.temporal - User's temporal range (null if disabled)
 * @param {Object|null} userConstraints.depth - User's depth range (null if disabled)
 * @returns {Array<Object>} Array of enhanced datasets with overlap metrics
 *
 * @example
 * const rawResults = [
 *   { datasetId: 123, shortName: "HOT_LAVA", spatial: {...}, temporal: {...}, depth: {...}, ... },
 *   { datasetId: 456, shortName: "ARGO", spatial: {...}, temporal: {...}, depth: {...}, ... },
 *   { datasetId: 789, shortName: "WOA_2018", spatial: {...}, temporal: {...}, depth: null, ... }
 * ];
 *
 * const userConstraints = {
 *   spatial: { latMin: 20, latMax: 40, lonMin: -160, lonMax: -120 },
 *   temporal: { timeMin: new Date("2015-01-01"), timeMax: new Date("2020-12-31") },
 *   depth: { depthMin: 0, depthMax: 1000 }
 * };
 *
 * const enhanced = transformSpatialTemporalResults(rawResults, userConstraints);
 * // Returns [enhancedDataset1, enhancedDataset2, enhancedDataset3]
 * // Each dataset has overlap.spatial, overlap.temporal, and overlap.depth fields
 *
 * @example
 * // Spatial-only search (temporal and depth constraints disabled)
 * const userConstraints = {
 *   spatial: { latMin: 65, latMax: 80, lonMin: -80, lonMax: -50 },
 *   temporal: null,
 *   depth: null
 * };
 *
 * const enhanced = transformSpatialTemporalResults(rawResults, userConstraints);
 * // Each dataset has only overlap.spatial field
 */
export function transformSpatialTemporalResults(rawResults, userConstraints) {
  // Handle invalid input - return empty array
  if (!Array.isArray(rawResults)) {
    console.error(
      'transformSpatialTemporalResults: rawResults must be an array',
    );
    return [];
  }

  // Map over array and transform each dataset
  // Filter out any transformation errors to prevent one bad dataset from breaking entire result set
  return rawResults
    .map((dataset) => {
      try {
        return transformSpatialTemporalResult(dataset, userConstraints);
      } catch (error) {
        // Log error for debugging but continue with other datasets
        console.error(
          `Error transforming dataset ${dataset.datasetId || 'unknown'}:`,
          error,
        );
        return null; // Mark for filtering
      }
    })
    .filter((dataset) => dataset !== null); // Remove failed transformations
}
