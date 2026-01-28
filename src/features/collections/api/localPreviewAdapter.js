import { getSearchDatabaseApi } from '../../catalogSearch/api';

const parseCommaSeparatedField = (value) => {
  if (!value || typeof value !== 'string') {
    return [];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const transformDbRowToPreview = (row) => {
  return {
    shortName: row.shortName,
    longName: row.longName || null,
    description: row.description,
    timeStart: row.timeMin,
    timeEnd: row.timeMax,
    rowCount: row.rowCount,
    sensors: parseCommaSeparatedField(row.sensors),
    makes: parseCommaSeparatedField(row.make),
    regions: parseCommaSeparatedField(row.regions),
    isInvalid: false,
  };
};

const createInvalidDatasetEntry = (shortName) => {
  return {
    shortName: shortName,
    longName: null,
    description: null,
    timeStart: null,
    timeEnd: null,
    rowCount: null,
    sensors: [],
    makes: [],
    regions: [],
    isInvalid: true,
  };
};

export async function fetchPreviewFromLocalDb(datasetShortNames) {
  if (!datasetShortNames || datasetShortNames.length === 0) {
    return [];
  }

  const validNames = datasetShortNames.filter(
    (name) => name !== undefined && name !== null && name !== '',
  );

  if (validNames.length === 0) {
    return [];
  }

  const placeholders = validNames.map(() => '?').join(', ');
  const sql = `
    SELECT shortName, longName, description, timeMin, timeMax, rowCount, sensors, make, regions
    FROM datasets
    WHERE shortName IN (${placeholders})
  `;

  const api = getSearchDatabaseApi();
  const rows = await api.executeSql(sql, validNames);

  const rowsByShortName = new Map();
  rows.forEach((row) => {
    rowsByShortName.set(row.shortName, row);
  });

  return validNames.map((shortName) => {
    const row = rowsByShortName.get(shortName);
    if (row) {
      return transformDbRowToPreview(row);
    }
    return createInvalidDatasetEntry(shortName);
  });
}
