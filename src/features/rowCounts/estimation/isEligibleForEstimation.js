function isEligibleForEstimation(datasetMetadata, constraints) {
  const { spatialResolution, temporalResolution } = datasetMetadata;

  if (spatialResolution === 'Irregular') {
    return false;
  }

  const hasTemporalConstraints =
    constraints.temporalEnabled &&
    constraints.temporalRange.timeMin &&
    constraints.temporalRange.timeMax;

  if (hasTemporalConstraints) {
    if (temporalResolution === 'Irregular') {
      return false;
    }
  }

  return true;
}

export default isEligibleForEstimation;
