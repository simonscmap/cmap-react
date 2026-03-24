import { getSearchDatabaseApi } from '../../catalogSearch/api';

let parseCommaSeparatedField = function (value) {
  if (!value || typeof value !== 'string') {
    return [];
  }
  return value
    .split(',')
    .map(function (item) { return item.trim(); })
    .filter(Boolean);
};

let transformCatalogRow = function (row) {
  return {
    shortName: row.shortName,
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
  if (!datasetShortNames || datasetShortNames.length === 0) {
    return { datasetsMetadata: [] };
  }

  let validNames = datasetShortNames.filter(
    function (name) { return name !== undefined && name !== null && name !== ''; },
  );

  if (validNames.length === 0) {
    return { datasetsMetadata: [] };
  }

  let placeholders = validNames.map(function () { return '?'; }).join(', ');
  let sql = `
    SELECT shortName, latMin, latMax, lonMin, lonMax,
           depthMin, depthMax, timeMin, timeMax,
           rowCount, temporalResolution, programs, tableName
    FROM datasets
    WHERE shortName IN (${placeholders})
  `;

  let api = getSearchDatabaseApi();
  let rows = await api.executeSql(sql, validNames);

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
