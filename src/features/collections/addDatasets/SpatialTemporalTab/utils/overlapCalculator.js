/**
 * Overlap Calculator
 *
 * Pure functions for calculating overlap coverage percentages and formatting
 * overlap extent strings across spatial, temporal, and depth dimensions.
 *
 * These functions compute how much of a user's bounding box is covered by
 * each dataset, supporting spatial-temporal overlap search functionality.
 */

/**
 * Calculate the percentage of the user's spatial bounding box that is covered by a dataset.
 *
 * Uses a simplified rectangular approximation to calculate the area of overlap
 * between the user's spatial constraints and the dataset's spatial extent.
 *
 * @param {Object} userBounds - User-defined spatial constraints
 * @param {number} userBounds.latMin - Minimum latitude (-90 to 90)
 * @param {number} userBounds.latMax - Maximum latitude (-90 to 90)
 * @param {number} userBounds.lonMin - Minimum longitude (-180 to 180)
 * @param {number} userBounds.lonMax - Maximum longitude (-180 to 180)
 * @param {Object} datasetBounds - Dataset spatial extent
 * @param {number} datasetBounds.latMin - Dataset minimum latitude
 * @param {number} datasetBounds.latMax - Dataset maximum latitude
 * @param {number} datasetBounds.lonMin - Dataset minimum longitude
 * @param {number} datasetBounds.lonMax - Dataset maximum longitude
 * @returns {number} Percentage from 0 to 100 representing coverage of user's bounding box
 *
 * @example
 * const userBounds = { latMin: 68, latMax: 74, lonMin: -75, lonMax: -55 };
 * const datasetBounds = { latMin: 70, latMax: 76, lonMin: -80, lonMax: -60 };
 * const coverage = calculateSpatialCoverage(userBounds, datasetBounds);
 * // Returns approximately 80 (80% of user's box is covered)
 */
