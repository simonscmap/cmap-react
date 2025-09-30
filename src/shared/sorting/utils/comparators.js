import { getNestedValue } from './helpers';

/**
 * String comparator with locale support for case-insensitive comparison.
 *
 * @param {string} a - First string to compare
 * @param {string} b - Second string to compare
 * @returns {number} -1 if a < b, 1 if a > b, 0 if equal
 */
export const stringComparator = (a, b) => {
  // Handle null/undefined values
  if (a == null && b == null) return 0;
  if (a == null) return 1; // nulls sort to the end
  if (b == null) return -1;

  // Convert to strings and use locale-aware comparison
  const strA = String(a);
  const strB = String(b);

  return strA.localeCompare(strB, undefined, {
    sensitivity: 'base', // Case-insensitive
    numeric: true, // Handle numbers in strings naturally
  });
};

/**
 * Number comparator for numeric values.
 *
 * @param {number|string} a - First number to compare
 * @param {number|string} b - Second number to compare
 * @returns {number} -1 if a < b, 1 if a > b, 0 if equal
 */
export const numberComparator = (a, b) => {
  // Handle null/undefined values
  if (a == null && b == null) return 0;
  if (a == null) return 1; // nulls sort to the end
  if (b == null) return -1;

  // Convert to numbers (handles string numbers via coercion)
  const numA = Number(a);
  const numB = Number(b);

  // Handle NaN cases
  if (isNaN(numA) && isNaN(numB)) return 0;
  if (isNaN(numA)) return 1;
  if (isNaN(numB)) return -1;

  return numA - numB;
};

/**
 * Percent comparator for percentage strings (e.g., "95%", "87.5%").
 * Parses the percentage value and compares numerically.
 *
 * @param {string} a - First percentage string to compare
 * @param {string} b - Second percentage string to compare
 * @returns {number} -1 if a < b, 1 if a > b, 0 if equal
 */
export const percentComparator = (a, b) => {
  // Handle null/undefined values
  if (a == null && b == null) return 0;
  if (a == null) return 1; // nulls sort to the end
  if (b == null) return -1;

  // Parse percentage strings by removing '%' and converting to number
  const parsePercent = (value) => {
    const str = String(value).trim();
    // Remove '%' if present and parse as float
    const num = parseFloat(str.replace('%', ''));
    return isNaN(num) ? 0 : num;
  };

  const numA = parsePercent(a);
  const numB = parsePercent(b);

  return numA - numB;
};

/**
 * Date comparator for date strings and Date objects.
 *
 * @param {string|Date} a - First date to compare
 * @param {string|Date} b - Second date to compare
 * @returns {number} -1 if a < b, 1 if a > b, 0 if equal
 */
export const dateComparator = (a, b) => {
  // Handle null/undefined values
  if (a == null && b == null) return 0;
  if (a == null) return 1; // nulls sort to the end
  if (b == null) return -1;

  // Convert to Date objects if strings
  const dateA = a instanceof Date ? a : new Date(a);
  const dateB = b instanceof Date ? b : new Date(b);

  // Handle invalid dates
  const timeA = dateA.getTime();
  const timeB = dateB.getTime();

  if (isNaN(timeA) && isNaN(timeB)) return 0;
  if (isNaN(timeA)) return 1;
  if (isNaN(timeB)) return -1;

  return timeA - timeB;
};

/**
 * Wraps a custom comparator function to ensure consistent behavior.
 *
 * @param {Function} comparatorFn - Custom comparator function
 * @returns {Function} Wrapped comparator
 */
export const customComparator = (comparatorFn) => {
  return (a, b) => {
    // Handle null/undefined values before passing to custom function
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;

    return comparatorFn(a, b);
  };
};

/**
 * Factory function that creates a comparator based on field configuration.
 * This is the main entry point for creating comparators in the sorting subsystem.
 *
 * @param {Object} fieldConfig - Field configuration object
 * @param {string} fieldConfig.key - Field key/identifier
 * @param {string} fieldConfig.type - Field type (string, number, percent, date, custom)
 * @param {string} [fieldConfig.path] - Dot-notation path for nested values (defaults to key)
 * @param {Function} [fieldConfig.compare] - Custom comparator function for type="custom"
 * @param {boolean} [fieldConfig.nullsFirst] - If true, null values sort to the beginning
 * @param {string} direction - Sort direction ("asc" or "desc")
 * @returns {Function} Comparator function that accepts two data objects
 *
 * @example
 * const config = { key: "name", type: "string", path: "user.name" };
 * const comparator = createComparator(config, "asc");
 * data.sort(comparator);
 */
export const createComparator = (fieldConfig, direction) => {
  const {
    type,
    path,
    key,
    compare: customFn,
    nullsFirst = false,
  } = fieldConfig;
  const fieldPath = path || key;

  // Select base comparator by type
  let baseComparator;
  switch (type) {
    case 'string':
      baseComparator = stringComparator;
      break;
    case 'number':
      baseComparator = numberComparator;
      break;
    case 'percent':
      baseComparator = percentComparator;
      break;
    case 'date':
      baseComparator = dateComparator;
      break;
    case 'custom':
      if (typeof customFn !== 'function') {
        throw new Error(
          `Custom comparator required for field "${key}" with type "custom"`,
        );
      }
      baseComparator = customComparator(customFn);
      break;
    default:
      throw new Error(`Unknown comparator type "${type}" for field "${key}"`);
  }

  // Return final comparator that extracts nested values and applies direction
  return (objA, objB) => {
    // For custom comparators, pass the entire objects
    if (type === 'custom') {
      const result = baseComparator(objA, objB);
      return direction === 'desc' ? -result : result;
    }

    const valueA = getNestedValue(objA, fieldPath);
    const valueB = getNestedValue(objB, fieldPath);

    // Handle null filtering based on nullsFirst flag
    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return nullsFirst ? -1 : 1;
    if (valueB == null) return nullsFirst ? 1 : -1;

    // Apply base comparator
    const result = baseComparator(valueA, valueB);

    // Apply direction (desc reverses the comparison)
    return direction === 'desc' ? -result : result;
  };
};
