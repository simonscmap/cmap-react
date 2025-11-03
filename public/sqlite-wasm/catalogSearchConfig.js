/**
 * Catalog Search Worker Configuration
 *
 * Single source of truth for all constants, field lists, and configuration
 * used by the catalog search worker and SQL query builders.
 *
 * This file centralizes:
 * - Database schema (table/column names)
 * - Searchable field lists for different modes
 * - Message type constants
 * - Query defaults and limits
 * - Filter constants
 *
 * NOTE: This file is loaded via importScripts() in a Web Worker context.
 * It exports to self.CatalogSearchConfig instead of using ES6 export syntax.
 */

(function() {
  'use strict';

/**
 * Database schema configuration
 */
const SCHEMA = {
  // Table names
  tables: {
    datasets: 'datasets',
    datasetsFts: 'datasets_fts',
    regions: 'regions',
  },

  // Table aliases
  aliases: {
    datasets: 'd',
    datasetsFts: 'fts',
  },

  // Column names (normalized from backend snake_case to frontend camelCase)
  columns: {
    // Primary key
    datasetId: 'datasetId',

    // Core fields
    shortName: 'shortName',
    longName: 'longName',
    description: 'description',

    // Variable fields
    variableLongNames: 'variableLongNames',
    variableShortNames: 'variableShortNames',

    // Metadata fields
    sensors: 'sensors',
    distributor: 'distributor',
    dataSource: 'dataSource',
    processLevel: 'processLevel',
    studyDomain: 'studyDomain',
    keywords: 'keywords',
    datasetType: 'datasetType',
    regions: 'regions',

    // Spatial bounds
    latMin: 'latMin',
    latMax: 'latMax',
    lonMin: 'lonMin',
    lonMax: 'lonMax',

    // Temporal bounds
    timeMin: 'timeMin',
    timeMax: 'timeMax',

    // Depth bounds
    depthMin: 'depthMin',
    depthMax: 'depthMax',

    // Additional metadata
    rowCount: 'rowCount',
    metadataJson: 'metadataJson',

    // FTS rank (virtual column)
    rank: 'rank',
    rowid: 'rowid',
  },
};

/**
 * Searchable fields for different search modes
 *
 * LIKE mode excludes 'description' to match backend behavior
 * FTS mode includes all searchable text fields
 */
const SEARCHABLE_FIELDS = {
  /**
   * Fields searchable in LIKE mode (excludes 'description')
   * Matches backend search implementation
   */
  like: [
    'variableLongNames',   // Backend: Variable_Long_Names
    'variableShortNames',  // Backend: Variable_Short_Names
    'longName',            // Backend: Dataset_Long_Name
    'sensors',             // Backend: Sensors
    'keywords',            // Backend: Keywords
    'distributor',         // Backend: Distributor
    'dataSource',          // Backend: Data_Source
    'processLevel',        // Backend: Process_Level
    'studyDomain',         // Backend: Study_Domain
  ],

  /**
   * Fields searchable in FTS mode (includes all text fields)
   */
  fts: [
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
  ],
};

/**
 * Message type constants for worker communication
 * Prevents typos and provides type-safety
 */
const MESSAGE_TYPES = {
  // Incoming messages (main thread -> worker)
  INIT: 'init',
  SEARCH: 'search',
  GET_REGIONS: 'get-regions',
  CLEANUP: 'cleanup',

  // Outgoing success messages (worker -> main thread)
  INIT_SUCCESS: 'init-success',
  SEARCH_RESULTS: 'search-results',
  REGIONS_RESULTS: 'regions-results',
  CLEANUP_SUCCESS: 'cleanup-success',

  // Outgoing error messages (worker -> main thread)
  INIT_ERROR: 'init-error',
  SEARCH_ERROR: 'search-error',
  REGIONS_ERROR: 'regions-error',
  CLEANUP_ERROR: 'cleanup-error',
  ERROR: 'error',
};

/**
 * Query defaults and constants
 */
const QUERY_DEFAULTS = {
  // Default search mode
  searchMode: 'like',

  // Keyword splitting with AND logic (not phrase matching)
  phraseMatch: false,

  // Partial overlap mode (not full containment)
  includePartialOverlaps: true,

  // Use ranking for FTS results
  useRanking: true,

  // Default offset for pagination
  offset: 0,

  // Default sort order
  sortField: 'shortName',
  sortDirection: 'ASC',
};

/**
 * Filter constants
 */
const FILTER_VALUES = {
  // Special values that mean "no filter applied"
  ALL_TYPES: 'All Types',
  ALL_REGIONS: 'All Regions',

  // Dataset types
  DATASET_TYPES: {
    MODEL: 'Model',
    SATELLITE: 'Satellite',
    IN_SITU: 'In-Situ',
  },

  // Overlap modes
  OVERLAP_MODES: {
    PARTIAL: 'partial',      // Dataset bounds overlap with user bounds
    FULL: 'full',            // Dataset bounds completely within user bounds
  },
};

/**
 * Search mode constants
 */
const SEARCH_MODES = {
  LIKE: 'like',    // SQL LIKE pattern matching (default, matches backend)
  FTS: 'fts',      // Full-text search with ranking
};

/**
 * Sort mode constants
 */
const SORT_MODES = {
  DEFAULT: 'default',     // Data type → area ratio → spatial coverage → alphabetical
  SPATIAL: 'spatial',     // Spatial coverage → area ratio → alphabetical
  TEMPORAL: 'temporal',   // Temporal coverage → area ratio → alphabetical
  DEPTH: 'depth',         // Depth coverage → area ratio → alphabetical
};

/**
 * Timeout constants (in milliseconds)
 */
const TIMEOUTS = {
  WORKER_OPERATION: 30000,   // 30 seconds for any worker operation
  DATABASE_INIT: 60000,       // 60 seconds for database initialization
};

/**
 * Validation limits
 */
const LIMITS = {
  MAX_RESULTS: 10000,        // Maximum number of results per query
  MAX_OFFSET: 100000,        // Maximum pagination offset
  MIN_OFFSET: 0,             // Minimum pagination offset
};

// Export all configuration to global scope for worker access
self.CatalogSearchConfig = {
  SCHEMA,
  SEARCHABLE_FIELDS,
  MESSAGE_TYPES,
  QUERY_DEFAULTS,
  FILTER_VALUES,
  SEARCH_MODES,
  SORT_MODES,
  TIMEOUTS,
  LIMITS,
};

})();
