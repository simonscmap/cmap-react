/**
 * Determines if a dataset is eligible for frontend size estimation.
 *
 * A dataset qualifies for estimation if it has regular spatial and regular
 * temporal resolution. When both are regular, we assume depth is also regular.
 * The hasDepth flag (handled in estimateRowCount) determines whether to
 * use depth tables for estimation.
 *
 * @param {Object} params
 * @param {string} params.spatialResolution - Spatial resolution (e.g., "1/2° X 1/2°", "Irregular")
 * @param {string} params.temporalResolution - Temporal resolution (e.g., "Weekly", "Irregular")
 * @returns {boolean} True if dataset is eligible for frontend estimation
 */
function isEligibleForEstimation({ spatialResolution, temporalResolution }) {
  if (spatialResolution === 'Irregular') {
    return false;
  }

  if (temporalResolution === 'Irregular') {
    return false;
  }

  return true;
}

export default isEligibleForEstimation;
