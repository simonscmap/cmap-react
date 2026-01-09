/**
 * Query Schema and Constants
 *
 * Defines the structure, defaults, and validation for catalog search queries.
 * These queries are sent to the SQLite worker for execution.
 */

/**
 * Search modes
 * @enum {string}
 */
export const SEARCH_MODES = {
  /** Case-insensitive pattern matching (default) */
  LIKE: 'like',
  /** Full-text search with ranking */
  FTS: 'fts',
};

/**
 * Date range presets
 * @enum {string}
 */
export const DATE_RANGE_PRESETS = {
  /** No temporal filtering */
  ANY: 'Any Date',
  /** Filter to datasets with data from the last year */
  LAST_YEAR: 'Last Year',
  /** Filter to datasets with data from the last 5 years */
  LAST_5_YEARS: 'Last 5 Years',
  /** Use custom date range from temporal filter */
  CUSTOM: 'Custom Range',
};

/**
 * Dataset type filters
 * @enum {string}
 */
export const DATASET_TYPES = {
  /** No dataset type filtering */
  ALL: 'All Types',
  /** Model-generated datasets */
  MODEL: 'Model',
  /** Satellite observation datasets */
  SATELLITE: 'Satellite',
  /** In-situ measurement datasets */
  IN_SITU: 'In-Situ',
};

/**
 * Default query values
 * @constant
 */
export const DEFAULTS = {
  /** Default search mode (LIKE is faster and more predictable) */
  searchMode: SEARCH_MODES.LIKE,
  /** Default phrase matching (false = keyword AND logic) */
  phraseMatch: false,
  /** Default spatial overlap mode (true = partial overlaps included) */
  includePartialOverlaps: true,
  /** Default pagination limit */
  limit: 2000,
  /** Default pagination offset */
  offset: 0,
  /** Default ranking usage (true for FTS mode) */
  useRanking: true,
  /** Default excluded fields (none) */
  excludeFields: [],
};

/**
 * Query limits and constraints
 *
 * IMPORTANT: These limits are the single source of truth.
 * The worker trusts these limits and does not enforce its own.
 *
 * @constant
 */
export const LIMITS = {
  /** Maximum allowed result limit */
  MAX_LIMIT: 2000,
  /** Default result limit */
  DEFAULT_LIMIT: 2000,
  /** Minimum offset value */
  MIN_OFFSET: 0,
};

