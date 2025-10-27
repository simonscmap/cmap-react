/**
 * Web Worker for SQLite-based catalog search
 *
 * This worker manages the SQLite WASM instance and executes search queries.
 * It communicates with the main thread via postMessage protocol.
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
 *   { type: 'search-results', results: SearchResult[] }
 *   { type: 'search-error', error: string }
 */

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

    postMessage({ type: 'init-success' });
  } catch (error) {
    console.error('[Worker] Initialization error:', error);
    postMessage({
      type: 'init-error',
      error: error.message || 'Failed to initialize database',
    });
  }
}

/**
 * Build LIKE-based search query (matches backend exactly)
 * @param {string} text - Search text
 * @param {object} spatial - Spatial filters
 * @param {object} temporal - Temporal filters
 * @param {object} depth - Depth filters
 * @param {array} excludeFields - Fields to exclude from search
 * @param {boolean} phraseMatch - If true, treat entire text as single phrase; if false, split into keywords with AND logic (default: false, matches backend)
 * @param {boolean} includePartialOverlaps - If true, partial overlap mode; if false, full containment mode (default: true)
 * @param {string} region - Region filter (null or region name)
 * @param {string} datasetType - Dataset type filter (null or 'Model'/'Satellite'/'In-Situ')
 * @param {string} dateRangePreset - Date range preset (null or 'Last Year'/'Last 5 Years')
 * @returns {object} - SQL query and bindings
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
  datasetType = null,
  dateRangePreset = null
) {
  // Searchable fields (excludes 'description' to match backend)
  const searchableFields = [
    'variableLongNames',   // Backend: Variable_Long_Names
    'variableShortNames',  // Backend: Variable_Short_Names
    'longName',            // Backend: Dataset_Long_Name
    'sensors',             // Backend: Sensors
    'keywords',            // Backend: Keywords
    'distributor',         // Backend: Distributor
    'dataSource',          // Backend: Data_Source
    'processLevel',        // Backend: Process_Level
    'studyDomain',         // Backend: Study_Domain
  ];

  // Filter out excluded fields
  const fieldsToSearch = excludeFields
    ? searchableFields.filter((f) => !excludeFields.includes(f))
    : searchableFields;

  let sql = `
    SELECT
      d.datasetId,
      d.shortName,
      d.longName,
      d.description,
      d.variableLongNames,
      d.variableShortNames,
      d.sensors,
      d.distributor,
      d.dataSource,
      d.processLevel,
      d.studyDomain,
      d.keywords,
      d.latMin, d.latMax, d.lonMin, d.lonMax,
      d.timeMin, d.timeMax, d.depthMin, d.depthMax,
      d.datasetType,
      d.regions,
      d.rowCount,
      d.metadataJson,
      0 as rank
    FROM datasets d
    WHERE 1=1
  `;

  const bindings = {};

  // Add text search conditions
  if (text && text.trim()) {
    if (phraseMatch) {
      // Treat entire text as single phrase (matches backend)
      const likePattern = `%${text.trim()}%`;

      // Build OR clause across all fields for single phrase
      const conditions = fieldsToSearch
        .map((field) => `d.${field} LIKE $phrase`)
        .join(' OR ');

      sql += `\n  AND (${conditions})`;
      bindings.$phrase = likePattern;
    } else {
      // Keep existing keyword split logic for backward compatibility
      const keywords = text.trim().split(/\s+/).filter((k) => k.length > 0);
      keywords.forEach((keyword, idx) => {
        const bindKey = `keyword${idx}`;
        const likePattern = `%${keyword}%`;

        // Build OR clause for each keyword across all fields
        const conditions = fieldsToSearch
          .map((field) => `d.${field} LIKE $${bindKey}`)
          .join(' OR ');

        sql += `\n  AND (${conditions})`;
        bindings[`$${bindKey}`] = likePattern;
      });
    }
  }

  // Add data type filtering
  if (datasetType && datasetType !== 'All Types') {
    sql += `\n  AND d.datasetType = $datasetType`;
    bindings.$datasetType = datasetType; // 'Model', 'Satellite', or 'In-Situ'
  }

  // Add region filtering
  if (region && region !== 'All Regions') {
    sql += `\n  AND d.regions LIKE $region`;
    bindings.$region = `%${region}%`;
  }

  // Add date range preset logic
  if (dateRangePreset && dateRangePreset !== 'Any Date' && dateRangePreset !== 'Custom Range') {
    const now = new Date();
    let calculatedTimeStart;

    if (dateRangePreset === 'Last Year') {
      calculatedTimeStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString().slice(0, 10);
    } else if (dateRangePreset === 'Last 5 Years') {
      calculatedTimeStart = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate()).toISOString().slice(0, 10);
    }

    sql += `\n  AND (d.timeMax > $presetTimeStart OR d.timeMax IS NULL)`;
    bindings.$presetTimeStart = calculatedTimeStart;
  }

  // Add spatial filters (match backend with NULL handling)
  if (spatial) {
    if (spatial.latMin != null && spatial.latMax != null) {
      if (includePartialOverlaps) {
        // Partial overlap mode: dataset bounds overlap with user bounds
        sql += `\n  AND (d.latMax > $latMin OR d.latMin IS NULL)`;
        sql += `\n  AND (d.latMax IS NULL OR d.latMin < $latMax)`;
      } else {
        // Full containment mode: dataset bounds completely within user bounds
        sql += `\n  AND (d.latMin >= $latMin OR d.latMin IS NULL)`;
        sql += `\n  AND (d.latMax <= $latMax OR d.latMax IS NULL)`;
      }
      bindings.$latMin = spatial.latMin;
      bindings.$latMax = spatial.latMax;
    }

    if (spatial.lonMin != null && spatial.lonMax != null) {
      if (includePartialOverlaps) {
        // Partial overlap mode
        sql += `\n  AND (d.lonMax > $lonMin OR d.lonMin IS NULL)`;
        sql += `\n  AND (d.lonMax IS NULL OR d.lonMin < $lonMax)`;
      } else {
        // Full containment mode
        sql += `\n  AND (d.lonMin >= $lonMin OR d.lonMin IS NULL)`;
        sql += `\n  AND (d.lonMax <= $lonMax OR d.lonMax IS NULL)`;
      }
      bindings.$lonMin = spatial.lonMin;
      bindings.$lonMax = spatial.lonMax;
    }
  }

  // Add temporal filters (match backend with NULL handling)
  if (temporal && dateRangePreset === 'Custom Range') {
    if (temporal.timeMin && temporal.timeMax) {
      if (includePartialOverlaps) {
        // Partial overlap mode
        sql += `\n  AND (d.timeMax > $timeMin OR d.timeMax IS NULL)`;
        sql += `\n  AND (d.timeMax IS NULL OR d.timeMin < $timeMax)`;
      } else {
        // Full containment mode
        sql += `\n  AND (d.timeMin >= $timeMin OR d.timeMin IS NULL)`;
        sql += `\n  AND (d.timeMax <= $timeMax OR d.timeMax IS NULL)`;
      }
      bindings.$timeMin = temporal.timeMin;
      bindings.$timeMax = temporal.timeMax;
    }
  }

  // Add depth filters (match backend with NULL handling)
  if (depth) {
    if (depth.hasDepth !== undefined) {
      if (depth.hasDepth) {
        sql += `\n  AND d.depthMax IS NOT NULL`;
      }
    }

    if (depth.depthMin != null && depth.depthMax != null) {
      if (includePartialOverlaps) {
        // Partial overlap mode
        sql += `\n  AND (d.depthMax >= $depthMin OR d.depthMax IS NULL)`;
        sql += `\n  AND (d.depthMin <= $depthMax OR d.depthMin IS NULL)`;
      } else {
        // Full containment mode
        sql += `\n  AND (d.depthMin >= $depthMin OR d.depthMin IS NULL)`;
        sql += `\n  AND (d.depthMax <= $depthMax OR d.depthMax IS NULL)`;
      }
      bindings.$depthMin = depth.depthMin;
      bindings.$depthMax = depth.depthMax;
    }
  }

  // Order by shortName ASC (frontend UX preference - backend uses Dataset_ID DESC)
  sql += `\n  ORDER BY d.shortName ASC`;

  return { sql, bindings };
}

/**
 * Execute search query
 * @param {SearchQuery} query - Search parameters
 * @param {number} searchId - Unique search identifier
 */
