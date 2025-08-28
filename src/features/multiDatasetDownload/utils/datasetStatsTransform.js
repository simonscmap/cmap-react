export const getRowCountFromStats = (stats) => {
  if (!stats) return null;
  return stats.lat?.count ?? stats.lon?.count ?? stats.time?.count ?? null;
};

export const transformStatsToDownloadFormat = (stats) => {
  if (!stats) return {};

  return {
    Row_Count: getRowCountFromStats(stats),
    ...(stats.lat && {
      Lat_Min: stats.lat.min,
      Lat_Max: stats.lat.max,
    }),
    ...(stats.lon && {
      Lon_Min: stats.lon.min,
      Lon_Max: stats.lon.max,
    }),
    ...(stats.time && {
      Time_Min: stats.time.min,
      Time_Max: stats.time.max,
    }),
    ...(stats.depth && {
      Depth_Min: stats.depth.min,
      Depth_Max: stats.depth.max,
    }),
  };
};

export const createDatasetTransformer = (statsExtractor) => {
  return (datasets) => {
    return datasets.map((dataset) => ({
      ...dataset,
      ...transformStatsToDownloadFormat(statsExtractor(dataset)),
    }));
  };
};
