/**
 * Retrieves a nested value from an object using a dot-notation path.
 *
 * @param {Object} obj - The object to retrieve the value from
 * @param {string} path - The dot-notation path to the desired value (e.g., "user.address.city")
 * @returns {*} The value at the specified path, or undefined if any intermediate property is missing
 *
 * @example
 * const data = { user: { name: "Alice", address: { city: "NYC" } } };
 * getNestedValue(data, "user.address.city"); // "NYC"
 * getNestedValue(data, "user.phone"); // undefined
 * getNestedValue(data, ""); // data
 */
export const getNestedValue = (obj, path) => {
  // Handle null/undefined objects
  if (obj == null) {
    return undefined;
  }

  // Handle empty path - return the object itself
  if (path === '' || path == null) {
    return obj;
  }

  // Split the path and traverse the object
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    // If any intermediate property is missing, return undefined
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = current[key];
  }

  return current;
};