async function executeSearch(query, searchId) {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const {
      text,
      spatial,
      temporal,
      depth,
      limit = 50,
      offset = 0,
      useRanking = true,
      excludeFields,
      searchMode = 'like',      // Default to LIKE mode (matches backend)
      phraseMatch = false,      // Keyword splitting with AND logic (matches backend)
      includePartialOverlaps = true,  // Partial overlap vs full containment
      region = null,            // Region filter
      datasetType = null,       // Dataset type filter
      dateRangePreset = null,   // Date range preset filter
    } = query;

    // Build SQL query
    let sql;
    let bindings = {};

    // LIKE mode (default - matches backend behavior)
    if (searchMode === 'like') {
      const likeQuery = buildLikeSearch(
        text,
        spatial,
        temporal,
        depth,
        excludeFields,
        phraseMatch,  // Pass phrase matching flag (default: false = keyword AND logic)
        includePartialOverlaps,
        region,
        datasetType,
        dateRangePreset,
      );
      sql = likeQuery.sql;
      bindings = likeQuery.bindings;

      // Add pagination for LIKE mode (only if limit is specified)
      if (limit !== null && limit !== undefined) {
        sql += ` LIMIT $limit OFFSET $offset`;
        bindings.$limit = limit;
        bindings.$offset = offset;
      }
    } else if (text && text.trim()) {
      // Full-text search with optional filters
      sql = `
        SELECT
          d.datasetId,
          d.shortName,
          d.longName,
          d.description,
          d.latMin,
          d.latMax,
          d.lonMin,
          d.lonMax,
          d.timeMin,
          d.timeMax,
          d.depthMin,
          d.depthMax,
          d.datasetType,
          d.regions,
          d.rowCount,
          d.metadataJson,
          fts.rank
        FROM datasets_fts fts
        JOIN datasets d ON fts.rowid = d.rowid
        WHERE datasets_fts MATCH $text
      `;

      // Build FTS match query with field exclusion support
      let matchQuery;
      if (excludeFields && excludeFields.length > 0) {
        // Build field-specific MATCH query
        const allFtsFields = [
          'shortName',
          'longName',
          'description',
          'variableLongNames',
          'variableShortNames',
          'sensors',
          'distributor',
          'dataSource',
          'keywords',
          'processLevel',
          'studyDomain',
        ];

        const fieldsToSearch = allFtsFields.filter(
          (f) => !excludeFields.includes(f),
        );

        // FTS5 syntax: {field1 field2}: search_term
        matchQuery = `{${fieldsToSearch.join(' ')}}: ${text.trim()}`;
      } else {
        // Search all fields (default)
        matchQuery = text.trim();
      }

      bindings.$text = matchQuery;
    } else {
      // No text search, just filter by bounds
      sql = `
        SELECT
          datasetId,
          shortName,
          longName,
          description,
          latMin,
          latMax,
          lonMin,
          lonMax,
          timeMin,
          timeMax,
          depthMin,
          depthMax,
          datasetType,
          regions,
          rowCount,
          metadataJson,
          0 as rank
        FROM datasets
        WHERE 1=1
      `;
    }

    // Add spatial filters (with NULL handling to match backend)
    // Only apply filters if not using LIKE mode (LIKE mode handles its own filters)
    if (searchMode !== 'like') {
      if (spatial) {
        if (spatial.latMin != null && spatial.latMax != null) {
          sql += ` AND (d.latMax > $latMin OR d.latMin IS NULL)`;
          sql += ` AND (d.latMax IS NULL OR d.latMin < $latMax)`;
          bindings.$latMin = spatial.latMin;
          bindings.$latMax = spatial.latMax;
        }
        if (spatial.lonMin != null && spatial.lonMax != null) {
          sql += ` AND (d.lonMax > $lonMin OR d.lonMin IS NULL)`;
          sql += ` AND (d.lonMax IS NULL OR d.lonMin < $lonMax)`;
          bindings.$lonMin = spatial.lonMin;
          bindings.$lonMax = spatial.lonMax;
        }
      }

      // Add temporal filters (with NULL handling to match backend)
      if (temporal) {
        if (temporal.timeMin && temporal.timeMax) {
          sql += ` AND (d.timeMax > $timeMin OR d.timeMax IS NULL)`;
          sql += ` AND (d.timeMax IS NULL OR d.timeMin < $timeMax)`;
          bindings.$timeMin = temporal.timeMin;
          bindings.$timeMax = temporal.timeMax;
        }
      }

      // Add depth filters (with NULL handling to match backend)
      if (depth) {
        if (depth.hasDepth !== undefined) {
          if (depth.hasDepth) {
            sql += ` AND d.depthMax IS NOT NULL`;
          }
        }

        if (depth.depthMin != null && depth.depthMax != null) {
          sql += ` AND (d.depthMax >= $depthMin OR d.depthMax IS NULL)`;
          sql += ` AND (d.depthMin <= $depthMax OR d.depthMin IS NULL)`;
          bindings.$depthMin = depth.depthMin;
          bindings.$depthMax = depth.depthMax;
        }
      }
    }

    // Add ordering and pagination (skip if LIKE mode, already added)
    if (searchMode !== 'like') {
      // TODO: Make useRanking configurable from UI when ready
      if (text && text.trim() && useRanking) {
        sql += ` ORDER BY rank ASC`;
      } else {
        // Use the column alias from SELECT (works for both queries)
        if (text && text.trim()) {
          sql += ` ORDER BY d.shortName ASC`;
        } else {
          sql += ` ORDER BY shortName ASC`;
        }
      }

      // Add pagination (only if limit is specified)
      if (limit !== null && limit !== undefined) {
        sql += ` LIMIT $limit OFFSET $offset`;
        bindings.$limit = limit;
        bindings.$offset = offset;
      }
    }

    // Execute query
    const results = [];
    db.exec({
      sql,
      bind: bindings,
      rowMode: 'object',
      callback: (row) => {
        results.push({
          // Original fields
          datasetId: row.datasetId,
          shortName: row.shortName,
          longName: row.longName,
          description: row.description,
          rank: row.rank || 0,
          metadata: row.metadataJson ? JSON.parse(row.metadataJson) : {},
          spatial: {
            latMin: row.latMin,
            latMax: row.latMax,
            lonMin: row.lonMin,
            lonMax: row.lonMax,
          },
          temporal: {
            timeMin: row.timeMin,
            timeMax: row.timeMax,
          },
          depth: {
            depthMin: row.depthMin,
            depthMax: row.depthMax,
          },
          // CollectionDatasetsTable format fields
          type: row.datasetType || 'Unknown',
          regions: row.regions ? row.regions.split(',').map(r => r.trim()) : [],
          timeStart: row.timeMin,
          timeEnd: row.timeMax,
          rowCount: row.rowCount || 0,
          isInvalid: false, // All catalog datasets are valid
        });
      },
    });

    postMessage({ type: 'search-results', searchId, results });
  } catch (error) {
    console.error('[Worker] Search error:', error);
    postMessage({
      type: 'search-error',
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

    postMessage({ type: 'regions-results', searchId, results });
  } catch (error) {
    console.error('[Worker] Get regions error:', error);
    postMessage({
      type: 'regions-error',
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
    postMessage({ type: 'cleanup-success' });
  } catch (error) {
    postMessage({
      type: 'cleanup-error',
      error: error.message || 'Cleanup failed',
    });
  }
}

// Message handler
self.onmessage = (event) => {
  const { type, dbBlob, query, searchId } = event.data;

  switch (type) {
    case 'init':
      initializeDatabase(dbBlob);
      break;
    case 'search':
      executeSearch(query, searchId);
      break;
    case 'get-regions':
      getRegions(searchId);
      break;
    case 'cleanup':
      cleanup();
      break;
    default:
      postMessage({
        type: 'error',
        error: `Unknown message type: ${type}`,
      });
  }
};
