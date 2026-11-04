import { createSearchQuery, LIMITS } from './queries';

const SEARCH_PAGE_SIZE = LIMITS.MAX_LIMIT;

const asArray = (value) => {
  if (value === undefined || value === null || value === '') {
    return [];
  }
  return Array.isArray(value) ? value : [value];
};

const asNumber = (value, parameterName) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`Invalid numeric catalog search parameter: ${parameterName}`);
  }
  return number;
};

export const createCatalogUrlSearchQuery = (params, offset = 0) => {
  const builder = createSearchQuery()
    .withPagination(SEARCH_PAGE_SIZE, offset)
    .withExcludedFields(['description']);

  const keywords = asArray(params.keywords).join(' ').trim();
  if (keywords) {
    builder.withText(keywords, { phraseMatch: false, searchMode: 'like' });
  }

  const spatial = {
    latMin: asNumber(params.latStart, 'latStart'),
    latMax: asNumber(params.latEnd, 'latEnd'),
    lonMin: asNumber(params.lonStart, 'lonStart'),
    lonMax: asNumber(params.lonEnd, 'lonEnd'),
  };
  if (Object.values(spatial).some((value) => value !== undefined)) {
    builder.withSpatialBounds(spatial);
  }

  if (params.timeStart || params.timeEnd) {
    builder.withTemporalRange(
      params.timeStart || undefined,
      params.timeEnd || undefined,
    );
  }

  const region = asArray(params.region);
  if (region.length) {
    builder.withRegions(region);
  }

  const sensors = asArray(params.sensor)
    .map((sensor) => sensor.trim())
    .filter(Boolean);
  if (sensors.length) {
    builder.withSensors(sensors);
  }

  const makes = asArray(params.make);
  if (makes.length) {
    builder.withMakes(makes);
  }

  if (params.hasDepth && !['yes', 'no', 'any'].includes(params.hasDepth)) {
    throw new Error(`Invalid catalog depth filter: ${params.hasDepth}`);
  }
  if (params.hasDepth === 'yes' || params.hasDepth === 'no') {
    builder.withHasDepth(params.hasDepth === 'yes');
  }

  return builder.build();
};

export const createCatalogDataset = (result, dataFeatures = []) => {
  const metadata = result.metadata || {};
  const sensors =
    typeof metadata.sensors === 'string'
      ? metadata.sensors.split(',').map((sensor) => sensor.trim()).filter(Boolean)
      : (metadata.sensors || [])
          .map((sensor) => sensor.trim())
          .filter(Boolean);

  return {
    ...metadata,
    Dataset_ID: result.datasetId,
    Short_Name: result.shortName,
    Long_Name: result.longName,
    Description: result.description,
    Icon_URL: metadata.iconUrl,
    Dataset_Release_Date: metadata.datasetReleaseDate,
    Dataset_History: metadata.datasetHistory,
    Dataset_Version: metadata.datasetVersion,
    Table_Name: metadata.tableName,
    Process_Level: metadata.processLevel,
    Make: metadata.make,
    Data_Source: metadata.dataSource,
    Distributor: metadata.distributor,
    Acknowledgement: metadata.acknowledgement,
    Spatial_Resolution: metadata.spatialResolution,
    Temporal_Resolution: metadata.temporalResolution,
    Study_Domain: metadata.studyDomain,
    Lat_Min: metadata.latMin,
    Lat_Max: metadata.latMax,
    Lon_Min: metadata.lonMin,
    Lon_Max: metadata.lonMax,
    Depth_Min: metadata.depthMin,
    Depth_Max: metadata.depthMax,
    Time_Min: metadata.timeMin,
    Time_Max: metadata.timeMax,
    Sensors: sensors,
    Visualize: metadata.visualize,
    Has_Depth: metadata.hasDepth ? 1 : 0,
    Row_Count: metadata.rowCount,
    Table_Count: metadata.tableCount,
    Regions: metadata.regions,
    References: metadata.references,
    Product_Type: metadata.productType,
    Variable_Long_Names: metadata.variableLongNames,
    Variable_Short_Names: metadata.variableShortNames,
    Keywords: metadata.keywords,
    Servers: metadata.servers,
    Programs: metadata.programs,
    DataFeatures: dataFeatures,
  };
};

export const getCatalogUrlSearchPageSize = () => SEARCH_PAGE_SIZE;
