/**
 * Determines if a dataset is eligible for frontend size estimation.
 *
 * @param {Object} datasetMetadata - Dataset metadata from catalog
 * @param {string} datasetMetadata.spatialResolution - Spatial resolution (e.g., "1/2° X 1/2°", "Irregular")
 * @param {string} datasetMetadata.temporalResolution - Temporal resolution (e.g., "Weekly", "Irregular")
 * @param {string} datasetMetadata.tableName - Dataset table name (e.g., "tblDarwin_Nutrient")
 * @param {Object} constraints - Store constraints object
 * @param {Object} constraints.spatialBounds - Spatial bounds { latMin, latMax, lonMin, lonMax }
 * @param {boolean} constraints.temporalEnabled - Whether temporal constraints are enabled
 * @param {Object} constraints.temporalRange - Temporal range { timeMin, timeMax }
 * @param {boolean} constraints.depthEnabled - Whether depth constraints are enabled
 * @param {Object} constraints.depthRange - Depth range { depthMin, depthMax }
 * @returns {boolean} True if dataset is eligible for frontend estimation
 */
function isEligibleForEstimation(datasetMetadata, constraints) {
  const { spatialResolution, temporalResolution, tableName } = datasetMetadata;

  // Check 1: Spatial resolution (ALWAYS required)
  if (spatialResolution === 'Irregular') {
    return false;
  }

  // Check 2: Temporal resolution (only if temporal constraints are active)
  const hasTemporalConstraints =
    constraints.temporalEnabled &&
    constraints.temporalRange.timeMin &&
    constraints.temporalRange.timeMax;

  if (hasTemporalConstraints) {
    // Only reject 'Irregular'
    // Note: 'Monthly Climatology' is eligible despite having null value in mapping table
    if (temporalResolution === 'Irregular') {
      return false;
    }
  }

  // Check 3: Depth support (only if depth constraints are active)
  const hasDepthConstraints =
    constraints.depthEnabled &&
    constraints.depthRange.depthMin !== null &&
    constraints.depthRange.depthMax !== null;

  if (hasDepthConstraints) {
    const tableNameLower = tableName.toLowerCase();
    const supportsDarwin = tableNameLower.includes('darwin');
    const supportsPisces = tableNameLower.includes('pisces');

    if (!supportsDarwin && !supportsPisces) {
      return false;
    }
  }

  // All applicable checks passed
  return true;
}

export default isEligibleForEstimation;
