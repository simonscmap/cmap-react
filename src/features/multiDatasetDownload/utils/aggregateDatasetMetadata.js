export const aggregateDatasetMetadata = (datasetsMetadata) => {
  if (!datasetsMetadata || datasetsMetadata.length === 0) {
    return null;
  }

  const validDatasets = datasetsMetadata.filter(
    (d) =>
      d.latMin !== undefined &&
      d.latMax !== undefined &&
      d.lonMin !== undefined &&
      d.lonMax !== undefined,
  );

  if (validDatasets.length === 0) return null;

  let timeMin = validDatasets.reduce(
    (min, d) => (!min || (d.timeMin && d.timeMin < min) ? d.timeMin : min),
    null,
  );
  let timeMax = validDatasets.reduce(
    (max, d) => (!max || (d.timeMax && d.timeMax > max) ? d.timeMax : max),
    null,
  );

  let allNullTime = validDatasets.every(
    (d) => d.timeMin === null && d.timeMax === null,
  );
  if (!timeMin && !timeMax && allNullTime) {
    timeMin = '2025-01-01T00:00:00.000Z';
    timeMax = '2025-12-31T00:00:00.000Z';
  }

  let firstDataset = validDatasets[0];
  let temporalResolution = firstDataset && firstDataset.temporalResolution
    ? firstDataset.temporalResolution
    : 'daily';

  return {
    Lat_Min: Math.min(...validDatasets.map((d) => d.latMin)),
    Lat_Max: Math.max(...validDatasets.map((d) => d.latMax)),
    Lon_Min: Math.min(...validDatasets.map((d) => d.lonMin)),
    Lon_Max: Math.max(...validDatasets.map((d) => d.lonMax)),
    Depth_Min: Math.max(0, Math.min(...validDatasets.map((d) => d.depthMin || 0))),
    Depth_Max: Math.max(...validDatasets.map((d) => d.depthMax || 0)),
    Time_Min: timeMin,
    Time_Max: timeMax,
    Temporal_Resolution: temporalResolution,
  };
};
