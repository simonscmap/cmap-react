import { messages } from '../filtering/utils/validationMessages';

/**
 * User-defined spatial bounding box
 * @typedef {Object} BoundingBox
 * @property {number} latMin - Minimum latitude (-90 to 90)
 * @property {number} latMax - Maximum latitude (-90 to 90)
 * @property {number} lonMin - Minimum longitude (-180 to 180)
 * @property {number} lonMax - Maximum longitude (-180 to 180)
 */

/**
 * User-defined temporal constraints
 * @typedef {Object} TemporalConstraints
 * @property {boolean} enabled - Whether temporal constraints are active
 * @property {Date} timeMin - Start date (Date object)
 * @property {Date} timeMax - End date (Date object)
 */

/**
 * User-defined depth constraints
 * @typedef {Object} DepthConstraints
 * @property {boolean} enabled - Whether depth constraints are active
 * @property {number} depthMin - Minimum depth in meters
 * @property {number} depthMax - Maximum depth in meters
 */

/**
 * User preferences for overlap calculation
 * @typedef {Object} ConstraintConfiguration
 * @property {boolean} includePartialOverlaps - Include datasets with any overlap vs full containment
 * @property {boolean} temporalEnabled - Whether temporal filtering is active
 * @property {boolean} depthEnabled - Whether depth filtering is active
 * @property {string|null} selectedPreset - Selected geographic boundary label or null
 */

/**
 * Complete search query for catalog search API
 * @typedef {Object} SpatialTemporalQuery
 * @property {Object} spatial - Spatial bounds (required)
 * @property {number} spatial.latMin
 * @property {number} spatial.latMax
 * @property {number} spatial.lonMin
 * @property {number} spatial.lonMax
 * @property {Object|null} temporal - Temporal bounds (optional)
 * @property {string} temporal.timeMin - ISO 8601 date
 * @property {string} temporal.timeMax - ISO 8601 date
 * @property {Object|null} depth - Depth bounds (optional)
 * @property {number} depth.depthMin
 * @property {number} depth.depthMax
 * @property {boolean} includePartialOverlaps - Overlap mode for all dimensions
 * @property {string} searchMode - 'like' or 'fts'
 * @property {number} limit - Maximum results (max 2000)
 */

/**
 * Overlap metrics for a single dimension
 * @typedef {Object} DimensionOverlap
 * @property {number|string} coveragePercent - Percentage coverage (0-100) or "N/A"
 * @property {string} extent - Formatted range string or "N/A"
 */

/**
 * Complete overlap metrics for all dimensions
 * @typedef {Object} OverlapMetrics
 * @property {DimensionOverlap} spatial - Spatial overlap (always present)
 * @property {DimensionOverlap|null} temporal - Temporal overlap (when constraints enabled)
 * @property {DimensionOverlap|null} depth - Depth overlap (when constraints enabled)
 */

/**
 * Dataset result enhanced with overlap calculations
 * @typedef {Object} DatasetOverlapResult
 * @property {number} datasetId - Unique dataset ID
 * @property {string} shortName - Dataset short name
 * @property {string} longName - Dataset full name
 * @property {string} description - Dataset description
 * @property {string} type - Dataset type (In-Situ, Satellite, Model)
 * @property {string[]} regions - Geographic regions
 * @property {Object} spatial - Dataset spatial bounds
 * @property {number} spatial.latMin
 * @property {number} spatial.latMax
 * @property {number} spatial.lonMin
 * @property {number} spatial.lonMax
 * @property {Object} temporal - Dataset temporal bounds
 * @property {string} temporal.timeMin - ISO 8601 date
 * @property {string} temporal.timeMax - ISO 8601 date
 * @property {Object|null} depth - Dataset depth bounds
 * @property {number} [depth.depthMin]
 * @property {number} [depth.depthMax]
 * @property {OverlapMetrics} overlap - Calculated overlap metrics
 * @property {Object} metadata - Additional dataset metadata
 * @property {number} rowCount - Number of data rows
 */

