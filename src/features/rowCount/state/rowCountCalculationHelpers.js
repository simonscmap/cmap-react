import logInit from '../../../Services/log-service';
import { captureError } from '../../../shared/errorCapture';
import { getSearchDatabaseApi } from '../../catalogSearch/api';
import { parseUTCDateString } from '../../../shared/filtering/utils/dateHelpers';
import {
  clampSpatialBounds,
  clampTemporalRange,
  clampDepthRange,
} from '../estimation/performRowCountMath';

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
      const datasetTimeMin = parseUTCDateString(dataset.timeMin).getTime();
      const datasetTimeMax = parseUTCDateString(dataset.timeMax).getTime();
      const constraintTimeMin =
        timeMin instanceof Date ? timeMin.getTime() : parseUTCDateString(timeMin).getTime();
      const constraintTimeMax =
        timeMax instanceof Date ? timeMax.getTime() : parseUTCDateString(timeMax).getTime();

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

export function hasNoOverlapWithConstraints(dataset, constraints) {
  if (!dataset || !constraints) {
    return false;
  }

  if (constraints.spatialBounds) {
    let hasSpatialBounds =
      dataset.latMin != null && dataset.latMax != null &&
      dataset.lonMin != null && dataset.lonMax != null;

    if (hasSpatialBounds) {
      let result = clampSpatialBounds(
        constraints.spatialBounds,
        { latMin: dataset.latMin, latMax: dataset.latMax,
          lonMin: dataset.lonMin, lonMax: dataset.lonMax },
      );
      if (result === null) {
        return true;
      }
    }
  }

  if (constraints.temporalEnabled && constraints.temporalRange) {
    let { timeMin, timeMax } = constraints.temporalRange;
    if (timeMin && timeMax && dataset.timeMin && dataset.timeMax) {
      let result = clampTemporalRange(
        { timeMin, timeMax },
        { timeMin: dataset.timeMin, timeMax: dataset.timeMax },
      );
      if (result === null) {
        return true;
      }
    }
  }

  if (constraints.depthEnabled && constraints.depthRange) {
    let { depthMin, depthMax } = constraints.depthRange;
    if (depthMin != null && depthMax != null &&
        dataset.depthMin != null && dataset.depthMax != null) {
      let result = clampDepthRange(
        { depthMin, depthMax },
        { depthMin: dataset.depthMin, depthMax: dataset.depthMax },
      );
      if (result === null) {
        return true;
      }
    }
  }

  return false;
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
