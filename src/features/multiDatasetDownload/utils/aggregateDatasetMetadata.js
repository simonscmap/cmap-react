export const aggregateDatasetMetadata = (datasetsMetadata) => {
  if (!datasetsMetadata || datasetsMetadata.length === 0) {
    return null;
  }

  const validDatasets = datasetsMetadata.filter(
    (d) =>
      d.Lat_Min !== undefined &&
      d.Lat_Max !== undefined &&
      d.Lon_Min !== undefined &&
      d.Lon_Max !== undefined,
  );

  if (validDatasets.length === 0) return null;

  let timeMin = validDatasets.reduce(
    (min, d) => (!min || (d.Time_Min && d.Time_Min < min) ? d.Time_Min : min),
    null,
  );
  let timeMax = validDatasets.reduce(
    (max, d) => (!max || (d.Time_Max && d.Time_Max > max) ? d.Time_Max : max),
    null,
  );

  let allNullTime = validDatasets.every(
    (d) => d.Time_Min === null && d.Time_Max === null,
  );
  if (!timeMin && !timeMax && allNullTime) {
    timeMin = '2025-01-01T00:00:00.000Z';
    timeMax = '2025-12-31T00:00:00.000Z';
  }

  let firstDataset = validDatasets[0];
  let temporalResolution = firstDataset && firstDataset.Temporal_Resolution
    ? firstDataset.Temporal_Resolution
    : 'daily';

  return {
    Lat_Min: Math.min(...validDatasets.map((d) => d.Lat_Min)),
    Lat_Max: Math.max(...validDatasets.map((d) => d.Lat_Max)),
    Lon_Min: Math.min(...validDatasets.map((d) => d.Lon_Min)),
    Lon_Max: Math.max(...validDatasets.map((d) => d.Lon_Max)),
    Depth_Min: Math.max(0, Math.min(...validDatasets.map((d) => d.Depth_Min || 0))),
    Depth_Max: Math.max(...validDatasets.map((d) => d.Depth_Max || 0)),
    Time_Min: timeMin,
    Time_Max: timeMax,
    Temporal_Resolution: temporalResolution,
  };
};