/**
 * Zustand store state for spatial-temporal search
 * @typedef {Object} SpatialTemporalSearchState
 * @property {boolean} isInitialized - Catalog search initialization status
 * @property {boolean} isInitializing - Initialization in progress
 * @property {string|null} initError - Initialization error message
 * @property {BoundingBox} spatialBounds - User spatial constraints
 * @property {boolean} temporalEnabled - Temporal constraints active
 * @property {TemporalConstraints} temporalRange - User temporal constraints
 * @property {boolean} depthEnabled - Depth constraints active
 * @property {DepthConstraints} depthRange - User depth constraints
 * @property {boolean} includePartialOverlaps - Overlap mode
 * @property {string|null} selectedPreset - Selected preset label
 * @property {DatasetOverlapResult[]} results - Search results
 * @property {boolean} isSearching - Search in progress
 * @property {string|null} searchError - Search error message
 * @property {Function} initialize - Initialize catalog search
 * @property {Function} setSpatialBounds - Update spatial bounds
 * @property {Function} setTemporalConstraints - Update temporal constraints
 * @property {Function} setDepthConstraints - Update depth constraints
 * @property {Function} setIncludePartialOverlaps - Update overlap mode
 * @property {Function} applyPreset - Apply geographic preset
 * @property {Function} search - Execute search
 * @property {Function} clearResults - Clear results
 */

/**
 * Preset geographic boundary
 * @typedef {Object} GeographicBoundary
 * @property {string} label - Display name (e.g., "Arctic Ocean")
 * @property {number} northLatitude - North boundary
 * @property {number} southLatitude - South boundary
 * @property {number} eastLongitude - East boundary
 * @property {number} westLongitude - West boundary
 */

/**
 * Validation result
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string[]} errors - Array of error messages
 */

/**
 * Validates spatial bounding box constraints
 *
 * Rules:
 * 1. All fields required: latMin, latMax, lonMin, lonMax
 * 2. Latitude range: -90 to 90 degrees
 * 3. Longitude range: -180 to 180 degrees
 * 4. North latitude (latMax) must be greater than South latitude (latMin)
 * 5. Longitude wrapping: if lonMin > lonMax, treat as date-line crossing (valid)
 * 6. Empty fields treated as invalid (user must provide values)
 *
 * @param {BoundingBox} bounds - Spatial bounds to validate
 * @returns {ValidationResult} Validation result with errors
 */
