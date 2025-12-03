/**
 * Determines if a dataset is eligible for frontend size estimation.
 *
 * A dataset qualifies for estimation if it has regular spatial and temporal
 * resolution. When both are regular, we assume depth is also regular.
 * The hasDepth flag (handled in estimateRowCount) determines whether to
 * use depth tables for estimation.
 *
 * @param {Object} datasetMetadata - Dataset metadata from catalog
 * @param {string} datasetMetadata.spatialResolution - Spatial resolution (e.g., "1/2° X 1/2°", "Irregular")
 * @param {string} datasetMetadata.temporalResolution - Temporal resolution (e.g., "Weekly", "Irregular")
 * @param {Object} constraints - Store constraints object
 * @param {boolean} constraints.temporalEnabled - Whether temporal constraints are enabled
 * @param {Object} constraints.temporalRange - Temporal range { timeMin, timeMax }
 * @returns {boolean} True if dataset is eligible for frontend estimation
 */
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
