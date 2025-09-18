// Object Property Access Utilities
// Supports dot notation for nested property access with safe fallbacks

/**
 * Retrieves nested property from object using dot notation path
 * @param {Object} obj - Source object to access
 * @param {string} path - Dot notation path (e.g., 'metadata.title' or 'items[0].name')
 * @param {*} defaultValue - Value to return if property doesn't exist
 * @returns {*} Property value or defaultValue
 */
export const getNestedProperty = (obj, path, defaultValue = undefined) => {
  if (!obj || typeof obj !== 'object' || !path || typeof path !== 'string') {
    return defaultValue;
  }

  try {
    // Split path by dots and handle array notation
    const keys = path.split('.').reduce((acc, key) => {
      // Handle array notation like items[0] or items[0][1]
      if (key.includes('[') && key.includes(']')) {
        const parts = key.split(/[\[\]]+/).filter(Boolean);
        return acc.concat(parts);
      }
      return acc.concat([key]);
    }, []);

    let result = obj;

    for (const key of keys) {
      if (result == null) return defaultValue;

      // Handle numeric keys for arrays
      const numericKey = /^\d+$/.test(key) ? parseInt(key, 10) : key;

      if (Array.isArray(result) && typeof numericKey === 'number') {
        result = result[numericKey];
      } else if (typeof result === 'object' && result.hasOwnProperty(key)) {
        result = result[key];
      } else {
        return defaultValue;
      }
    }

    return result;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safe property access with comprehensive error handling and fallback
 * @param {Object} obj - Source object to access
 * @param {string} path - Property path
 * @param {*} fallbackValue - Fallback value for any access failure
 * @returns {*} Property value or fallbackValue
 */
export const safePropertyAccess = (obj, path, fallbackValue = null) => {
  if (!obj || !path) {
    return fallbackValue;
  }

  try {
    const result = getNestedProperty(obj, path, fallbackValue);
    // Additional safety check for undefined/null results
    return result !== undefined ? result : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
};

/**
 * Extracts searchable text from object properties specified in searchKeys
 * @param {Object} obj - Source object
 * @param {Array<string>} searchKeys - Array of property paths to extract
 * @returns {string} Concatenated searchable text with spaces
 */
export const extractSearchableText = (obj, searchKeys) => {
  if (!obj || !Array.isArray(searchKeys) || searchKeys.length === 0) {
    return '';
  }

  const textValues = searchKeys
    .map((key) => {
      const value = safePropertyAccess(obj, key, '');

      // Convert value to string and handle different types
      if (value === null || value === undefined) {
        return '';
      }

      if (Array.isArray(value)) {
        // Join array values with spaces
        return value
          .map((item) =>
            typeof item === 'object' ? JSON.stringify(item) : String(item),
          )
          .join(' ');
      }

      if (typeof value === 'object') {
        // For objects, try to extract meaningful text
        return JSON.stringify(value);
      }

      return String(value);
    })
    .filter((text) => text && text.trim().length > 0) // Remove empty values
    .map((text) => text.trim());

  return textValues.join(' ');
};
