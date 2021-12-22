import depthUtils from '../../../Utility/depthCounter';
import temporalResolutions from '../../../enums/temporalResolutions';

const generateVariableSampleRangeParams = (varDetails) => {
  let dt1 =
    varDetails.Temporal_Resolution === temporalResolutions.monthlyClimatology
      ? 1
      : varDetails.Time_Min.slice(0, 10);
  let dt2 =
    varDetails.Temporal_Resolution === temporalResolutions.monthlyClimatology
      ? 1
      : // varDetails.Time_Min.slice(0, 10);
        varDetails.Time_Max.slice(0, 10);

  let lat1 = Math.floor(varDetails.Lat_Min * 1000) / 1000;
  let lat2 = Math.ceil(varDetails.Lat_Max * 1000) / 1000;
  let lon1 = Math.floor(varDetails.Lon_Min * 1000) / 1000;
  let lon2 = Math.ceil(varDetails.Lon_Max * 1000) / 1000;

  let surfaceOnly = !varDetails.Depth_Max;
  let irregularSpatialResolution =
    varDetails.Spatial_Resolution === 'Irregular';

  // TODO ternary chaining is unreadable
  // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator
  let depth1 = surfaceOnly
    ? 0
    : irregularSpatialResolution
    ? Math.floor(varDetails.Depth_Min * 1000) / 1000 || 0
    : 0;

  // TODO ternary chaining is unreadable
  let depth2 = surfaceOnly
    ? 0
    : irregularSpatialResolution
    ? Math.ceil(varDetails.Depth_Max * 1000) / 1000 || 0
    : depthUtils.piscesTable.has(varDetails.Table_Name)
    ? ((depthUtils.piscesDepths[0] + depthUtils.piscesDepths[1]) / 2).toFixed(2)
    : depthUtils.darwinTable.has(varDetails.Table_Name)
    ? ((depthUtils.darwinDepths[0] + depthUtils.darwinDepths[1]) / 2).toFixed(2)
    : 11000;

  return {
    lat1,
    lat2,
    lon1,
    lon2,
    depth1,
    depth2,
    dt1,
    dt2,
  };
};

export default generateVariableSampleRangeParams;
