import spatialResolutions from '../enums/spatialResolutions';

const mapSpatialResolutionToNumber = (resolution) => {
  let map = {
    [spatialResolutions.halfDegree]: 0.5,
    [spatialResolutions.quarterDegree]: 0.25,
    [spatialResolutions.twentyFifthDegree]: 0.04,
    [spatialResolutions.fourKm]: 0.041672,
    [spatialResolutions.twelfthDegree]: 0.083333,
    [spatialResolutions.oneDegree]: 1,
    [spatialResolutions.seventyKm]: 0.25,
    [spatialResolutions.nineKm]: 0.083333,
    [spatialResolutions.twentyFiveKm]: 0.23148,
    [spatialResolutions.fortyEighthDegree]: 0.020833333,
  };

  return map[resolution];
};

export default mapSpatialResolutionToNumber;
