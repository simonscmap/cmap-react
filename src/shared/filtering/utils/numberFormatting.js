// Single source of truth for number formatting in range controls
// Handles precision issues and consistent decimal place formatting

/**
 * Format a number to a specific decimal precision
 * @param {number} value - The number to format
 * @param {number} precision - Number of decimal places (default: 1)
 * @returns {number} Formatted number with consistent precision
 */
const formatDecimal = (value, precision = 1) => {
  return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
};

/**
 * Format latitude values to 1 decimal place
 * @param {number} value - Latitude value
 * @returns {number} Formatted latitude
 */
const formatLatitude = (value) => formatDecimal(value, 1);

/**
 * Format longitude values to 1 decimal place
 * @param {number} value - Longitude value
 * @returns {number} Formatted longitude
 */
const formatLongitude = (value) => formatDecimal(value, 1);

/**
 * Round value to step with precision-safe arithmetic
 * Fixes floating point precision issues in slider calculations
 * @param {number} value - Value to round
 * @param {number} step - Step size (default: 0.1)
 * @returns {number} Precisely rounded value
 */
const roundToStepPrecise = (value, step = 0.1) => {
  const factor = 1 / step;
  return Math.round(value * factor) / factor;
};

export { formatDecimal, formatLatitude, formatLongitude, roundToStepPrecise };
