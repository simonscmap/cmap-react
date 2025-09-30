import { useMemo, useState, useEffect } from 'react';
import { createSortStore } from './useSortStore';
import { createComparator } from '../utils/comparators';

/**
 * Primary hook for integrating sorting functionality into React components.
 * Manages sort state and provides a comparator function for data sorting.
 *
 * @param {Object} config - Sort configuration object
 * @param {Array} config.fields - Array of field metadata objects
 * @param {Object} [config.defaultSort] - Optional default sort settings
 * @param {string} [config.defaultSort.field] - Field key to sort by default
 * @param {string} [config.defaultSort.direction] - Default direction ('asc' or 'desc')
 * @param {string} config.uiPattern - UI pattern ('dropdown-headers' or 'headers-only')
 * @returns {Object} Sorting API with activeSort, comparator, actions, and config
 *
 * @example
 * const config = {
 *   fields: [
 *     { key: 'name', label: 'Name', type: 'string' },
 *     { key: 'date', label: 'Date', type: 'date' }
 *   ],
 *   uiPattern: 'dropdown-headers'
 * };
 *
 * const { activeSort, comparator, setSort, toggleDirection } = useSorting(config);
 * const sortedData = [...data].sort(comparator);
 */
export const useSorting = (config) => {
  // Validate config immediately to throw errors synchronously
  if (!config) {
    throw new Error('Sort configuration is required');
  }

  // Validate and memoize configuration to ensure stable reference
  const memoizedConfig = useMemo(() => {
    validateConfiguration(config);
    return config;
  }, [config]);

  // Create store instance (memoized to avoid recreating on every render)
  const store = useMemo(
    () => createSortStore(memoizedConfig),
    [memoizedConfig],
  );

  // Subscribe to store state using useState + useEffect pattern for React 16
  const [sortState, setSortState] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setSortState(store.getState());
    });
    return unsubscribe;
  }, [store]);

  // Extract state and actions from store
  const { activeField, direction, setSort, toggleDirection, resetToDefault } =
    sortState;

  // Build activeSort descriptor for UI rendering
  const activeSort = useMemo(() => {
    const fieldConfig = activeField
      ? memoizedConfig.fields.find((f) => f.key === activeField)
      : null;

    return {
      field: activeField,
      direction: direction,
      fieldConfig: fieldConfig || null,
    };
  }, [activeField, direction, memoizedConfig.fields]);

  // Generate comparator function based on current sort state
  const comparator = useMemo(() => {
    // If no active field, return no-op comparator (maintains original order)
    if (!activeField) {
      return () => 0;
    }

    // Find field configuration
    const fieldConfig = memoizedConfig.fields.find(
      (f) => f.key === activeField,
    );

    if (!fieldConfig) {
      // Should never happen due to validation in setSort action
      console.warn(
        `Field '${activeField}' not found in configuration. Returning no-op comparator.`,
      );
      return () => 0;
    }

    // Create and return comparator for current field and direction
    return createComparator(fieldConfig, direction);
  }, [activeField, direction, memoizedConfig.fields]);

  // Return public API
  return {
    activeSort,
    comparator,
    setSort,
    toggleDirection,
    resetToDefault,
    config: memoizedConfig,
  };
};

/**
 * Validates the sort configuration object.
 * Throws errors if configuration is invalid.
 *
 * @param {Object} config - Sort configuration to validate
 * @throws {Error} If configuration is invalid
 */
function validateConfiguration(config) {
  // Check config exists
  if (!config) {
    throw new Error('Sort configuration is required');
  }

  // Check fields array exists and is not empty
  if (!config.fields || !Array.isArray(config.fields)) {
    throw new Error('Sort configuration must have a "fields" array property');
  }

  if (config.fields.length === 0) {
    throw new Error('Sort configuration must have at least one field');
  }

  // Check all field keys are unique
  const fieldKeys = config.fields.map((field) => field.key);
  const uniqueKeys = new Set(fieldKeys);
  if (uniqueKeys.size !== fieldKeys.length) {
    const duplicates = fieldKeys.filter(
      (key, index) => fieldKeys.indexOf(key) !== index,
    );
    throw new Error(
      `Sort field keys must be unique. Duplicate keys found: ${duplicates.join(', ')}`,
    );
  }

  // Validate each field has required properties
  config.fields.forEach((field, index) => {
    if (!field.key || typeof field.key !== 'string') {
      throw new Error(
        `Field at index ${index} must have a non-empty string "key" property`,
      );
    }

    if (!field.label || typeof field.label !== 'string') {
      throw new Error(
        `Field "${field.key}" must have a non-empty string "label" property`,
      );
    }

    if (!field.type || typeof field.type !== 'string') {
      throw new Error(`Field "${field.key}" must have a "type" property`);
    }

    // If type is 'custom', ensure compare function exists
    if (field.type === 'custom' && typeof field.compare !== 'function') {
      throw new Error(
        `Field '${field.key}' has type 'custom' but no compare function provided`,
      );
    }
  });

  // If defaultSort provided, validate it
  if (config.defaultSort) {
    const { field, direction } = config.defaultSort;

    // Check default field exists
    if (!field || typeof field !== 'string') {
      throw new Error('defaultSort.field must be a non-empty string');
    }

    const fieldExists = config.fields.some((f) => f.key === field);
    if (!fieldExists) {
      throw new Error(
        `Default sort field '${field}' not found in fields array. Available fields: ${config.fields.map((f) => f.key).join(', ')}`,
      );
    }

    // Check direction is valid (if provided)
    if (direction && direction !== 'asc' && direction !== 'desc') {
      throw new Error(
        `defaultSort.direction must be 'asc' or 'desc', got '${direction}'`,
      );
    }
  }

  // Validate uiPattern
  if (!config.uiPattern) {
    throw new Error('Sort configuration must have a "uiPattern" property');
  }

  const validPatterns = ['dropdown-headers', 'headers-only'];
  if (!validPatterns.includes(config.uiPattern)) {
    throw new Error(
      `uiPattern must be one of: ${validPatterns.join(', ')}. Got '${config.uiPattern}'`,
    );
  }
}