export function calculateSpatialCoverage(userBounds, datasetBounds) {
  // Handle invalid or missing bounds
  if (!userBounds || !datasetBounds) {
    return 0;
  }

  // Validate bounds
  if (userBounds.latMin > userBounds.latMax) {
    return 0;
  }

  // Handle date line crossing for user bounds
  let userLonMin = userBounds.lonMin;
  let userLonMax = userBounds.lonMax;
  let datasetLonMin = datasetBounds.lonMin;
  let datasetLonMax = datasetBounds.lonMax;

  // If user bounds cross the date line (lonMin > lonMax)
  if (userLonMin > userLonMax) {
    // Normalize to 0-360 range
    userLonMin = userLonMin;
    userLonMax = userLonMax + 360;

    // Normalize dataset bounds to same range
    if (datasetLonMin < 0) {
      datasetLonMin = datasetLonMin + 360;
    }
    if (datasetLonMax < 0) {
      datasetLonMax = datasetLonMax + 360;
    }
  }

  // Calculate intersection rectangle
  const overlapLatMin = Math.max(userBounds.latMin, datasetBounds.latMin);
  const overlapLatMax = Math.min(userBounds.latMax, datasetBounds.latMax);
  const overlapLonMin = Math.max(userLonMin, datasetLonMin);
  const overlapLonMax = Math.min(userLonMax, datasetLonMax);

  // Check if there's no overlap
  if (overlapLatMin > overlapLatMax || overlapLonMin > overlapLonMax) {
    return 0;
  }

  // Calculate areas using simplified rectangular approximation
  const overlapArea =
    (overlapLatMax - overlapLatMin) * (overlapLonMax - overlapLonMin);
  const userArea =
    (userBounds.latMax - userBounds.latMin) * (userLonMax - userLonMin);

  // Avoid division by zero
  if (userArea === 0) {
    return 0;
  }

  // Calculate and return ratio (0-1 range, rounded to 2 decimal places)
  const ratio = overlapArea / userArea;
  const clamped = Math.min(1, Math.max(0, ratio)); // Clamp between 0-1
  return Math.round(clamped * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate the percentage of the user's temporal range that is covered by a dataset.
 *
 * Computes the overlap between user-defined date range and dataset's temporal extent.
 * Monthly Climatology datasets always return 100% coverage as they apply to all time periods.
 *
 * @param {Object} userRange - User-defined temporal constraints
 * @param {Date} userRange.timeMin - Minimum date (Date object)
 * @param {Date} userRange.timeMax - Maximum date (Date object)
 * @param {Object} datasetRange - Dataset temporal extent
 * @param {Date} datasetRange.timeMin - Dataset start date (Date object)
 * @param {Date} datasetRange.timeMax - Dataset end date (Date object)
 * @param {boolean} [isClimatology=false] - Whether dataset is Monthly Climatology
 * @returns {number} Percentage from 0 to 100 representing coverage of user's date range
 *
 * @example
 * const userRange = { timeMin: new Date('2020-01-01'), timeMax: new Date('2023-12-31') };
 * const datasetRange = { timeMin: new Date('2020-03-01'), timeMax: new Date('2023-09-30') };
 * const coverage = calculateTemporalCoverage(userRange, datasetRange, false);
 * // Returns approximately 88 (88% of user's period is covered)
 */
export function calculateTemporalCoverage(
  userRange,
  datasetRange,
  isClimatology = false,
) {
  // Monthly Climatology datasets cover all time periods (return 1.0 = 100%)
  if (isClimatology) {
    return 1.0;
  }

  // Handle invalid or missing ranges
  if (
    !userRange ||
    !datasetRange ||
    !userRange.timeMin ||
    !userRange.timeMax ||
    !datasetRange.timeMin ||
    !datasetRange.timeMax
  ) {
    return 0;
  }

  // Use Date objects directly (no conversion needed)
  const userStart = userRange.timeMin;
  const userEnd = userRange.timeMax;
  const datasetStart = datasetRange.timeMin;
  const datasetEnd = datasetRange.timeMax;

  // Validate dates
  if (
    isNaN(userStart.getTime()) ||
    isNaN(userEnd.getTime()) ||
    isNaN(datasetStart.getTime()) ||
    isNaN(datasetEnd.getTime())
  ) {
    return 0;
  }

  // Calculate overlap period
  const overlapStart = Math.max(userStart.getTime(), datasetStart.getTime());
  const overlapEnd = Math.min(userEnd.getTime(), datasetEnd.getTime());

  // Check if there's no overlap
  if (overlapStart > overlapEnd) {
    return 0;
  }

  // Calculate days
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const overlapDays = (overlapEnd - overlapStart) / millisecondsPerDay;
  const userDays =
    (userEnd.getTime() - userStart.getTime()) / millisecondsPerDay;

  // Avoid division by zero
  if (userDays === 0) {
    return 1.0; // Single day, fully covered (1.0 = 100%)
  }

  // Calculate and return ratio (0-1 range, rounded to 2 decimal places)
  const ratio = overlapDays / userDays;
  const clamped = Math.min(1, Math.max(0, ratio)); // Clamp between 0-1
  return Math.round(clamped * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate the percentage of the user's depth range that is covered by a dataset.
 *
 * Computes the overlap between user-defined depth constraints and dataset's depth extent.
 * Returns "N/A" for datasets with no depth data (NULL depth).
 *
 * @param {Object} userRange - User-defined depth constraints
 * @param {number} userRange.depthMin - Minimum depth in meters
 * @param {number} userRange.depthMax - Maximum depth in meters
 * @param {Object|null} datasetRange - Dataset depth extent (null if no depth data)
 * @param {number} datasetRange.depthMin - Dataset minimum depth
 * @param {number} datasetRange.depthMax - Dataset maximum depth
 * @returns {number|string} Percentage from 0 to 100, or "N/A" if dataset has no depth data
 *
 * @example
 * const userRange = { depthMin: 0, depthMax: 1000 };
 * const datasetRange = { depthMin: 0, depthMax: 500 };
 * const coverage = calculateDepthCoverage(userRange, datasetRange);
 * // Returns 50 (50% of user's depth range is covered)
 *
 * @example
 * const noDepth = null;
 * const coverageNA = calculateDepthCoverage(userRange, noDepth);
 * // Returns "N/A"
 */
export function calculateDepthCoverage(userRange, datasetRange) {
  // Return "N/A" for datasets with no depth data
  if (datasetRange === null || datasetRange === undefined) {
    return 'N/A';
  }

  // Handle invalid or missing ranges
  if (
    !userRange ||
    userRange.depthMin === undefined ||
    userRange.depthMax === undefined ||
    datasetRange.depthMin === undefined ||
    datasetRange.depthMax === undefined
  ) {
    return 'N/A';
  }

  // Validate depth values
  if (
    userRange.depthMin > userRange.depthMax ||
    datasetRange.depthMin > datasetRange.depthMax ||
    userRange.depthMin < 0 ||
    datasetRange.depthMin < 0
  ) {
    return 0;
  }

  // Calculate overlap range
  const overlapMin = Math.max(userRange.depthMin, datasetRange.depthMin);
  const overlapMax = Math.min(userRange.depthMax, datasetRange.depthMax);

  // Check if there's no overlap
  if (overlapMin > overlapMax) {
    return 0;
  }

  // Calculate ranges
  const overlapRange = overlapMax - overlapMin;
  const userRangeSize = userRange.depthMax - userRange.depthMin;

  // Avoid division by zero
  if (userRangeSize === 0) {
    return 1.0; // Single depth point, fully covered (1.0 = 100%)
  }

  // Calculate and return ratio (0-1 range, rounded to 2 decimal places)
  const ratio = overlapRange / userRangeSize;
  const clamped = Math.min(1, Math.max(0, ratio)); // Clamp between 0-1
  return Math.round(clamped * 100) / 100; // Round to 2 decimal places
}

/**
 * Format the spatial overlap bounds as a human-readable string with hemisphere indicators.
 *
 * Converts numeric coordinates to a readable format with N/S for latitude and E/W for longitude.
 * Example output: "68°N-74°N, 55°W-75°W"
 *
 * @param {Object} overlapBounds - Intersection of user and dataset spatial bounds
 * @param {number} overlapBounds.latMin - Minimum latitude
 * @param {number} overlapBounds.latMax - Maximum latitude
 * @param {number} overlapBounds.lonMin - Minimum longitude
 * @param {number} overlapBounds.lonMax - Maximum longitude
 * @returns {string} Formatted string like "68°N-74°N, 55°W-75°W"
 *
 * @example
 * const overlapBounds = { latMin: 68, latMax: 74, lonMin: -75, lonMax: -55 };
 * const formatted = formatSpatialExtent(overlapBounds);
 * // Returns "68°N-74°N, 75°W-55°W"
 */
export function formatSpatialExtent(overlapBounds) {
  // Handle invalid or missing bounds
  if (
    !overlapBounds ||
    overlapBounds.latMin === undefined ||
    overlapBounds.latMax === undefined ||
    overlapBounds.lonMin === undefined ||
    overlapBounds.lonMax === undefined
  ) {
    return '';
  }

  /**
   * Format latitude with N/S indicator
   */
  const formatLat = (lat) => {
    const absLat = Math.abs(lat).toFixed(1);
    const direction = lat >= 0 ? 'N' : 'S';
    return `${absLat}°${direction}`;
  };

  /**
   * Format longitude with E/W indicator
   */
  const formatLon = (lon) => {
    const absLon = Math.abs(lon).toFixed(1);
    const direction = lon >= 0 ? 'E' : 'W';
    return `${absLon}°${direction}`;
  };

  // Format latitude range
  const latRange = `${formatLat(overlapBounds.latMin)}-${formatLat(overlapBounds.latMax)}`;

  // Format longitude range
  const lonRange = `${formatLon(overlapBounds.lonMin)}-${formatLon(overlapBounds.lonMax)}`;

  // Combine into final string
  return `${latRange}, ${lonRange}`;
}

/**
 * Format the temporal overlap range as a human-readable string.
 *
 * Converts Date objects to a readable range format (YYYY-MM-DD).
 * Example output: "2020-03-01 to 2023-09-30"
 *
 * @param {Object} overlapRange - Intersection of user and dataset temporal bounds
 * @param {Date} overlapRange.timeMin - Minimum date (Date object)
 * @param {Date} overlapRange.timeMax - Maximum date (Date object)
 * @returns {string} Formatted string like "2020-03-01 to 2023-09-30"
 *
 * @example
 * const overlapRange = { timeMin: new Date('2020-03-01'), timeMax: new Date('2023-09-30') };
 * const formatted = formatTemporalRange(overlapRange);
 * // Returns "2020-03-01 to 2023-09-30"
 */
export function formatTemporalRange(overlapRange) {
  // Handle invalid or missing range
  if (!overlapRange || !overlapRange.timeMin || !overlapRange.timeMax) {
    return 'N/A';
  }

  // Use Date objects directly
  const startDate = overlapRange.timeMin;
  const endDate = overlapRange.timeMax;

  // Validate dates
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 'N/A';
  }

  // Format as ISO date strings (YYYY-MM-DD)
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);

  // Combine into range string
  return `${formattedStart} to ${formattedEnd}`;
}

/**
 * Format the depth overlap range as a human-readable string with units.
 *
 * Converts numeric depth values to a readable format with meter units.
 * Returns "N/A" for datasets with no depth data.
 * Example output: "0m - 500m"
 *
 * @param {Object|null} overlapRange - Intersection of user and dataset depth bounds (null if no depth data)
 * @param {number} overlapRange.depthMin - Minimum depth
 * @param {number} overlapRange.depthMax - Maximum depth
 * @returns {string} Formatted string like "0m - 500m" or "N/A"
 *
 * @example
 * const overlapRange = { depthMin: 0, depthMax: 500 };
 * const formatted = formatDepthRange(overlapRange);
 * // Returns "0m - 500m"
 *
 * @example
 * const noDepth = null;
 * const formattedNA = formatDepthRange(noDepth);
 * // Returns "N/A"
 */
export function formatDepthRange(overlapRange) {
  // Return "N/A" for datasets with no depth data
  if (overlapRange === null || overlapRange === undefined) {
    return 'N/A';
  }

  // Handle invalid or missing range values
  if (
    overlapRange.depthMin === undefined ||
    overlapRange.depthMax === undefined
  ) {
    return 'N/A';
  }

  // Validate depth values
  if (isNaN(overlapRange.depthMin) || isNaN(overlapRange.depthMax)) {
    return 'N/A';
  }

  /**
   * Format depth with commas for large numbers
   */
  const formatDepth = (depth) => {
    return depth.toLocaleString('en-US');
  };

  const formattedMin = formatDepth(overlapRange.depthMin);
  const formattedMax = formatDepth(overlapRange.depthMax);

  // Return formatted range with units
  return `${formattedMin}m - ${formattedMax}m`;
}
