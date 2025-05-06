import temporalResolutions from '../../../enums/temporalResolutions';

const getTargetFeatures = (currProps) => {
  const data = currProps.vizPageDataTargetDetails;
  const surfaceOnly = !data.Has_Depth;
  const irregularSpatialResolution = data.Spatial_Resolution === 'Irregular';
  const monthlyClimatology =
    data.Temporal_Resolution === temporalResolutions.monthlyClimatology;

  return {
    surfaceOnly,
    irregularSpatialResolution,
    monthlyClimatology,
  };
};

export default getTargetFeatures;
