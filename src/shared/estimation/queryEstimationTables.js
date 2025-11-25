/**
 * Query Estimation Tables
 *
 * Provides interface to query SQLite catalog database estimation tables.
 * These tables support frontend row count estimation for datasets with
 * regular spatial/temporal resolution.
 *
 * Tables queried:
 * - spatial_resolution_mappings: resolution → {value (degrees), units} (units null for irregular)
 * - temporal_resolution_mappings: resolution → {value (seconds), units} (units null for irregular)
 * - dataset_depth_models: dataset short name → depth model (darwin/pisces)
 * - darwin_depth: Darwin depth levels
 * - pisces_depth: PISCES depth levels
 *
 * All functions use the catalog search Web Worker's executeSql interface.
 */

import logInit from '../../Services/log-service';

const log = logInit('shared/estimation/queryEstimationTables');

/**
 * Query spatial resolution mapping table
 * @param {Object} searchDatabaseApi - Initialized SearchDatabaseApi instance
 * @param {string} resolution - Spatial resolution string (e.g., "1/2° X 1/2°")
 * @returns {Promise<{value: number|null, units: string|null}|null>} Object with numeric degree value and units, or null if not found
 */
export async function querySpatialResolutionMapping(
  searchDatabaseApi,
  resolution,
) {
  try {
    log.debug('querying spatial resolution mapping', { resolution });

    const sql =
      'SELECT value, units FROM spatial_resolution_mappings WHERE resolution = ?';
    const bindings = [resolution];

    const results = await searchDatabaseApi.executeSql(sql, bindings);

    if (results.length === 0) {
      log.debug('spatial resolution not found in mappings', { resolution });
      return null;
    }

    const result = {
      value: results[0].value,
      units: results[0].units,
    };
    log.debug('spatial resolution mapping found', {
      resolution,
      ...result,
    });

    return result;
  } catch (error) {
    log.error('error querying spatial resolution mapping', {
      resolution,
      error: error.message,
    });
    return null;
  }
}

/**
 * Query temporal resolution mapping table
 * @param {Object} searchDatabaseApi - Initialized SearchDatabaseApi instance
 * @param {string} resolution - Temporal resolution string (e.g., "Weekly")
 * @returns {Promise<{value: number|null, units: string|null}|null>} Object with numeric seconds value and units, or null if not found
 */
export async function queryTemporalResolutionMapping(
  searchDatabaseApi,
  resolution,
) {
  try {
    log.debug('querying temporal resolution mapping', { resolution });

    const sql =
      'SELECT value, units FROM temporal_resolution_mappings WHERE resolution = ?';
    const bindings = [resolution];

    const results = await searchDatabaseApi.executeSql(sql, bindings);

    if (results.length === 0) {
      log.debug('temporal resolution not found in mappings', { resolution });
      return null;
    }

    const result = {
      value: results[0].value,
      units: results[0].units,
    };
    log.debug('temporal resolution mapping found', {
      resolution,
      ...result,
    });

    return result;
  } catch (error) {
    log.error('error querying temporal resolution mapping', {
      resolution,
      error: error.message,
    });
    return null;
  }
}

/**
 * Query dataset depth model table
 * @param {Object} searchDatabaseApi - Initialized SearchDatabaseApi instance
 * @param {string} shortName - Dataset short name
 * @returns {Promise<string|null>} Depth model ("darwin" or "pisces") or null if not found
 */
export async function queryDatasetDepthModel(searchDatabaseApi, shortName) {
  try {
    log.debug('querying dataset depth model', { shortName });

    const sql =
      'SELECT depth_model FROM dataset_depth_models WHERE short_name = ?';
    const bindings = [shortName];

    const results = await searchDatabaseApi.executeSql(sql, bindings);

    if (results.length === 0) {
      log.debug('dataset depth model not found', { shortName });
      return null;
    }

    const depthModel = results[0].depth_model;
    log.debug('dataset depth model found', { shortName, depthModel });

    return depthModel;
  } catch (error) {
    log.error('error querying dataset depth model', {
      shortName,
      error: error.message,
    });
    return null;
  }
}

/**
 * Count Darwin depth levels within range
 * @param {Object} searchDatabaseApi - Initialized SearchDatabaseApi instance
 * @param {number} minDepth - Minimum depth in meters
 * @param {number} maxDepth - Maximum depth in meters
 * @returns {Promise<number>} Count of depth levels within range
 */
export async function queryDarwinDepthCount(
  searchDatabaseApi,
  minDepth,
  maxDepth,
) {
  try {
    log.debug('querying darwin depth count', { minDepth, maxDepth });

    const sql =
      'SELECT COUNT(*) as count FROM darwin_depth WHERE depth_level BETWEEN ? AND ?';
    const bindings = [minDepth, maxDepth];

    const results = await searchDatabaseApi.executeSql(sql, bindings);

    const count = results[0].count;
    log.debug('darwin depth count', { minDepth, maxDepth, count });

    return count;
  } catch (error) {
    log.error('error querying darwin depth count', {
      minDepth,
      maxDepth,
      error: error.message,
    });
    return 0;
  }
}

/**
 * Count PISCES depth levels within range
 * @param {Object} searchDatabaseApi - Initialized SearchDatabaseApi instance
 * @param {number} minDepth - Minimum depth in meters
 * @param {number} maxDepth - Maximum depth in meters
 * @returns {Promise<number>} Count of depth levels within range
 */
export async function queryPiscesDepthCount(
  searchDatabaseApi,
  minDepth,
  maxDepth,
) {
  try {
    log.debug('querying pisces depth count', { minDepth, maxDepth });

    const sql =
      'SELECT COUNT(*) as count FROM pisces_depth WHERE depth_level BETWEEN ? AND ?';
    const bindings = [minDepth, maxDepth];

    const results = await searchDatabaseApi.executeSql(sql, bindings);

    const count = results[0].count;
    log.debug('pisces depth count', { minDepth, maxDepth, count });

    return count;
  } catch (error) {
    log.error('error querying pisces depth count', {
      minDepth,
      maxDepth,
      error: error.message,
    });
    return 0;
  }
}
