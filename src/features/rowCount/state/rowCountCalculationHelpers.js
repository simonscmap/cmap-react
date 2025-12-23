import logInit from '../../../Services/log-service';
import { captureError } from '../../../shared/errorCapture';
import { getSearchDatabaseApi } from '../../catalogSearch/api';

const log = logInit('rowCount/rowCountCalculationHelpers');

export function isDatasetFullyWithinConstraints(dataset, constraints) {
  if (!dataset || !constraints) {
    return true;
  }

  if (constraints.spatialBounds) {
    const { latMin, latMax, lonMin, lonMax } = constraints.spatialBounds;
    const spatiallyContained =
      dataset.latMin >= latMin &&
      dataset.latMax <= latMax &&
      dataset.lonMin >= lonMin &&
      dataset.lonMax <= lonMax;
    if (!spatiallyContained) {
      return false;
    }
  }

  if (constraints.temporalEnabled && dataset.timeMin && dataset.timeMax) {
    const { timeMin, timeMax } = constraints.temporalRange;
    if (timeMin && timeMax) {
      const datasetTimeMin = new Date(dataset.timeMin).getTime();
      const datasetTimeMax = new Date(dataset.timeMax).getTime();
      const constraintTimeMin = new Date(timeMin).getTime();
      const constraintTimeMax = new Date(timeMax).getTime();

      const temporallyContained =
        datasetTimeMin >= constraintTimeMin &&
        datasetTimeMax <= constraintTimeMax;
      if (!temporallyContained) {
        return false;
      }
    }
  }

  if (constraints.depthEnabled && dataset.hasDepth) {
    const { depthMin, depthMax } = constraints.depthRange;
    if (depthMin !== null && depthMax !== null) {
      const depthContained =
        dataset.depthMin >= depthMin && dataset.depthMax <= depthMax;
      if (!depthContained) {
        return false;
      }
    }
  }

  return true;
}

export async function queryDatasetMetadata(shortNames) {
  if (!shortNames || shortNames.length === 0) {
    return {};
  }

  const searchDatabaseApi = getSearchDatabaseApi();

  if (!searchDatabaseApi.isClientSideAvailable()) {
    log.debug('catalog DB not initialized, initializing now');
    try {
      await searchDatabaseApi.initialize();
    } catch (error) {
      captureError(error, { action: 'initializeCatalogDB' });
      return {};
    }
  }

  try {
    const placeholders = shortNames.map(() => '?').join(', ');
    const sql = `
      SELECT shortName, rowCount, spatialResolution, temporalResolution,
             latMin, latMax, lonMin, lonMax,
             timeMin, timeMax, depthMin, depthMax,
             hasDepth, tableCount
      FROM datasets
      WHERE shortName IN (${placeholders})
    `;

    const results = await searchDatabaseApi.executeSql(sql, shortNames);

    const metadataMap = {};
    for (const row of results) {
      metadataMap[row.shortName] = {
        rowCount: row.rowCount,
        spatialResolution: row.spatialResolution,
        temporalResolution: row.temporalResolution,
        latMin: row.latMin,
        latMax: row.latMax,
        lonMin: row.lonMin,
        lonMax: row.lonMax,
        timeMin: row.timeMin,
        timeMax: row.timeMax,
        depthMin: row.depthMin,
        depthMax: row.depthMax,
        hasDepth: row.hasDepth === 1,
        tableCount: row.tableCount,
      };
    }

    log.debug('fetched dataset metadata from catalog DB', {
      requested: shortNames.length,
      found: Object.keys(metadataMap).length,
    });

    return metadataMap;
  } catch (error) {
    log.error('failed to query dataset metadata', { error: error.message });
    return {};
  }
}

export function normalizeDatasetForEstimation(shortName, metadata) {
  const meta = metadata || {};
  return {
    shortName,
    rows: meta.rowCount,
    spatialResolution: meta.spatialResolution,
    temporalResolution: meta.temporalResolution,
    tableName: shortName,
    latMin: meta.latMin,
    latMax: meta.latMax,
    lonMin: meta.lonMin,
    lonMax: meta.lonMax,
    timeMin: meta.timeMin,
    timeMax: meta.timeMax,
    depthMin: meta.depthMin,
    depthMax: meta.depthMax,
    hasDepth: meta.hasDepth,
    tableCount: meta.tableCount,
  };
}

export function normalizeAllDatasetsForEstimation(shortNames, metadataMap) {
  return shortNames.map((shortName) =>
    normalizeDatasetForEstimation(shortName, metadataMap[shortName]),
  );
}
