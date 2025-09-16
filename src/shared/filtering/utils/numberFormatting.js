// Single source of truth for number formatting in range controls
// Handles precision issues and consistent decimal place formatting

/**
 * Format latitude values to 1 decimal place
 * @param {number} value - Latitude value
 * @returns {number} Formatted latitude
 */
const formatLatitude = (value) => Math.round(value * 10) / 10;

/**
 * Format longitude values to 1 decimal place
 * @param {number} value - Longitude value
 * @returns {number} Formatted longitude
 */
const formatLongitude = (value) => Math.round(value * 10) / 10;

export { formatLatitude, formatLongitude };
