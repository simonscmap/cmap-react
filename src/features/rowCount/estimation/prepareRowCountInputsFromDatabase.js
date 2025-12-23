/**
 * Prepare Row Count Inputs From Database
 *
 * Async function that resolves all database values needed for row count math.
 * Resolves resolution strings to numeric values and fetches depth model info.
 */

import {
  querySpatialResolutionMapping,
  queryTemporalResolutionMapping,
  queryDatasetDepthModel,
  queryDepthCount,
} from './queryEstimationTables';

/**
 * Prepares all inputs needed for row count math by querying the catalog database.
 * Resolves resolution strings to numeric values and fetches depth model info.
 *
 * @param {Object} datasetMetadata - Dataset metadata
 * @param {string} datasetMetadata.shortName - Dataset short name (for depth model lookup)
 * @param {string} datasetMetadata.spatialResolution - Spatial resolution string (e.g., "1/2° X 1/2°")
 * @param {string} datasetMetadata.temporalResolution - Temporal resolution string (e.g., "Weekly")
 * @param {number} datasetMetadata.latMin - Dataset minimum latitude
 * @param {number} datasetMetadata.latMax - Dataset maximum latitude
 * @param {number} datasetMetadata.lonMin - Dataset minimum longitude
 * @param {number} datasetMetadata.lonMax - Dataset maximum longitude
 * @param {string} datasetMetadata.timeMin - Dataset minimum time
 * @param {string} datasetMetadata.timeMax - Dataset maximum time
 * @param {number} datasetMetadata.depthMin - Dataset minimum depth
 * @param {number} datasetMetadata.depthMax - Dataset maximum depth
 * @param {boolean} datasetMetadata.hasDepth - Whether dataset has depth data
 * @param {number} datasetMetadata.tableCount - Number of tables (default 1)
 * @param {Object} catalogDb - SQLite catalog database (SearchDatabaseApi instance)
 * @returns {Promise<Object>} Resolved inputs for row count math
 *
 * @typedef {Object} ResolvedInputs
 * @property {string} shortName - Dataset short name
 * @property {string} spatialResolution - Original spatial resolution string
 * @property {string} temporalResolution - Original temporal resolution string
 * @property {Object} spatialBounds - { latMin, latMax, lonMin, lonMax }
 * @property {Object} temporalBounds - { timeMin, timeMax }
 * @property {Object} depthBounds - { depthMin, depthMax }
 * @property {Object} resolutions - Resolved numeric resolution values
 * @property {number} resolutions.spatialDegrees - Spatial resolution in degrees
 * @property {number|null} resolutions.temporalSeconds - Temporal resolution in seconds
 * @property {number} resolutions.temporalDays - Temporal resolution in days
 * @property {boolean} resolutions.isMonthlyClimatology - Whether dataset is monthly climatology
 * @property {Object} depthModel - Depth model info
 * @property {string|null} depthModel.model - Depth model name ('darwin', 'pisces', 'woa', or null)
 * @property {number} depthModel.totalLevels - Total depth levels in model
 * @property {boolean} hasDepth - Whether dataset has depth data
 * @property {number} tableCount - Number of tables
 */
async function prepareRowCountInputsFromDatabase(datasetMetadata, catalogDb) {
  const {
    shortName,
    spatialResolution,
    temporalResolution,
    latMin,
    latMax,
    lonMin,
    lonMax,
    timeMin,
    timeMax,
    depthMin,
    depthMax,
    hasDepth,
    tableCount,
  } = datasetMetadata;

  // Query resolution mappings from database
  const spatialMapping = await querySpatialResolutionMapping(
    catalogDb,
    spatialResolution,
  );
  const temporalMapping = await queryTemporalResolutionMapping(
    catalogDb,
    temporalResolution,
  );

  if (!spatialMapping || spatialMapping.value === null) {
    throw new Error(
      `Spatial resolution mapping not found: ${spatialResolution}`,
    );
  }

  const isMonthlyClimatology = temporalResolution === 'Monthly Climatology';

  if (
    !isMonthlyClimatology &&
    (!temporalMapping || temporalMapping.value === null)
  ) {
    throw new Error(
      `Temporal resolution mapping not found: ${temporalResolution}`,
    );
  }

  // Calculate temporal resolution in days
  const temporalSeconds = isMonthlyClimatology ? null : temporalMapping.value;
  const temporalDays = isMonthlyClimatology ? 0 : temporalMapping.value / 86400;

  // Query depth model if dataset has depth
  let depthModel = null;
  let totalDepthLevels = 1;

  if (hasDepth) {
    depthModel = await queryDatasetDepthModel(catalogDb, shortName);
    if (depthModel) {
      // Get total depth levels for this model
      totalDepthLevels = await queryDepthCount(catalogDb, depthModel);
    }
  }

  return {
    shortName,
    spatialResolution,
    temporalResolution,
    spatialBounds: { latMin, latMax, lonMin, lonMax },
    temporalBounds: { timeMin, timeMax },
    depthBounds: { depthMin, depthMax },
    resolutions: {
      spatialDegrees: spatialMapping.value,
      temporalSeconds,
      temporalDays,
      isMonthlyClimatology,
    },
    depthModel: {
      model: depthModel,
      totalLevels: totalDepthLevels,
    },
    hasDepth: hasDepth || false,
    tableCount: tableCount || 1,
  };
}

export default prepareRowCountInputsFromDatabase;