export function validateSpatialBounds(bounds) {
  const errors = [];

  // Check if all fields are provided
  if (
    bounds.latMin === undefined ||
    bounds.latMin === null ||
    bounds.latMin === '' ||
    bounds.latMax === undefined ||
    bounds.latMax === null ||
    bounds.latMax === '' ||
    bounds.lonMin === undefined ||
    bounds.lonMin === null ||
    bounds.lonMin === '' ||
    bounds.lonMax === undefined ||
    bounds.lonMax === null ||
    bounds.lonMax === ''
  ) {
    // errors.push('All spatial fields are required');
    return { valid: false, errors };
  }

  // Convert to numbers for validation
  const latMin = Number(bounds.latMin);
  const latMax = Number(bounds.latMax);
  const lonMin = Number(bounds.lonMin);
  const lonMax = Number(bounds.lonMax);

  if (latMin < -90) {
    errors.push(messages.belowMin('Start Latitude', -90));
  }
  if (latMin > 90) {
    errors.push(messages.aboveMax('Start Latitude', 90));
  }
  if (latMax < -90) {
    errors.push(messages.belowMin('End Latitude', -90));
  }
  if (latMax > 90) {
    errors.push(messages.aboveMax('End Latitude', 90));
  }

  if (lonMin < -180) {
    errors.push(messages.belowMin('Start Longitude', -180));
  }
  if (lonMin > 180) {
    errors.push(messages.aboveMax('Start Longitude', 180));
  }
  if (lonMax < -180) {
    errors.push(messages.belowMin('End Longitude', -180));
  }
  if (lonMax > 180) {
    errors.push(messages.aboveMax('End Longitude', 180));
  }

  if (latMax <= latMin) {
    errors.push(messages.rangeInverted('Start Latitude', 'End Latitude'));
  }

  // Note: We do NOT validate lonMin < lonMax because date-line crossing is valid

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates temporal range constraints
 *
 * Rules (when temporal constraints enabled):
 * 1. Both timeMin and timeMax required
 * 2. Must be valid Date objects
 * 3. Start date must be less than or equal to end date
 * 4. Dates must not be NaN
 * 5. Empty/null fields treated as invalid when constraints enabled
 *
 * @param {TemporalConstraints} constraints - Temporal constraints to validate
 * @returns {ValidationResult} Validation result with errors
 */
export function validateTemporalRange(constraints) {
  const errors = [];

  // If not enabled, always valid
  if (!constraints.enabled) {
    return { valid: true, errors: [] };
  }

  if (!constraints.timeMin || !constraints.timeMax) {
    if (!constraints.timeMin) {
      errors.push(messages.required('Start Date'));
    }
    if (!constraints.timeMax) {
      errors.push(messages.required('End Date'));
    }
    return { valid: false, errors };
  }

  let startDate = constraints.timeMin;
  let endDate = constraints.timeMax;

  if (isNaN(startDate.getTime())) {
    errors.push(messages.invalidDate('Start Date'));
  }
  if (isNaN(endDate.getTime())) {
    errors.push(messages.invalidDate('End Date'));
  }

  if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate > endDate) {
    errors.push(messages.dateRangeInverted());
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates depth range constraints
 *
 * Rules (when depth constraints enabled):
 * 1. Both depthMin and depthMax required
 * 2. Must be numeric values
 * 3. Minimum depth must be less than or equal to maximum depth
 * 4. Typically positive values (below sea surface)
 * 5. Empty fields treated as invalid when constraints enabled
 *
 * @param {DepthConstraints} constraints - Depth constraints to validate
 * @returns {ValidationResult} Validation result with errors
 */
export function validateDepthRange(constraints) {
  const errors = [];

  // If not enabled, always valid
  if (!constraints.enabled) {
    return { valid: true, errors: [] };
  }

  let minMissing = constraints.depthMin === undefined || constraints.depthMin === null || constraints.depthMin === '';
  let maxMissing = constraints.depthMax === undefined || constraints.depthMax === null || constraints.depthMax === '';

  if (minMissing || maxMissing) {
    if (minMissing) {
      errors.push(messages.required('Min Depth'));
    }
    if (maxMissing) {
      errors.push(messages.required('Max Depth'));
    }
    return { valid: false, errors };
  }

  let depthMin = Number(constraints.depthMin);
  let depthMax = Number(constraints.depthMax);

  if (isNaN(depthMin)) {
    errors.push(messages.invalidNumber('Min Depth'));
  }
  if (isNaN(depthMax)) {
    errors.push(messages.invalidNumber('Max Depth'));
  }

  if (!isNaN(depthMin) && depthMin < 0) {
    errors.push(messages.belowMin('Min Depth', 0));
  }

  if (!isNaN(depthMax) && depthMax < 0) {
    errors.push(messages.belowMin('Max Depth', 0));
  }

  if (!isNaN(depthMin) && !isNaN(depthMax) && depthMin > depthMax) {
    errors.push(messages.rangeInverted('Min Depth', 'Max Depth'));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if spatial bounds are valid (boolean only)
 * @param {BoundingBox} bounds - Spatial bounds to validate
 * @returns {boolean} True if valid
 */
export function isValidSpatialBounds(bounds) {
  return validateSpatialBounds(bounds).valid;
}

/**
 * Check if temporal constraints are valid (boolean only)
 * @param {TemporalConstraints} constraints - Temporal constraints to validate
 * @returns {boolean} True if valid
 */
export function isValidTemporalRange(constraints) {
  return validateTemporalRange(constraints).valid;
}

/**
 * Check if depth constraints are valid (boolean only)
 * @param {DepthConstraints} constraints - Depth constraints to validate
 * @returns {boolean} True if valid
 */
export function isValidDepthRange(constraints) {
  return validateDepthRange(constraints).valid;
}
