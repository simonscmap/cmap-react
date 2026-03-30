import {
  parseCommaSeparatedField,
  filterValidNames,
  buildPlaceholders,
  executeQuery,
} from '../../../shared/catalogDb/adapterUtils';

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
    temporalResolution: row.temporalResolution || null,
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
  const validNames = filterValidNames(datasetShortNames);

  if (validNames.length === 0) {
    return [];
  }

  const placeholders = buildPlaceholders(validNames.length);
  const sql = `
    SELECT shortName, longName, description, timeMin, timeMax, rowCount, sensors, make, regions, temporalResolution
    FROM datasets
    WHERE shortName IN (${placeholders})
  `;

  const rows = await executeQuery(sql, validNames);

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
