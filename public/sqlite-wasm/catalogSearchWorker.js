/**
 * Web Worker for SQLite-based catalog search
 *
 * ARCHITECTURE NOTE:
 * This worker is a simplified SQL execution service that operates as a security boundary.
 * Business logic is intentionally kept in the feature folder for maintainability:
 *
 * - Query construction logic: src/features/catalogSearch/api/queries/
 * - Result transformation: src/features/catalogSearch/api/transformers/
 * - Worker interface: src/features/catalogSearch/api/searchDatabaseApi.js
 *
 * This worker receives structured query objects (not SQL strings) and returns raw rows.
 * All query building and result transformation happens in the feature folder.
 * See src/features/catalogSearch/api/README.md for complete architecture overview.
 *
 * Message Protocol:
 * - From main thread:
 *   { type: 'init', dbBlob: ArrayBuffer }
 *   { type: 'search', query: SearchQuery }
 *   { type: 'cleanup' }
 *
 * - To main thread:
 *   { type: 'init-success' }
 *   { type: 'init-error', error: string }
 *   { type: 'search-results', results: RawRow[] }
 *   { type: 'search-error', error: string }
 */

// Load configuration and helper modules
// Note: Workers must use importScripts(), not ES6 import
importScripts('./catalogSearchConfig.js');
importScripts('./sqlFilterBuilders.js');
importScripts('./sqlQueryTemplates.js');

// Destructure from global scope (exports from imported scripts)
const { MESSAGE_TYPES, SEARCHABLE_FIELDS, SEARCH_MODES, QUERY_DEFAULTS } = self.CatalogSearchConfig;
const {
  buildTextSearchFilter,
  buildFtsMatchQuery,
  buildCombinedFilters,
} = self.SqlFilterBuilders;
const {
  buildLikeQuery,
  buildFtsQuery,
  buildFilterOnlyQuery,
} = self.SqlQueryTemplates;

let sqlite3;
let db;

/**
 * Load SQLite WASM module from co-located files
 *
 * Files in same directory (public/sqlite-wasm/):
 * - catalogSearchWorker.js (this file)
 * - sqlite3.js (SQLite library)
 * - sqlite3.wasm (WASM binary)
 *
 * The library will auto-detect sqlite3.wasm in the same directory.
 */
async function loadSQLiteModule() {
  // Load SQLite library from same directory
  // Library automatically finds sqlite3.wasm in the same directory
  importScripts('./sqlite3.js');

  // Initialize SQLite WASM module
  // We only use in-memory databases, so we don't need OPFS VFS
  // This prevents COOP/COEP warnings about missing headers
  return await self.sqlite3InitModule({
    // Disable OPFS to avoid COOP/COEP warnings
    // We only use in-memory databases loaded from backend
    vfsList: ['unix-none', 'unix'] // Use basic VFS, skip OPFS
  });
}

/**
 * Initialize SQLite WASM and load database
 * @param {ArrayBuffer} dbBlob - SQLite database file
 */
async function initializeDatabase(dbBlob) {
  try {
    // Load SQLite WASM library on first use
    if (!sqlite3) {
      sqlite3 = await loadSQLiteModule();
    }

    // Load database from ArrayBuffer
    const uint8Array = new Uint8Array(dbBlob);

    // Create an in-memory database and populate it from the byte array
    const pArray = sqlite3.wasm.allocFromTypedArray(uint8Array);

    try {
      // Open a new in-memory database
      db = new sqlite3.oo1.DB(':memory:');

      // Deserialize the data into the database
      const rc = sqlite3.capi.sqlite3_deserialize(
        db.pointer,
        'main',
        pArray,
        uint8Array.byteLength,
        uint8Array.byteLength,
        sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE,
      );

      if (rc !== sqlite3.capi.SQLITE_OK) {
        throw new Error(`sqlite3_deserialize failed with code ${rc}`);
      }

      // Validate schema - check for required columns
      const schemaCheck = db.exec({
        sql: 'PRAGMA table_info(datasets)',
        returnValue: 'resultRows',
      });

    } catch (err) {
      // Only free if deserialize failed (otherwise FREEONCLOSE will handle it)
      if (db) {
        db.close();
        db = null;
      }
      throw err;
    }

    postMessage({ type: MESSAGE_TYPES.INIT_SUCCESS });
  } catch (error) {
    console.error('[Worker] Initialization error:', error);
    postMessage({
      type: MESSAGE_TYPES.INIT_ERROR,
      error: error.message || 'Failed to initialize database',
    });
  }
}

