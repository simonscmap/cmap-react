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

  return {
    Lat_Min: Math.min(...validDatasets.map((d) => d.Lat_Min)),
    Lat_Max: Math.max(...validDatasets.map((d) => d.Lat_Max)),
    Lon_Min: Math.min(...validDatasets.map((d) => d.Lon_Min)),
    Lon_Max: Math.max(...validDatasets.map((d) => d.Lon_Max)),
    Depth_Min: Math.min(...validDatasets.map((d) => d.Depth_Min || 0)),
    Depth_Max: Math.max(...validDatasets.map((d) => d.Depth_Max || 0)),
    Time_Min: validDatasets.reduce(
      (min, d) => (!min || (d.Time_Min && d.Time_Min < min) ? d.Time_Min : min),
      null,
    ),
    Time_Max: validDatasets.reduce(
      (max, d) => (!max || (d.Time_Max && d.Time_Max > max) ? d.Time_Max : max),
      null,
    ),
    Temporal_Resolution: validDatasets[0]?.Temporal_Resolution || 'daily',
  };
};
