import logInit from '../../../Services/log-service';

const log = logInit('features/rowCounts/estimation/queryEstimationTables');

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

export async function queryDepthCount(
  searchDatabaseApi,
  depthModel,
  minDepth,
  maxDepth,
) {
  const tableMap = {
    darwin: 'darwin_depth',
    pisces: 'pisces_depth',
    woa: 'woa_depth',
  };

  const tableName = tableMap[depthModel];
  if (!tableName) {
    log.debug('unknown depth model, returning 1', { depthModel });
    return 1;
  }

  const hasRange = minDepth !== undefined && maxDepth !== undefined;

  try {
    log.debug('querying depth count', {
      depthModel,
      tableName,
      minDepth,
      maxDepth,
      hasRange,
    });

    const sql = hasRange
      ? 'SELECT COUNT(*) as count FROM ' +
        tableName +
        ' WHERE depth_level BETWEEN ? AND ?'
      : 'SELECT COUNT(*) as count FROM ' + tableName;
    const bindings = hasRange ? [minDepth, maxDepth] : [];

    const results = await searchDatabaseApi.executeSql(sql, bindings);

    const count = results[0].count;
    log.debug('depth count result', { depthModel, minDepth, maxDepth, count });

    return count;
  } catch (error) {
    log.error('error querying depth count', {
      depthModel,
      tableName,
      minDepth,
      maxDepth,
      error: error.message,
    });
    return 1;
  }
}
