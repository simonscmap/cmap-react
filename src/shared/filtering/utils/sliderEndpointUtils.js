import { floorToStep, ceilToStep } from './rangeValidation';

var calculatePresetEndpoints = (preset, collectionExtent) => {
  return {
    latMin: floorToStep(Math.min(collectionExtent.latMin, preset.southLatitude)),
    latMax: ceilToStep(Math.max(collectionExtent.latMax, preset.northLatitude)),
    lonMin: floorToStep(Math.min(collectionExtent.lonMin, preset.westLongitude)),
    lonMax: ceilToStep(Math.max(collectionExtent.lonMax, preset.eastLongitude)),
  };
};

const calculateLongitudeEndpoints = (preset, collectionExtent) => {
  var collectionCrosses = collectionExtent.lonMin > collectionExtent.lonMax;
  var presetCrosses = preset.westLongitude > preset.eastLongitude;

  if (collectionCrosses || presetCrosses) {
    return { lonMin: -180, lonMax: 180 };
  }

  return {
    lonMin: floorToStep(Math.min(collectionExtent.lonMin, preset.westLongitude)),
    lonMax: ceilToStep(Math.max(collectionExtent.lonMax, preset.eastLongitude)),
  };
};

const expandEndpointIfNeeded = (currentEndpoints, fieldName, newValue) => {
  var isMin = fieldName.endsWith('Min');
  var currentValue = currentEndpoints[fieldName];

  if (currentValue === null || currentValue === undefined) {
    return newValue;
  }

  if (isMin) {
    return newValue < currentValue ? floorToStep(newValue) : currentValue;
  } else {
    return newValue > currentValue ? ceilToStep(newValue) : currentValue;
  }
};

export {
  calculatePresetEndpoints,
  calculateLongitudeEndpoints,
  expandEndpointIfNeeded,
};
