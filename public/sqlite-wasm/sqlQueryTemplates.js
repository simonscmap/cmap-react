/**
 * SQL Query Templates
 *
 * Reusable SQL query fragments for building catalog search queries.
 * Eliminates duplication of SELECT clauses, FROM clauses, and other common patterns.
 *
 * Each function returns a SQL string fragment that can be composed into a complete query.
 *
 * NOTE: This file is loaded via importScripts() in a Web Worker context.
 * It exports to self.SqlQueryTemplates instead of using ES6 export syntax.
 */

(function() {
  'use strict';

// Access configuration from global scope
const { SCHEMA, QUERY_DEFAULTS, SEARCH_MODES } = self.CatalogSearchConfig;

/**
 * Build SELECT clause for dataset queries
 *
 * @param {boolean} includeRank - If true, include FTS rank; if false, use 0 as rank
 * @param {string} tableAlias - Table alias for datasets table (default: 'd')
 * @param {string} ftsAlias - Table alias for FTS table (default: 'fts')
 * @param {object} userBounds - Optional user bounds for coverage calculations
 * @returns {string} - SELECT clause SQL
 */
function buildSelectClause(includeRank = false, tableAlias = 'd', ftsAlias = 'fts', userBounds = null) {
  const { columns } = SCHEMA;

  return `
    SELECT
      ${tableAlias}.${columns.datasetId},
      ${tableAlias}.${columns.shortName},
      ${tableAlias}.${columns.longName},
      ${tableAlias}.${columns.description},
      ${tableAlias}.${columns.variableLongNames},
      ${tableAlias}.${columns.variableShortNames},
      ${tableAlias}.${columns.sensors},
      ${tableAlias}.${columns.distributor},
      ${tableAlias}.${columns.dataSource},
      ${tableAlias}.${columns.processLevel},
      ${tableAlias}.${columns.studyDomain},
      ${tableAlias}.${columns.keywords},
      ${tableAlias}.${columns.latMin}, ${tableAlias}.${columns.latMax}, ${tableAlias}.${columns.lonMin}, ${tableAlias}.${columns.lonMax},
      ${tableAlias}.${columns.timeMin}, ${tableAlias}.${columns.timeMax}, ${tableAlias}.${columns.depthMin}, ${tableAlias}.${columns.depthMax},
      ${tableAlias}.${columns.datasetType},
      ${tableAlias}.${columns.regions},
      ${tableAlias}.${columns.rowCount},
      ${tableAlias}.${columns.metadataJson},
      ${includeRank ? `${ftsAlias}.${columns.rank}` : `0 as ${columns.rank}`}${userBounds ? `,

      -- Area calculations (rectangular approximation in square degrees)
      (($userLatMax - $userLatMin) * ($userLonMax - $userLonMin)) AS roi_area,
      ((${tableAlias}.${columns.latMax} - ${tableAlias}.${columns.latMin}) *
       (${tableAlias}.${columns.lonMax} - ${tableAlias}.${columns.lonMin})) AS dataset_area,

      -- Intersection area calculation
      (
        CASE
          WHEN ${tableAlias}.${columns.latMax} < $userLatMin OR
               ${tableAlias}.${columns.latMin} > $userLatMax OR
               ${tableAlias}.${columns.lonMax} < $userLonMin OR
               ${tableAlias}.${columns.lonMin} > $userLonMax THEN 0
          ELSE (
            (MIN(${tableAlias}.${columns.latMax}, $userLatMax) - MAX(${tableAlias}.${columns.latMin}, $userLatMin)) *
            (MIN(${tableAlias}.${columns.lonMax}, $userLonMax) - MAX(${tableAlias}.${columns.lonMin}, $userLonMin))
          )
        END
      ) AS intersection_area,

      -- Dataset utilization (intersection / dataset area)
      -- Shows what percentage of the dataset's spatial extent falls within the ROI
      -- This is the PRIMARY metric for spatial filtering:
      --   - Partial overlap: 0 < dataset_utilization < 1.0 (some of dataset is in ROI)
      --   - Full containment: dataset_utilization = 1.0 (entire dataset is within ROI)
      (
        CASE
          -- No intersection with ROI
          WHEN ${tableAlias}.${columns.latMax} < $userLatMin OR
               ${tableAlias}.${columns.latMin} > $userLatMax OR
               ${tableAlias}.${columns.lonMax} < $userLonMin OR
               ${tableAlias}.${columns.lonMin} > $userLonMax THEN 0

          -- Zero-area dataset (point or line)
          WHEN (${tableAlias}.${columns.latMax} - ${tableAlias}.${columns.latMin}) *
               (${tableAlias}.${columns.lonMax} - ${tableAlias}.${columns.lonMin}) = 0 THEN (
            CASE
              -- True point (no extent in either dimension) - if we got here, it's in bounds
              WHEN ${tableAlias}.${columns.latMax} = ${tableAlias}.${columns.latMin} AND
                   ${tableAlias}.${columns.lonMax} = ${tableAlias}.${columns.lonMin} THEN 1.0

              -- Horizontal line (lat extent = 0, lon has extent)
              WHEN ${tableAlias}.${columns.latMax} = ${tableAlias}.${columns.latMin} THEN (
                (MIN(${tableAlias}.${columns.lonMax}, $userLonMax) - MAX(${tableAlias}.${columns.lonMin}, $userLonMin)) /
                NULLIF((${tableAlias}.${columns.lonMax} - ${tableAlias}.${columns.lonMin}), 0)
              )

              -- Vertical line (lon extent = 0, lat has extent)
              WHEN ${tableAlias}.${columns.lonMax} = ${tableAlias}.${columns.lonMin} THEN (
                (MIN(${tableAlias}.${columns.latMax}, $userLatMax) - MAX(${tableAlias}.${columns.latMin}, $userLatMin)) /
                NULLIF((${tableAlias}.${columns.latMax} - ${tableAlias}.${columns.latMin}), 0)
              )

              ELSE 0
            END
          )

          -- Normal area dataset
          ELSE (
            ((MIN(${tableAlias}.${columns.latMax}, $userLatMax) - MAX(${tableAlias}.${columns.latMin}, $userLatMin)) *
             (MIN(${tableAlias}.${columns.lonMax}, $userLonMax) - MAX(${tableAlias}.${columns.lonMin}, $userLonMin))) /
            NULLIF(((${tableAlias}.${columns.latMax} - ${tableAlias}.${columns.latMin}) *
                    (${tableAlias}.${columns.lonMax} - ${tableAlias}.${columns.lonMin})), 0)
          )
        END
      ) AS dataset_utilization,

      -- Temporal utilization (percentage of dataset's temporal extent within user range)
      (
        CASE
          WHEN $userTimeMin IS NULL OR $userTimeMax IS NULL THEN NULL
          WHEN ${tableAlias}.${columns.timeMax} IS NULL OR ${tableAlias}.${columns.timeMin} IS NULL THEN NULL
          WHEN json_extract(${tableAlias}.${columns.metadataJson}, '$.isClimatology') = 1 THEN 1.0
          WHEN ${tableAlias}.${columns.timeMax} < $userTimeMin OR ${tableAlias}.${columns.timeMin} > $userTimeMax THEN 0.0
          ELSE ROUND(
            (julianday(MIN(${tableAlias}.${columns.timeMax}, $userTimeMax)) -
             julianday(MAX(${tableAlias}.${columns.timeMin}, $userTimeMin))) /
            NULLIF((julianday(${tableAlias}.${columns.timeMax}) - julianday(${tableAlias}.${columns.timeMin})), 0)
          , 2)
        END
      ) AS temporal_utilization,

      -- Depth utilization (percentage of dataset's depth extent within user range)
      (
        CASE
          WHEN $userDepthMin IS NULL OR $userDepthMax IS NULL THEN NULL
          WHEN ${tableAlias}.${columns.depthMax} IS NULL OR ${tableAlias}.${columns.depthMin} IS NULL THEN NULL
          WHEN ${tableAlias}.${columns.depthMax} < $userDepthMin OR ${tableAlias}.${columns.depthMin} > $userDepthMax THEN 0.0
          ELSE ROUND(
            (MIN(${tableAlias}.${columns.depthMax}, $userDepthMax) - MAX(${tableAlias}.${columns.depthMin}, $userDepthMin)) /
            NULLIF((${tableAlias}.${columns.depthMax} - ${tableAlias}.${columns.depthMin}), 0)
          , 2)
        END
      ) AS depth_utilization,

      -- Spatial coverage ratio (0-1 range, rounded to 2 decimal places)
      -- Shows what percentage of the ROI is covered by the dataset
      -- NOTE: This metric is calculated for informational purposes only.
      --       Spatial filtering uses ONLY dataset_utilization, not spatial_coverage.
      (
        CASE
          WHEN ${tableAlias}.${columns.latMax} < $userLatMin OR
               ${tableAlias}.${columns.latMin} > $userLatMax OR
               ${tableAlias}.${columns.lonMax} < $userLonMin OR
               ${tableAlias}.${columns.lonMin} > $userLonMax THEN 0.0
          WHEN ($userLatMax - $userLatMin) * ($userLonMax - $userLonMin) = 0 THEN 0.0
          ELSE ROUND(
            ((MIN(${tableAlias}.${columns.latMax}, $userLatMax) - MAX(${tableAlias}.${columns.latMin}, $userLatMin)) *
             (MIN(${tableAlias}.${columns.lonMax}, $userLonMax) - MAX(${tableAlias}.${columns.lonMin}, $userLonMin))) /
            NULLIF((($userLatMax - $userLatMin) * ($userLonMax - $userLonMin)), 0)
          , 2)
        END
      ) AS spatial_coverage,

      -- Temporal coverage ratio (0-1 range, rounded to 2 decimal places, 1.0 for climatology)
      (
        CASE
          WHEN $userTimeMin IS NULL OR $userTimeMax IS NULL THEN NULL
          WHEN ${tableAlias}.${columns.timeMax} IS NULL OR ${tableAlias}.${columns.timeMin} IS NULL THEN NULL
          WHEN json_extract(${tableAlias}.${columns.metadataJson}, '$.isClimatology') = 1 THEN 1.0
          WHEN LOWER(${tableAlias}.${columns.metadataJson}) LIKE '%climatology%' THEN 1.0
          WHEN ${tableAlias}.${columns.timeMax} < $userTimeMin OR
               ${tableAlias}.${columns.timeMin} > $userTimeMax THEN 0.0
          ELSE ROUND(
            (julianday(MIN(${tableAlias}.${columns.timeMax}, $userTimeMax)) -
             julianday(MAX(${tableAlias}.${columns.timeMin}, $userTimeMin))) /
            NULLIF((julianday($userTimeMax) - julianday($userTimeMin)), 0)
          , 2)
        END
      ) AS temporal_coverage,

      -- Depth coverage ratio (0-1 range, rounded to 2 decimal places)
      (
        CASE
          WHEN $userDepthMin IS NULL OR $userDepthMax IS NULL THEN NULL
          WHEN ${tableAlias}.${columns.depthMax} IS NULL OR ${tableAlias}.${columns.depthMin} IS NULL THEN NULL
          WHEN ${tableAlias}.${columns.depthMax} < $userDepthMin OR
               ${tableAlias}.${columns.depthMin} > $userDepthMax THEN 0.0
          ELSE ROUND(
            (MIN(${tableAlias}.${columns.depthMax}, $userDepthMax) -
             MAX(${tableAlias}.${columns.depthMin}, $userDepthMin)) /
            NULLIF(($userDepthMax - $userDepthMin), 0)
          , 2)
        END
      ) AS depth_coverage` : ''}`;
}

/**
 * Build FROM clause based on search mode
 *
 * @param {string} searchMode - Search mode ('like', 'fts', or 'filter-only')
 * @param {string} tableAlias - Table alias for datasets table (default: 'd')
 * @param {string} ftsAlias - Table alias for FTS table (default: 'fts')
 * @returns {string} - FROM clause SQL
 */
function buildFromClause(searchMode, tableAlias = 'd', ftsAlias = 'fts') {
  const { tables, columns } = SCHEMA;

  if (searchMode === SEARCH_MODES.FTS) {
    // FTS mode: Join FTS table with datasets table
    return `
    FROM ${tables.datasetsFts} ${ftsAlias}
    JOIN ${tables.datasets} ${tableAlias} ON ${ftsAlias}.${columns.rowid} = ${tableAlias}.${columns.rowid}`;
  } else {
    // LIKE mode or filter-only mode: Just datasets table
    return `
    FROM ${tables.datasets} ${tableAlias}`;
  }
}

/**
 * Build ORDER BY clause
 *
 * @param {boolean} useRanking - If true, sort by rank (FTS); if false, sort by shortName
 * @param {string} tableAlias - Table alias (default: 'd')
 * @returns {string} - ORDER BY clause SQL
 */
function buildOrderByClause(useRanking = false, tableAlias = 'd') {
  const { columns } = SCHEMA;

  if (useRanking) {
    // Sort by FTS rank (lower rank = better match)
    return `\n  ORDER BY ${columns.rank} ASC`;
  } else {
    // Default: Sort by shortName alphabetically
    return `\n  ORDER BY ${tableAlias}.${columns.shortName} ${QUERY_DEFAULTS.sortDirection}`;
  }
}

/**
 * Build ORDER BY clause for queries without table alias
 *
 * Used in filter-only mode where no table alias is present.
 *
 * @param {boolean} useRanking - If true, sort by rank; if false, sort by shortName
 * @returns {string} - ORDER BY clause SQL
 */
function buildOrderByClauseNoAlias(useRanking = false) {
  const { columns } = SCHEMA;

  if (useRanking) {
    return `\n  ORDER BY ${columns.rank} ASC`;
  } else {
    return `\n  ORDER BY ${columns.shortName} ${QUERY_DEFAULTS.sortDirection}`;
  }
}

/**
 * Build advanced ORDER BY clause with sort mode support
 *
 * Supports multi-level ordering with tie-breakers:
 * - default: data type → dataset utilization → spatial coverage → alphabetical
 * - spatial: spatial coverage → data type → dataset utilization → alphabetical
 * - temporal: temporal coverage → data type → dataset utilization → alphabetical
 * - depth: depth coverage → data type → dataset utilization → alphabetical
 *
 * Dataset utilization is used as a tie-breaker to prioritize datasets where a higher
 * percentage of the dataset falls within the ROI.
 *
 * @param {string} sortMode - Sort mode ('default', 'spatial', 'temporal', 'depth', or null for basic)
 * @param {string} tableAlias - Table alias (default: 'd')
 * @param {string} sortDirection - Sort direction ('asc' or 'desc', default: 'desc')
 * @returns {string} - ORDER BY clause SQL
 */
function buildAdvancedOrderByClause(sortMode, tableAlias = 'd', sortDirection = 'desc') {
  const { columns } = SCHEMA;
  const { SORT_MODES } = self.CatalogSearchConfig;

  // If no sort mode specified, fall back to basic ordering
  if (!sortMode) {
    return buildOrderByClause(false, tableAlias);
  }

  // Normalize direction to uppercase for SQL
  const dir = sortDirection.toUpperCase();

  switch (sortMode) {
    case SORT_MODES.DEFAULT:
      // Data type → dataset utilization → spatial coverage → alphabetical
      return `
  ORDER BY
    CASE ${tableAlias}.${columns.datasetType}
      WHEN 'In-Situ' THEN 1
      WHEN 'Satellite' THEN 2
      WHEN 'Model' THEN 3
      ELSE 4
    END ASC,
    dataset_utilization ${dir},
    spatial_coverage ${dir},
    ${tableAlias}.${columns.shortName} COLLATE NOCASE ASC`;

    case SORT_MODES.SPATIAL:
      // Spatial coverage → data type → dataset utilization → alphabetical
      return `
  ORDER BY
    spatial_coverage ${dir},
    CASE ${tableAlias}.${columns.datasetType}
      WHEN 'In-Situ' THEN 1
      WHEN 'Satellite' THEN 2
      WHEN 'Model' THEN 3
      ELSE 4
    END ASC,
    dataset_utilization ${dir},
    ${tableAlias}.${columns.shortName} COLLATE NOCASE ASC`;

    case SORT_MODES.TEMPORAL:
      // Temporal coverage → data type → dataset utilization → spatial coverage → alphabetical
      return `
  ORDER BY
    temporal_coverage ${dir},
    CASE ${tableAlias}.${columns.datasetType}
      WHEN 'In-Situ' THEN 1
      WHEN 'Satellite' THEN 2
      WHEN 'Model' THEN 3
      ELSE 4
    END ASC,
    dataset_utilization ${dir},
    spatial_coverage ${dir},
    ${tableAlias}.${columns.shortName} COLLATE NOCASE ASC`;

    case SORT_MODES.DEPTH:
      // Depth coverage → data type → dataset utilization → spatial coverage → alphabetical
      return `
  ORDER BY
    depth_coverage ${dir},
    CASE ${tableAlias}.${columns.datasetType}
      WHEN 'In-Situ' THEN 1
      WHEN 'Satellite' THEN 2
      WHEN 'Model' THEN 3
      ELSE 4
    END ASC,
    dataset_utilization ${dir},
    spatial_coverage ${dir},
    ${tableAlias}.${columns.shortName} COLLATE NOCASE ASC`;

    case SORT_MODES.UTILIZATION:
      // Dataset utilization → data type → spatial coverage → alphabetical
      return `
  ORDER BY
    dataset_utilization ${dir},
    CASE ${tableAlias}.${columns.datasetType}
      WHEN 'In-Situ' THEN 1
      WHEN 'Satellite' THEN 2
      WHEN 'Model' THEN 3
      ELSE 4
    END ASC,
    spatial_coverage ${dir},
    ${tableAlias}.${columns.shortName} COLLATE NOCASE ASC`;

    default:
      // Fall back to basic ordering if unknown sort mode
      return buildOrderByClause(false, tableAlias);
  }
}

/**
 * Build LIMIT/OFFSET clause for pagination
 *
 * @param {number} limit - Maximum number of results (null = no limit)
 * @param {number} offset - Number of results to skip (default: 0)
 * @returns {{ sql: string, bindings: object }}
 */
function buildPaginationClause(limit, offset = 0) {
  if (limit === null || limit === undefined) {
    return { sql: '', bindings: {} };
  }

  const sql = ` LIMIT $limit OFFSET $offset`;
  const bindings = {
    $limit: limit,
    $offset: offset,
  };

  return { sql, bindings };
}

/**
 * Build user bounds bindings for coverage calculations
 *
 * @param {object} userBounds - User-specified bounds for coverage calculations
 * @param {number} userBounds.latMin - User ROI minimum latitude
 * @param {number} userBounds.latMax - User ROI maximum latitude
 * @param {number} userBounds.lonMin - User ROI minimum longitude
 * @param {number} userBounds.lonMax - User ROI maximum longitude
 * @param {string} userBounds.timeMin - User ROI minimum time (ISO string)
 * @param {string} userBounds.timeMax - User ROI maximum time (ISO string)
 * @param {number} userBounds.depthMin - User ROI minimum depth
 * @param {number} userBounds.depthMax - User ROI maximum depth
 * @returns {object} - Bindings for user bounds parameters
 */
function buildUserBoundsBindings(userBounds) {
  if (!userBounds) {
    return {};
  }

  const bindings = {};

  // Spatial bounds (required for area calculations)
  if (userBounds.latMin != null && userBounds.latMax != null &&
      userBounds.lonMin != null && userBounds.lonMax != null) {
    bindings.$userLatMin = userBounds.latMin;
    bindings.$userLatMax = userBounds.latMax;
    bindings.$userLonMin = userBounds.lonMin;
    bindings.$userLonMax = userBounds.lonMax;
  }

  // Temporal bounds (optional)
  if (userBounds.timeMin != null && userBounds.timeMax != null) {
    bindings.$userTimeMin = userBounds.timeMin;
    bindings.$userTimeMax = userBounds.timeMax;
  }

  // Depth bounds (optional)
  if (userBounds.depthMin != null && userBounds.depthMax != null) {
    bindings.$userDepthMin = userBounds.depthMin;
    bindings.$userDepthMax = userBounds.depthMax;
  }

  return bindings;
}

/**
 * Wrap query with coverage filtering
 *
 * Applies coverage threshold filters to a query that includes coverage calculations.
 * Uses subquery to ensure coverage is calculated before filtering.
 *
 * @param {string} innerSql - Inner query SQL (must include coverage columns)
 * @param {object} innerBindings - Bindings for inner query
 * @param {object} coverageThresholds - Coverage threshold filters
 * @param {number} coverageThresholds.spatial - Minimum spatial coverage (0-1, or null)
 * @param {number} coverageThresholds.temporal - Minimum temporal coverage (0-1, or null)
 * @param {number} coverageThresholds.depth - Minimum depth coverage (0-1, or null)
 * @returns {{ sql: string, bindings: object }}
 */
function wrapWithCoverageFilter(innerSql, innerBindings, coverageThresholds) {
  // Access filter builder from global scope
  const { buildCoverageThresholdFilter } = self.SqlFilterBuilders;

  if (!coverageThresholds) {
    return { sql: innerSql, bindings: innerBindings };
  }

  const { sql: filterSql, bindings: filterBindings } = buildCoverageThresholdFilter(coverageThresholds);

  if (!filterSql) {
    return { sql: innerSql, bindings: innerBindings };
  }

  const sql = `
    SELECT * FROM (
      ${innerSql}
    ) AS coverage_results
    WHERE 1=1${filterSql}`;

  const bindings = {
    ...innerBindings,
    ...filterBindings,
  };

  return { sql, bindings };
}

/**
 * Build complete LIKE mode query
 *
 * Combines all query fragments for LIKE-based search.
 *
 * @param {string} filterSql - SQL filter clauses (from filter builders)
 * @param {object} filterBindings - Parameter bindings for filters
 * @param {number} limit - Result limit
 * @param {number} offset - Result offset
 * @param {object} userBounds - Optional user bounds for coverage calculations
 * @param {string} sortMode - Optional sort mode for advanced ordering
 * @param {string} sortDirection - Optional sort direction ('asc' or 'desc')
 * @param {object} coverageThresholds - Optional coverage thresholds for filtering
 * @returns {{ sql: string, bindings: object }}
 */
function buildLikeQuery(filterSql, filterBindings, limit, offset = 0, userBounds = null, sortMode = null, sortDirection = 'desc', coverageThresholds = null) {
  const tableAlias = SCHEMA.aliases.datasets;

  let sql = buildSelectClause(false, tableAlias, null, userBounds);
  sql += buildFromClause(SEARCH_MODES.LIKE, tableAlias);
  sql += '\n    WHERE 1=1';
  sql += filterSql;

  // Use advanced ordering if sort mode provided and user bounds exist
  if (sortMode && userBounds) {
    sql += buildAdvancedOrderByClause(sortMode, tableAlias, sortDirection);
  } else {
    sql += buildOrderByClause(false, tableAlias);
  }

  let bindings = {
    ...filterBindings,
    ...buildUserBoundsBindings(userBounds),
  };

  // Add pagination
  const pagination = buildPaginationClause(limit, offset);
  sql += pagination.sql;
  Object.assign(bindings, pagination.bindings);

  // Apply coverage filtering if thresholds provided and user bounds exist
  if (coverageThresholds && userBounds) {
    const result = wrapWithCoverageFilter(sql, bindings, coverageThresholds);
    return result;
  }

  return { sql, bindings };
}

/**
 * Build complete FTS mode query
 *
 * Combines all query fragments for full-text search.
 *
 * @param {string} matchQuery - FTS MATCH query string
 * @param {string} filterSql - SQL filter clauses (from filter builders)
 * @param {object} filterBindings - Parameter bindings for filters
 * @param {boolean} useRanking - If true, sort by rank
 * @param {number} limit - Result limit
 * @param {number} offset - Result offset
 * @param {object} userBounds - Optional user bounds for coverage calculations
 * @param {string} sortMode - Optional sort mode for advanced ordering
 * @param {string} sortDirection - Optional sort direction ('asc' or 'desc')
 * @param {object} coverageThresholds - Optional coverage thresholds for filtering
 * @returns {{ sql: string, bindings: object }}
 */
function buildFtsQuery(matchQuery, filterSql, filterBindings, useRanking, limit, offset = 0, userBounds = null, sortMode = null, sortDirection = 'desc', coverageThresholds = null) {
  const tableAlias = SCHEMA.aliases.datasets;
  const ftsAlias = SCHEMA.aliases.datasetsFts;
  const { tables } = SCHEMA;

  let sql = buildSelectClause(true, tableAlias, ftsAlias, userBounds);
  sql += buildFromClause(SEARCH_MODES.FTS, tableAlias, ftsAlias);
  sql += `\n    WHERE ${tables.datasetsFts} MATCH $text`;
  sql += filterSql;

  // Use advanced ordering if sort mode provided and user bounds exist
  if (sortMode && userBounds) {
    sql += buildAdvancedOrderByClause(sortMode, tableAlias, sortDirection);
  } else {
    sql += buildOrderByClause(useRanking, tableAlias);
  }

  let bindings = {
    $text: matchQuery,
    ...filterBindings,
    ...buildUserBoundsBindings(userBounds),
  };

  // Add pagination
  const pagination = buildPaginationClause(limit, offset);
  sql += pagination.sql;
  Object.assign(bindings, pagination.bindings);

  // Apply coverage filtering if thresholds provided and user bounds exist
  if (coverageThresholds && userBounds) {
    const result = wrapWithCoverageFilter(sql, bindings, coverageThresholds);
    return result;
  }

  return { sql, bindings };
}

/**
 * Build complete filter-only query (no text search)
 *
 * Combines all query fragments for filter-only search (no text).
 *
 * @param {string} filterSql - SQL filter clauses (from filter builders)
 * @param {object} filterBindings - Parameter bindings for filters
 * @param {number} limit - Result limit
 * @param {number} offset - Result offset
 * @param {object} userBounds - Optional user bounds for coverage calculations
 * @param {string} sortMode - Optional sort mode for advanced ordering
 * @param {string} sortDirection - Optional sort direction ('asc' or 'desc')
 * @param {object} coverageThresholds - Optional coverage thresholds for filtering
 * @returns {{ sql: string, bindings: object }}
 */
function buildFilterOnlyQuery(filterSql, filterBindings, limit, offset = 0, userBounds = null, sortMode = null, sortDirection = 'desc', coverageThresholds = null) {
  const { columns } = SCHEMA;

  // Build SELECT clause with coverage if userBounds provided
  let sql;
  if (userBounds) {
    // Use buildSelectClause with userBounds
    sql = buildSelectClause(false, null, null, userBounds);
    // Remove table alias references since filter-only mode doesn't use aliases
    sql = sql.replace(/\.\./g, '.');
    // Add FROM clause
    sql += `\n    FROM ${SCHEMA.tables.datasets}`;
  } else {
    // Original filter-only SELECT (no coverage calculations)
    sql = `
    SELECT
      ${columns.datasetId},
      ${columns.shortName},
      ${columns.longName},
      ${columns.description},
      ${columns.latMin},
      ${columns.latMax},
      ${columns.lonMin},
      ${columns.lonMax},
      ${columns.timeMin},
      ${columns.timeMax},
      ${columns.depthMin},
      ${columns.depthMax},
      ${columns.datasetType},
      ${columns.regions},
      ${columns.rowCount},
      ${columns.metadataJson},
      0 as ${columns.rank}
    FROM ${SCHEMA.tables.datasets}`;
  }

  sql += '\n    WHERE 1=1';
  sql += filterSql;

  // Use advanced ordering if sort mode provided and user bounds exist
  if (sortMode && userBounds) {
    // buildAdvancedOrderByClause expects table alias, but filter-only has none
    // Need to create version without alias
    let orderByClause = buildAdvancedOrderByClause(sortMode, '', sortDirection);
    // Remove any remaining table alias references
    orderByClause = orderByClause.replace(/\.\./g, '.');
    sql += orderByClause;
  } else {
    sql += buildOrderByClauseNoAlias(false);
  }

  let bindings = {
    ...filterBindings,
    ...buildUserBoundsBindings(userBounds),
  };

  // Add pagination
  const pagination = buildPaginationClause(limit, offset);
  sql += pagination.sql;
  Object.assign(bindings, pagination.bindings);

  // Apply coverage filtering if thresholds provided and user bounds exist
  if (coverageThresholds && userBounds) {
    const result = wrapWithCoverageFilter(sql, bindings, coverageThresholds);
    return result;
  }

  return { sql, bindings };
}

// Export all query templates to global scope for worker access
self.SqlQueryTemplates = {
  buildSelectClause,
  buildFromClause,
  buildOrderByClause,
  buildOrderByClauseNoAlias,
  buildAdvancedOrderByClause,
  buildPaginationClause,
  buildUserBoundsBindings,
  wrapWithCoverageFilter,
  buildLikeQuery,
  buildFtsQuery,
  buildFilterOnlyQuery,
};

})();
