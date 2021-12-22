const generateVariableFullRangeParams = (varDetails) => {
  return {
    lat1: Math.floor(varDetails.Lat_Min * 1000) / 1000,
    lat2: Math.ceil(varDetails.Lat_Max * 1000) / 1000,
    lon1: Math.floor(varDetails.Lon_Min * 1000) / 1000,
    lon2: Math.ceil(varDetails.Lon_Max * 1000) / 1000,
    dt1: varDetails.Time_Min ? varDetails.Time_Min.slice(0, 10) : 1,
    dt2: varDetails.Time_Max ? varDetails.Time_Max.slice(0, 10) : 1,
    depth1: Math.floor(varDetails.Depth_Min * 1000) / 1000 || 0,
    depth2: Math.ceil(varDetails.Depth_Max * 1000) / 1000 || 0,
  };
};

export default generateVariableFullRangeParams;