/**
 * Build LIKE-based search query (matches backend exactly)
 *
 * Refactored to use modular filter builders for maintainability.
 *
 * @param {string} text - Search text
 * @param {object} spatial - Spatial filters
 * @param {object} temporal - Temporal filters
 * @param {object} depth - Depth filters
 * @param {array} excludeFields - Fields to exclude from search
 * @param {boolean} phraseMatch - If true, treat entire text as single phrase; if false, split into keywords
 * @param {boolean} includePartialOverlaps - If true, partial overlap mode; if false, full containment mode
 * @param {string} region - Region filter (null or region name)
 * @param {string} datasetType - Dataset type filter (null or 'Model'/'Satellite'/'In-Situ')
 * @returns {object} - SQL query and bindings { sql, bindings }
 */
function buildLikeSearch(
  text,
  spatial,
  temporal,
  depth,
  excludeFields,
  phraseMatch = false,
  includePartialOverlaps = true,
  region = null,
  datasetType = null
) {
  // Searchable fields (excludes 'description' to match backend)
  const searchableFields = excludeFields
    ? SEARCHABLE_FIELDS.like.filter((f) => !excludeFields.includes(f))
    : SEARCHABLE_FIELDS.like;

  let filterSql = '';
  const filterBindings = {};

  // Build text search filter
  const textFilter = buildTextSearchFilter(text, searchableFields, phraseMatch, 'd');
  filterSql += textFilter.sql;
  Object.assign(filterBindings, textFilter.bindings);

  // Build combined filters (spatial, temporal, depth, region, datasetType)
  const combinedFilters = buildCombinedFilters({
    spatial,
    temporal,
    depth,
    region,
    datasetType,
    includePartialOverlaps,
  }, 'd');
  filterSql += combinedFilters.sql;
  Object.assign(filterBindings, combinedFilters.bindings);

  // Note: Pagination is added in executeSearch(), not here
  // This allows the query builder to be reusable for different pagination scenarios

  return { filterSql, filterBindings };
}

/**
 * Execute search query
 *
 * Refactored to use modular query builders and filter functions.
 *
 * @param {SearchQuery} query - Search parameters
 * @param {number} searchId - Unique search identifier
 */
