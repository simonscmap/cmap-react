/**
 * Search Result Transformation
 *
 * Transforms raw database rows from SQLite worker into UI-facing format.
 * Handles data normalization, type conversion, and field aliasing.
 */

/**
 * Parse comma-separated regions string into array
 * @param {string|null} regionsString - Comma-separated region names
 * @returns {string[]} Array of region names (empty array if null/empty)
 * @private
 */
const parseRegions = (regionsString) => {
  if (!regionsString || typeof regionsString !== 'string') {
    return [];
  }
  return regionsString
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);
};

/**
 * Transform a single raw database row into UI-facing dataset format
 *
 * @param {Object} row - Raw database row from SQLite worker
 * @param {number} row.datasetId - Database ID
 * @param {string} row.shortName - Dataset short name
 * @param {string} row.longName - Dataset long name
 * @param {string} row.description - Dataset description
 * @param {string} row.datasetType - Dataset type (Model, Satellite, In-Situ)
 * @param {string} row.regions - Comma-separated region names
 * @param {number} row.latMin - Minimum latitude
 * @param {number} row.latMax - Maximum latitude
 * @param {number} row.lonMin - Minimum longitude
 * @param {number} row.lonMax - Maximum longitude
 * @param {string} row.timeMin - Minimum time (ISO string)
 * @param {string} row.timeMax - Maximum time (ISO string)
 * @param {number} row.depthMin - Minimum depth
 * @param {number} row.depthMax - Maximum depth
 * @param {number} row.rowCount - Number of data rows
 * @param {number} row.rank - Search ranking score (0 for LIKE mode)
 * @param {string} row.metadataJson - JSON string of additional metadata
 * @returns {Object} Transformed dataset object for UI consumption
 *
 * @example
 * const rawRow = {
 *   datasetId: 123,
 *   shortName: 'HOT_LAVA',
 *   longName: 'Hawaii Ocean Time-series LAVA Cruise',
 *   description: 'Temperature and salinity measurements...',
 *   datasetType: 'In-Situ',
 *   regions: 'North Pacific,Hawaii',
 *   latMin: 20.5,
 *   latMax: 23.0,
 *   lonMin: -158.5,
 *   lonMax: -156.0,
 *   timeMin: '2010-01-01',
 *   timeMax: '2020-12-31',
 *   depthMin: 0,
 *   depthMax: 5000,
 *   rowCount: 50000,
 *   rank: 0,
 *   metadataJson: '{"pi":"Dr. Smith","institution":"UH"}'
 * };
 *
 * const transformed = transformSearchResult(rawRow);
 * // Returns:
 * // {
 * //   datasetId: 123,
 * //   shortName: 'HOT_LAVA',
 * //   longName: 'Hawaii Ocean Time-series LAVA Cruise',
 * //   description: 'Temperature and salinity measurements...',
 * //   type: 'In-Situ',
 * //   regions: ['North Pacific', 'Hawaii'],
 * //   spatial: { latMin: 20.5, latMax: 23.0, lonMin: -158.5, lonMax: -156.0 },
 * //   temporal: { timeMin: '2010-01-01', timeMax: '2020-12-31' },
 * //   timeStart: '2010-01-01',
 * //   timeEnd: '2020-12-31',
 * //   depth: { depthMin: 0, depthMax: 5000 },
 * //   rowCount: 50000,
 * //   rank: 0,
 * //   metadata: { pi: 'Dr. Smith', institution: 'UH' },
 * //   isInvalid: false
 * // }
 */
export const transformSearchResult = (row) => {
  // Parse metadata JSON if present
  let metadata = {};
  if (row.metadataJson) {
    try {
      metadata = JSON.parse(row.metadataJson);
    } catch (error) {
      console.warn(
        '[transformSearchResult] Failed to parse metadataJson:',
        error,
      );
      metadata = {};
    }
  }

  return {
    // Core identity fields
    datasetId: row.datasetId,
    shortName: row.shortName,
    longName: row.longName,
    description: row.description,

    // Metadata fields
    type: row.datasetType || 'Unknown',
    regions: parseRegions(row.regions),

    // Spatial bounds object
    spatial: {
      latMin: row.latMin,
      latMax: row.latMax,
      lonMin: row.lonMin,
      lonMax: row.lonMax,
    },

    // Temporal bounds object
    temporal: {
      timeMin: row.timeMin,
      timeMax: row.timeMax,
    },

    // Temporal aliases for UI compatibility (CollectionDatasetsTable format)
    timeStart: row.timeMin,
    timeEnd: row.timeMax,

    // Depth bounds object
    depth: {
      depthMin: row.depthMin,
      depthMax: row.depthMax,
    },

    // Statistics
    rowCount: row.rowCount || 0,
    rank: row.rank || 0,

    // Coverage calculations (only present for spatial temporal search)
    roi_area: row.roi_area,
    dataset_area: row.dataset_area,
    intersection_area: row.intersection_area,
    dataset_utilization: row.dataset_utilization,
    spatial_coverage: row.spatial_coverage,
    temporal_coverage: row.temporal_coverage,
    depth_coverage: row.depth_coverage,

    // Utilization metrics (for future use)
    temporal_utilization: row.temporal_utilization,
    depth_utilization: row.depth_utilization,

    // Additional metadata
    metadata,

    // Status flags
    isInvalid: false, // All catalog datasets are valid by definition
  };
};

/**
 * Transform an array of raw database rows into UI-facing dataset format
 *
 * @param {Object[]} rows - Array of raw database rows from SQLite worker
 * @returns {Object[]} Array of transformed dataset objects
 *
 * @example
 * const rawRows = [
 *   { datasetId: 1, shortName: 'DS1', ... },
 *   { datasetId: 2, shortName: 'DS2', ... }
 * ];
 *
 * const transformed = transformSearchResults(rawRows);
 * // Returns array of transformed dataset objects
 */
export const transformSearchResults = (rows) => {
  if (!Array.isArray(rows)) {
    console.warn('[transformSearchResults] Expected array, got:', typeof rows);
    return [];
  }

  return rows.map(transformSearchResult);
};
