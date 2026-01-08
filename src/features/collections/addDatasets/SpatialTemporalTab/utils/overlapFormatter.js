/**
 * Overlap Formatter
 *
 * Pure functions for formatting overlap extent strings across spatial, temporal,
 * and depth dimensions.
 *
 * Note: Coverage calculations are performed in SQL queries (see sqlQueryTemplates.js).
 * This module only handles formatting of overlap ranges for display purposes.
 */

import { dateToUTCDateString } from '../../../../../shared/filtering/utils/dateHelpers';

/**
 * Format the spatial overlap bounds as a human-readable string with cardinal direction indicators.
 *
 * Converts numeric coordinates to a readable format with labels. All coordinates are referenced from
 * North (latitude) and East (longitude), with negative values indicating south of equator or west of
 * prime meridian. Output includes "Lat:" and "Lon:" labels on separate lines.
 * Example output: "Lat: 68.0°N-74.0°N\nLon: 75.0°E-55.0°E"
 *
 * @param {Object} overlapBounds - Intersection of user and dataset spatial bounds
 * @param {number} overlapBounds.latMin - Minimum latitude (negative values are south of equator)
 * @param {number} overlapBounds.latMax - Maximum latitude (negative values are south of equator)
 * @param {number} overlapBounds.lonMin - Minimum longitude (negative values are west of prime meridian)
 * @param {number} overlapBounds.lonMax - Maximum longitude (negative values are west of prime meridian)
 * @returns {string} Formatted string with newline separator, like "Lat: 68.0°N-74.0°N\nLon: 75.0°E-55.0°E"
 *
 * @example
 * const overlapBounds = { latMin: 68, latMax: 74, lonMin: -75, lonMax: -55 };
 * const formatted = formatSpatialExtent(overlapBounds);
 * // Returns "Lat: 68.0° to 74.0°\nLon: -75.0° to -55.0°"
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
   * Format coordinate as signed decimal degrees
   */
  const formatCoord = (coord) => {
    return `${coord.toFixed(1)}°`;
  };

  // Format latitude range with label
  const latRange = `Lat: ${formatCoord(overlapBounds.latMin)} to ${formatCoord(overlapBounds.latMax)}`;

  // Format longitude range with label
  const lonRange = `Lon: ${formatCoord(overlapBounds.lonMin)} to ${formatCoord(overlapBounds.lonMax)}`;

  // Combine with newline separator
  return `${latRange}\n${lonRange}`;
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

  const formattedStart = dateToUTCDateString(overlapRange.timeMin);
  const formattedEnd = dateToUTCDateString(overlapRange.timeMax);

  if (!formattedStart || !formattedEnd) {
    return 'N/A';
  }

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