/**
 * Validate a search query object
 * @param {object} query - Query object to validate
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
export function validateQuery(query) {
  const errors = [];

  // Validate search mode
  if (
    query.searchMode &&
    !Object.values(SEARCH_MODES).includes(query.searchMode)
  ) {
    errors.push(
      `Invalid searchMode: ${query.searchMode}. Must be one of: ${Object.values(SEARCH_MODES).join(', ')}`,
    );
  }

  // Validate date range preset
  if (
    query.dateRangePreset &&
    !Object.values(DATE_RANGE_PRESETS).includes(query.dateRangePreset)
  ) {
    errors.push(
      `Invalid dateRangePreset: ${query.dateRangePreset}. Must be one of: ${Object.values(DATE_RANGE_PRESETS).join(', ')}`,
    );
  }

  // Validate dataset type (string or array of strings)
  if (query.datasetType) {
    if (Array.isArray(query.datasetType)) {
      // Validate each type in the array
      const invalidTypes = query.datasetType.filter(
        (type) => !Object.values(DATASET_TYPES).includes(type),
      );
      if (invalidTypes.length > 0) {
        errors.push(
          `Invalid datasetType values: ${invalidTypes.join(', ')}. Must be one of: ${Object.values(DATASET_TYPES).join(', ')}`,
        );
      }
    } else if (!Object.values(DATASET_TYPES).includes(query.datasetType)) {
      // Validate single type string
      errors.push(
        `Invalid datasetType: ${query.datasetType}. Must be one of: ${Object.values(DATASET_TYPES).join(', ')}`,
      );
    }
  }

  // Validate limit
  if (query.limit !== undefined && query.limit !== null) {
    if (typeof query.limit !== 'number' || query.limit < 1) {
      errors.push(`Invalid limit: ${query.limit}. Must be a positive number.`);
    } else if (query.limit > LIMITS.MAX_LIMIT) {
      errors.push(
        `Invalid limit: ${query.limit}. Must not exceed ${LIMITS.MAX_LIMIT}.`,
      );
    }
  }

  // Validate offset
  if (query.offset !== undefined && query.offset !== null) {
    if (typeof query.offset !== 'number' || query.offset < LIMITS.MIN_OFFSET) {
      errors.push(
        `Invalid offset: ${query.offset}. Must be a non-negative number.`,
      );
    }
  }

  // Validate spatial bounds
  if (query.spatial) {
    const { latMin, latMax, lonMin, lonMax } = query.spatial;

    if (latMin !== undefined && latMin !== null) {
      if (typeof latMin !== 'number' || latMin < -90 || latMin > 90) {
        errors.push(
          `Invalid spatial.latMin: ${latMin}. Must be between -90 and 90.`,
        );
      }
    }

    if (latMax !== undefined && latMax !== null) {
      if (typeof latMax !== 'number' || latMax < -90 || latMax > 90) {
        errors.push(
          `Invalid spatial.latMax: ${latMax}. Must be between -90 and 90.`,
        );
      }
    }

    if (lonMin !== undefined && lonMin !== null) {
      if (typeof lonMin !== 'number' || lonMin < -180 || lonMin > 180) {
        errors.push(
          `Invalid spatial.lonMin: ${lonMin}. Must be between -180 and 180.`,
        );
      }
    }

    if (lonMax !== undefined && lonMax !== null) {
      if (typeof lonMax !== 'number' || lonMax < -180 || lonMax > 180) {
        errors.push(
          `Invalid spatial.lonMax: ${lonMax}. Must be between -180 and 180.`,
        );
      }
    }

    // Validate min/max relationships
    if (
      latMin !== undefined &&
      latMax !== undefined &&
      latMin !== null &&
      latMax !== null
    ) {
      if (latMin > latMax) {
        errors.push(
          `Invalid spatial bounds: latMin (${latMin}) must be <= latMax (${latMax}).`,
        );
      }
    }
  }

  // Validate temporal bounds
  if (query.temporal) {
    const { timeMin, timeMax } = query.temporal;

    // Check ISO 8601 date format (basic validation)
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}/;

    if (timeMin && !isoDatePattern.test(timeMin)) {
      errors.push(
        `Invalid temporal.timeMin: ${timeMin}. Must be ISO 8601 date format (YYYY-MM-DD).`,
      );
    }

    if (timeMax && !isoDatePattern.test(timeMax)) {
      errors.push(
        `Invalid temporal.timeMax: ${timeMax}. Must be ISO 8601 date format (YYYY-MM-DD).`,
      );
    }

    // Validate min/max relationship
    if (timeMin && timeMax && timeMin > timeMax) {
      errors.push(
        `Invalid temporal bounds: timeMin (${timeMin}) must be <= timeMax (${timeMax}).`,
      );
    }
  }

  // Validate depth bounds
  if (query.depth) {
    const { depthMin, depthMax } = query.depth;

    if (
      depthMin !== undefined &&
      depthMin !== null &&
      typeof depthMin !== 'number'
    ) {
      errors.push(`Invalid depth.depthMin: ${depthMin}. Must be a number.`);
    }

    if (
      depthMax !== undefined &&
      depthMax !== null &&
      typeof depthMax !== 'number'
    ) {
      errors.push(`Invalid depth.depthMax: ${depthMax}. Must be a number.`);
    }

    // Validate min/max relationship
    if (
      depthMin !== undefined &&
      depthMax !== undefined &&
      depthMin !== null &&
      depthMax !== null
    ) {
      if (depthMin > depthMax) {
        errors.push(
          `Invalid depth bounds: depthMin (${depthMin}) must be <= depthMax (${depthMax}).`,
        );
      }
    }
  }

  // Validate excludeFields
  if (query.excludeFields) {
    if (!Array.isArray(query.excludeFields)) {
      errors.push('Invalid excludeFields: Must be an array of field names.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
