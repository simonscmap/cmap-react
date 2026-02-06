/**
 * SQL Filter Builders
 *
 * Reusable functions for constructing SQL WHERE clauses and parameter bindings.
 * These builders eliminate code duplication between LIKE mode and FTS mode queries.
 *
 * Each builder returns an object with:
 * - sql: SQL fragment to append to WHERE clause (includes leading AND)
 * - bindings: Object mapping parameter names to values
 *
 * Usage:
 *   const { sql, bindings } = buildSpatialFilter(spatial, includePartialOverlaps);
 *   querySQL += sql;
 *   Object.assign(queryBindings, bindings);
 *
 * NOTE: This file is loaded via importScripts() in a Web Worker context.
 * It exports to self.SqlFilterBuilders instead of using ES6 export syntax.
 */

(function() {
  'use strict';

// Access configuration from global scope
const { SEARCHABLE_FIELDS, FILTER_VALUES } = self.CatalogSearchConfig;

/**
 * Build text search filter for LIKE mode
 *
 * @param {string} text - Search text
 * @param {string[]} fieldsToSearch - Fields to search in
 * @param {boolean} phraseMatch - If true, treat as phrase; if false, split into keywords
 * @param {string} tableAlias - Table alias (default: 'd')
 * @returns {{ sql: string, bindings: object }}
 */
function buildTextSearchFilter(text, fieldsToSearch, phraseMatch = false, tableAlias = 'd') {
  if (!text || !text.trim()) {
    return { sql: '', bindings: {} };
  }

  const bindings = {};
  const trimmedText = text.trim();

  if (phraseMatch) {
    // Treat entire text as single phrase
    const likePattern = `%${trimmedText}%`;

    // Build OR clause across all fields for single phrase
    const conditions = fieldsToSearch
      .map((field) => `${tableAlias}.${field} LIKE $phrase`)
      .join(' OR ');

    const sql = `\n  AND (${conditions})`;
    bindings.$phrase = likePattern;

    return { sql, bindings };
  } else {
    // Split into keywords with AND logic (each keyword must match at least one field)
    const keywords = trimmedText.split(/\s+/).filter((k) => k.length > 0);
    let sql = '';

    keywords.forEach((keyword, idx) => {
      const bindKey = `keyword${idx}`;
      const likePattern = `%${keyword}%`;

      // Build OR clause for each keyword across all fields
      const conditions = fieldsToSearch
        .map((field) => `${tableAlias}.${field} LIKE $${bindKey}`)
        .join(' OR ');

      sql += `\n  AND (${conditions})`;
      bindings[`$${bindKey}`] = likePattern;
    });

    return { sql, bindings };
  }
}

/**
 * Build FTS MATCH query with field exclusion support
 *
 * @param {string} text - Search text
 * @param {string[]} excludeFields - Fields to exclude from search
 * @returns {{ matchQuery: string }} - FTS MATCH query string
 */
function buildFtsMatchQuery(text, excludeFields = []) {
  if (!text || !text.trim()) {
    return { matchQuery: '' };
  }

  const trimmedText = text.trim();

  if (excludeFields && excludeFields.length > 0) {
    // Build field-specific MATCH query
    const fieldsToSearch = SEARCHABLE_FIELDS.fts.filter(
      (f) => !excludeFields.includes(f)
    );

    // FTS5 syntax: {field1 field2}: search_term
    const matchQuery = `{${fieldsToSearch.join(' ')}}: ${trimmedText}`;
    return { matchQuery };
  } else {
    // Search all fields (default)
    return { matchQuery: trimmedText };
  }
}

/**
 * Build data type filter
 *
 * @param {string} datasetType - Dataset type ('Model', 'Satellite', 'In-Situ', 'All Types', or null)
 * @param {string} tableAlias - Table alias (default: 'd')
 * @returns {{ sql: string, bindings: object }}
 */
function buildDataTypeFilter(datasetType, tableAlias = 'd') {
  // Handle null/undefined or 'All Types'
  if (!datasetType || datasetType === FILTER_VALUES.ALL_TYPES) {
    return { sql: '', bindings: {} };
  }

  // Handle array of types (2-3 types selected)
  if (Array.isArray(datasetType)) {
    // If empty array, no filter
    if (datasetType.length === 0) {
      return { sql: '', bindings: {} };
    }

    // If all 3 types, no filter needed (optimization)
    if (datasetType.length === 3) {
      return { sql: '', bindings: {} };
    }

    // Build IN clause for multiple types
    const placeholders = datasetType.map((_, index) => `$datasetType${index}`).join(', ');
    const sql = `\n  AND ${tableAlias}.datasetType IN (${placeholders})`;
    const bindings = {};
    datasetType.forEach((type, index) => {
      bindings[`$datasetType${index}`] = type;
    });

    return { sql, bindings };
  }

  // Handle single type (string)
  const sql = `\n  AND ${tableAlias}.datasetType = $datasetType`;
  const bindings = { $datasetType: datasetType };

  return { sql, bindings };
}

/**
 * Build region filter
 *
 * @param {string} region - Region name ('All Regions' or specific region)
 * @param {string} tableAlias - Table alias (default: 'd')
 * @returns {{ sql: string, bindings: object }}
 */
function buildRegionFilter(region, tableAlias = 'd') {
  if (!region || region === FILTER_VALUES.ALL_REGIONS) {
    return { sql: '', bindings: {} };
  }

  const sql = `\n  AND ${tableAlias}.regions LIKE $region`;
  const bindings = { $region: `%${region}%` };

  return { sql, bindings };
}

/**
 * Build spatial bounds filter (latitude/longitude)
 *
 * Filters for datasets that have any intersection with user bounds (pre-filter).
 * Exact dataset utilization percentage filtering happens via coverage threshold filter.
 *
 * Dataset utilization = percentage of the dataset's spatial extent within the ROI.
 * - Partial overlap: 0 < dataset_utilization < 1.0 (some of dataset is in ROI)
 * - Full containment: dataset_utilization = 1.0 (entire dataset is within ROI)
 *
 * Handles NULL values to match backend behavior.
 *
 * @param {object} spatial - Spatial bounds { latMin, latMax, lonMin, lonMax }
 * @param {boolean} includePartialOverlaps - DEPRECATED: kept for backward compatibility, no longer used
 * @param {string} tableAlias - Table alias (default: 'd')
 * @returns {{ sql: string, bindings: object }}
 */
function buildSpatialFilter(spatial, includePartialOverlaps = true, tableAlias = 'd') {
  if (!spatial) {
    return { sql: '', bindings: {} };
  }

  let sql = '';
  const bindings = {};

  // Latitude bounds - check for any overlap
  // Uses >= and <= to include boundary points (zero-area datasets like points/lines)
  if (spatial.latMin != null && spatial.latMax != null) {
    sql += `\n  AND (${tableAlias}.latMax >= $latMin OR ${tableAlias}.latMin IS NULL)`;
    sql += `\n  AND (${tableAlias}.latMax IS NULL OR ${tableAlias}.latMin <= $latMax)`;
    bindings.$latMin = spatial.latMin;
    bindings.$latMax = spatial.latMax;
  }

  if (spatial.lonMin != null && spatial.lonMax != null) {
    const crossesDateline = spatial.lonMin > spatial.lonMax;

    if (crossesDateline) {
      sql += `\n  AND NOT (${tableAlias}.lonMin > $lonMax AND ${tableAlias}.lonMax < $lonMin)`;
    } else {
      sql += `\n  AND (${tableAlias}.lonMax >= $lonMin OR ${tableAlias}.lonMin IS NULL)`;
      sql += `\n  AND (${tableAlias}.lonMax IS NULL OR ${tableAlias}.lonMin <= $lonMax)`;
    }
    bindings.$lonMin = spatial.lonMin;
    bindings.$lonMax = spatial.lonMax;
  }

  return { sql, bindings };
}

/**
 * Build temporal bounds filter (date ranges)
 *
 * Filters for datasets that have any intersection with user time range (pre-filter).
 * Exact temporal coverage percentage filtering happens via coverage threshold filter.
 *
 * Temporal coverage = percentage of user time range covered by dataset.
 *
 * Handles NULL values to match backend behavior.
 *
 * @param {object} temporal - Temporal bounds { timeMin, timeMax }
 * @param {boolean} includePartialOverlaps - DEPRECATED: kept for backward compatibility, no longer used
 * @param {string} tableAlias - Table alias (default: 'd')
 * @returns {{ sql: string, bindings: object }}
 */
function buildTemporalFilter(temporal, includePartialOverlaps = true, tableAlias = 'd') {
  if (!temporal || !temporal.timeMin || !temporal.timeMax) {
    return { sql: '', bindings: {} };
  }

  let sql = '';
  const bindings = {};

  // Check for any overlap with user time range
  // Uses >= and <= to include boundary points (datasets at exact boundary timestamps)
  sql += `\n  AND (${tableAlias}.timeMax >= $timeMin OR ${tableAlias}.timeMax IS NULL)`;
  sql += `\n  AND (${tableAlias}.timeMax IS NULL OR ${tableAlias}.timeMin <= $timeMax)`;

  bindings.$timeMin = temporal.timeMin;
  bindings.$timeMax = temporal.timeMax;

  return { sql, bindings };
}

/**
 * Build depth bounds filter
 *
 * Filters for datasets that have any intersection with user depth range (pre-filter).
 * Exact depth coverage percentage filtering happens via coverage threshold filter.
 *
 * Depth coverage = percentage of user depth range covered by dataset.
 *
 * Also supports hasDepth flag to filter only datasets with depth data.
 *
 * Handles NULL values to match backend behavior.
 *
 * @param {object} depth - Depth bounds { hasDepth, depthMin, depthMax }
 * @param {boolean} includePartialOverlaps - DEPRECATED: kept for backward compatibility, no longer used
 * @param {string} tableAlias - Table alias (default: 'd')
 * @returns {{ sql: string, bindings: object }}
 */
function buildDepthFilter(depth, includePartialOverlaps = true, tableAlias = 'd') {
  if (!depth) {
    return { sql: '', bindings: {} };
  }

  let sql = '';
  const bindings = {};

  // Filter by hasDepth flag (only datasets with depth data)
  if (depth.hasDepth !== undefined && depth.hasDepth) {
    sql += `\n  AND ${tableAlias}.depthMax IS NOT NULL`;
  }

  // Depth range filter - check for any overlap
  if (depth.depthMin != null && depth.depthMax != null) {
    sql += `\n  AND ${tableAlias}.depthMax >= $depthMin`;
    sql += `\n  AND ${tableAlias}.depthMin <= $depthMax`;
    bindings.$depthMin = depth.depthMin;
    bindings.$depthMax = depth.depthMax;
  }

  return { sql, bindings };
}

/**
 * Build coverage threshold filter
 *
 * Filters results based on coverage percentage thresholds for enabled constraints.
 * Used as a WHERE clause filter on queries that include coverage calculations.
 *
 * Coverage values are in 0-1 range (e.g., 1.0 = 100%, 0.5 = 50%).
 *
 * Spatial filtering uses ONLY dataset utilization (percentage of dataset within ROI):
 * - Partial overlap: 0 < dataset_utilization < 1.0 (some of dataset is in ROI)
 * - Full containment: dataset_utilization = 1.0 (entire dataset is within ROI)
 *
 * This approach ensures we only return datasets where a meaningful portion of the
 * dataset itself falls within the ROI, regardless of how much of the ROI the dataset covers.
 *
 * @param {object} coverageThresholds - Coverage thresholds for each dimension
 * @param {number} coverageThresholds.spatial - Minimum dataset utilization (0-1, or null if disabled)
 * @param {number} coverageThresholds.temporal - Minimum temporal coverage (0-1, or null if disabled)
 * @param {number} coverageThresholds.depth - Minimum depth coverage (0-1, or null if disabled)
 * @returns {{ sql: string, bindings: object }}
 */
function buildCoverageThresholdFilter(coverageThresholds) {
  if (!coverageThresholds) {
    return { sql: '', bindings: {} };
  }

  let sql = '';
  const bindings = {};

  // Spatial threshold uses ONLY dataset utilization (not spatial coverage)
  // This filters based on what percentage of the dataset falls within the ROI
  if (coverageThresholds.spatial != null) {
    sql += `\n  AND dataset_utilization >= $minDatasetUtilization`;
    bindings.$minDatasetUtilization = coverageThresholds.spatial;
  }

  // Temporal coverage threshold (only if enabled)
  if (coverageThresholds.temporal != null) {
    sql += `\n  AND (temporal_coverage IS NULL OR temporal_coverage >= $minTemporalCoverage)`;
    bindings.$minTemporalCoverage = coverageThresholds.temporal;
  }

  // Depth coverage threshold (only if enabled)
  if (coverageThresholds.depth != null) {
    sql += `\n  AND (depth_coverage IS NULL OR depth_coverage >= $minDepthCoverage)`;
    bindings.$minDepthCoverage = coverageThresholds.depth;
  }

  return { sql, bindings };
}

/**
 * Build combined filter for all non-text filters
 *
 * Convenience function that combines all filter builders.
 * Used to avoid duplicate code when applying filters in different query modes.
 *
 * @param {object} params - Filter parameters
 * @param {object} params.spatial - Spatial bounds
 * @param {object} params.temporal - Temporal bounds
 * @param {object} params.depth - Depth bounds
 * @param {string} params.region - Region filter
 * @param {string} params.datasetType - Dataset type filter
 * @param {boolean} params.includePartialOverlaps - Overlap mode
 * @param {string} tableAlias - Table alias (default: 'd')
 * @returns {{ sql: string, bindings: object }}
 */
function buildCombinedFilters(params, tableAlias = 'd') {
  const {
    spatial,
    temporal,
    depth,
    region,
    datasetType,
    includePartialOverlaps = true,
  } = params;

  let sql = '';
  const bindings = {};

  // Build each filter and accumulate SQL + bindings
  const filters = [
    buildDataTypeFilter(datasetType, tableAlias),
    buildRegionFilter(region, tableAlias),
    buildSpatialFilter(spatial, includePartialOverlaps, tableAlias),
    buildTemporalFilter(temporal, includePartialOverlaps, tableAlias),
    buildDepthFilter(depth, includePartialOverlaps, tableAlias),
  ];

  filters.forEach(({ sql: filterSql, bindings: filterBindings }) => {
    sql += filterSql;
    Object.assign(bindings, filterBindings);
  });

  return { sql, bindings };
}

// Export all filter builders to global scope for worker access
self.SqlFilterBuilders = {
  buildTextSearchFilter,
  buildFtsMatchQuery,
  buildDataTypeFilter,
  buildRegionFilter,
  buildSpatialFilter,
  buildTemporalFilter,
  buildDepthFilter,
  buildCoverageThresholdFilter,
  buildCombinedFilters,
};

})();