async function executeSearch(query, searchId) {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }

    // Extract query parameters (validation/limits handled by feature layer)
    const {
      text,
      spatial,
      temporal,
      depth,
      limit,
      offset = QUERY_DEFAULTS.offset,
      useRanking = QUERY_DEFAULTS.useRanking,
      excludeFields,
      searchMode = QUERY_DEFAULTS.searchMode,
      phraseMatch = QUERY_DEFAULTS.phraseMatch,
      includePartialOverlaps = QUERY_DEFAULTS.includePartialOverlaps,
      region = null,
      datasetType = null,
      sortMode = null,
      sortDirection = 'desc',
    } = query;

    // Build user bounds object for coverage calculations
    let userBounds = null;
    if (spatial && spatial.latMin != null && spatial.latMax != null &&
        spatial.lonMin != null && spatial.lonMax != null) {
      userBounds = {
        latMin: spatial.latMin,
        latMax: spatial.latMax,
        lonMin: spatial.lonMin,
        lonMax: spatial.lonMax,
      };

      // Add temporal bounds if present
      if (temporal && temporal.timeMin && temporal.timeMax) {
        userBounds.timeMin = temporal.timeMin;
        userBounds.timeMax = temporal.timeMax;
      }

      // Add depth bounds if present
      if (depth && depth.depthMin != null && depth.depthMax != null) {
        userBounds.depthMin = depth.depthMin;
        userBounds.depthMax = depth.depthMax;
      }
    }

    // Build coverage thresholds based on enabled constraints and overlap mode
    // Coverage values are 0-1 range: 1.0 = 100%, 0 = any overlap
    let coverageThresholds = null;
    if (userBounds) {
      const threshold = includePartialOverlaps ? 0 : 1.0;

      coverageThresholds = {
        // Spatial is always enabled when userBounds exists
        spatial: threshold,
        // Temporal only if temporal bounds present
        temporal: (temporal && temporal.timeMin && temporal.timeMax) ? threshold : null,
        // Depth only if depth bounds present
        depth: (depth && depth.depthMin != null && depth.depthMax != null) ? threshold : null,
      };
    }

    let sql;
    let bindings = {};

    // LIKE mode (default - matches backend behavior)
    if (searchMode === SEARCH_MODES.LIKE) {
      // Build filters using modular filter builders
      const { filterSql, filterBindings } = buildLikeSearch(
        text,
        spatial,
        temporal,
        depth,
        excludeFields,
        phraseMatch,
        includePartialOverlaps,
        region,
        datasetType
      );

      // Compose complete query using template
      const queryResult = buildLikeQuery(
        filterSql,
        filterBindings,
        limit,
        offset,
        userBounds,
        sortMode,
        sortDirection,
        coverageThresholds
      );
      sql = queryResult.sql;
      bindings = queryResult.bindings;

    } else if (text && text.trim()) {
      // FTS mode with optional filters
      const { matchQuery } = buildFtsMatchQuery(text, excludeFields);

      // Build combined filters for FTS mode
      const { sql: filterSql, bindings: filterBindings } = buildCombinedFilters({
        spatial,
        temporal,
        depth,
        region,
        datasetType,
        includePartialOverlaps,
      }, 'd');

      // Compose complete FTS query using template
      const queryResult = buildFtsQuery(
        matchQuery,
        filterSql,
        filterBindings,
        useRanking,
        limit,
        offset,
        userBounds,
        sortMode,
        sortDirection,
        coverageThresholds
      );
      sql = queryResult.sql;
      bindings = queryResult.bindings;

    } else {
      // Filter-only mode (no text search)
      const { sql: filterSql, bindings: filterBindings } = buildCombinedFilters({
        spatial,
        temporal,
        depth,
        region,
        datasetType,
        includePartialOverlaps,
      });

      // Compose complete filter-only query using template
      const queryResult = buildFilterOnlyQuery(
        filterSql,
        filterBindings,
        limit,
        offset,
        userBounds,
        sortMode,
        sortDirection,
        coverageThresholds
      );
      sql = queryResult.sql;
      bindings = queryResult.bindings;
    }

    // Execute query and return raw rows
    // NOTE: Result transformation has been moved to transformers/
    const results = [];
    db.exec({
      sql,
      bind: bindings,
      rowMode: 'object',
      callback: (row) => {
        // Return raw database row with no transformation
        results.push(row);
      },
    });

    postMessage({ type: MESSAGE_TYPES.SEARCH_RESULTS, searchId, results });
  } catch (error) {
    console.error('[Worker] Search error:', error);
    postMessage({
      type: MESSAGE_TYPES.SEARCH_ERROR,
      searchId,
      error: error.message || 'Search failed',
    });
  }
}

/**
 * Get all regions from the regions table
 * @param {number} searchId - Search ID for response correlation
 */
function getRegions(searchId) {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const sql = 'SELECT regionName FROM regions ORDER BY regionName';
    const results = [];

    db.exec({
      sql,
      rowMode: 'object',
      callback: (row) => {
        results.push(row.regionName);
      },
    });

    postMessage({ type: MESSAGE_TYPES.REGIONS_RESULTS, searchId, results });
  } catch (error) {
    console.error('[Worker] Get regions error:', error);
    postMessage({
      type: MESSAGE_TYPES.REGIONS_ERROR,
      searchId,
      error: error.message || 'Failed to fetch regions',
    });
  }
}

/**
 * Cleanup resources
 */
function cleanup() {
  try {
    if (db) {
      db.close();
      db = null;
    }
    postMessage({ type: MESSAGE_TYPES.CLEANUP_SUCCESS });
  } catch (error) {
    postMessage({
      type: MESSAGE_TYPES.CLEANUP_ERROR,
      error: error.message || 'Cleanup failed',
    });
  }
}

// Message handler
self.onmessage = (event) => {
  const { type, dbBlob, query, searchId } = event.data;

  switch (type) {
    case MESSAGE_TYPES.INIT:
      initializeDatabase(dbBlob);
      break;
    case MESSAGE_TYPES.SEARCH:
      executeSearch(query, searchId);
      break;
    case MESSAGE_TYPES.GET_REGIONS:
      getRegions(searchId);
      break;
    case MESSAGE_TYPES.CLEANUP:
      cleanup();
      break;
    default:
      postMessage({
        type: MESSAGE_TYPES.ERROR,
        error: `Unknown message type: ${type}`,
      });
  }
};
