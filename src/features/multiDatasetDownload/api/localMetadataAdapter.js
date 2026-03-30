import {
  parseCommaSeparatedField,
  filterValidNames,
  buildPlaceholders,
  executeQuery,
} from '../../../shared/catalogDb/adapterUtils';

let transformCatalogRow = function (row) {
  return {
    shortName: row.shortName,
    longName: row.longName,
    latMin: row.latMin,
    latMax: row.latMax,
    lonMin: row.lonMin,
    lonMax: row.lonMax,
    depthMin: row.depthMin,
    depthMax: row.depthMax,
    timeMin: row.timeMin,
    timeMax: row.timeMax,
    rowCount: row.rowCount,
    temporalResolution: row.temporalResolution,
    programs: parseCommaSeparatedField(row.programs),
    tableName: row.tableName,
  };
};

async function fetchMetadataFromLocalDb(datasetShortNames) {
  let validNames = filterValidNames(datasetShortNames);

  if (validNames.length === 0) {
    return { datasetsMetadata: [] };
  }

  let placeholders = buildPlaceholders(validNames.length);
  let sql = `
    SELECT shortName, longName, latMin, latMax, lonMin, lonMax,
           depthMin, depthMax, timeMin, timeMax,
           rowCount, temporalResolution, programs, tableName
    FROM datasets
    WHERE shortName IN (${placeholders})
  `;

  let rows = await executeQuery(sql, validNames);

  let rowsByShortName = new Map();
  rows.forEach(function (row) {
    rowsByShortName.set(row.shortName, row);
  });

  let datasetsMetadata = validNames
    .map(function (shortName) {
      let row = rowsByShortName.get(shortName);
      if (row) {
        return transformCatalogRow(row);
      }
      return null;
    })
    .filter(Boolean);

  return { datasetsMetadata: datasetsMetadata };
}

export { fetchMetadataFromLocalDb };
