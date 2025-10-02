import { createStore } from 'zustand';

/**
 * Factory function that creates a Zustand store instance for managing sort state.
 * Each configuration gets its own store instance to avoid state collisions between screens.
 *
 * @param {Object} config - Sort configuration object
 * @param {Array} config.fields - Array of field metadata objects
 * @param {Object} [config.defaultSort] - Optional default sort settings
 * @param {string} [config.defaultSort.field] - Field key to sort by default
 * @param {string} [config.defaultSort.direction] - Default direction ('asc' or 'desc')
 * @returns {Object} Zustand store instance
 *
 * @example
 * const store = createSortStore({
 *   fields: [
 *     { key: 'name', label: 'Name', type: 'string' },
 *     { key: 'date', label: 'Date', type: 'date' }
 *   ],
 *   defaultSort: { field: 'name', direction: 'asc' }
 * });
 */
export const createSortStore = (config) => {
  // Validate configuration
  validateSortConfiguration(config);

  // Determine initial state based on default configuration
  const initialState = getInitialState(config);

  // Create and return Zustand store
  return createStore((set, get) => ({
    // State
    activeField: initialState.activeField,
    direction: initialState.direction,

    // Store the configuration for validation
    _config: config,

    // Actions
    setSort: (fieldKey) => {
      const { _config } = get();

      // Validate field key exists in configuration
      const fieldExists = _config.fields.some(
        (field) => field.key === fieldKey,
      );
      if (!fieldExists) {
        throw new Error(
          `Field '${fieldKey}' not found in sort configuration. Available fields: ${_config.fields.map((f) => f.key).join(', ')}`,
        );
      }

      // Set new field and reset direction to ascending
      set({
        activeField: fieldKey,
        direction: 'asc',
      });
    },

    toggleDirection: () => {
      const { activeField, direction } = get();

      // Only toggle if there's an active field
      if (activeField === null) {
        return;
      }

      // Toggle between 'asc' and 'desc'
      set({
        direction: direction === 'asc' ? 'desc' : 'asc',
      });
    },

    resetToDefault: () => {
      const { _config } = get();

      // Reset to configured default or null state
      const resetState = getInitialState(_config);
      set({
        activeField: resetState.activeField,
        direction: resetState.direction,
      });
    },
  }));
};

/**
 * Validates sort configuration object.
 * Throws errors if configuration is invalid.
 *
 * @param {Object} config - Sort configuration to validate
 * @throws {Error} If configuration is invalid
 */
function validateSortConfiguration(config) {
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

    // Check direction is valid
    if (direction && direction !== 'asc' && direction !== 'desc') {
      throw new Error(
        `defaultSort.direction must be 'asc' or 'desc', got '${direction}'`,
      );
    }
  }
}

/**
 * Determines initial state based on configuration.
 *
 * @param {Object} config - Sort configuration
 * @returns {Object} Initial state with activeField and direction
 */
function getInitialState(config) {
  // If defaultSort configured, use it
  if (config.defaultSort && config.defaultSort.field) {
    return {
      activeField: config.defaultSort.field,
      direction: config.defaultSort.direction || 'asc',
    };
  }

  // Otherwise start with no active sort
  return {
    activeField: null,
    direction: 'asc',
  };
}
