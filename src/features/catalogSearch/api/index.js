/**
 * Catalog Search API - Unified Facade
 *
 * Provides a clean, unified interface for all catalog search operations.
 * This facade combines HTTP-based database operations, IndexedDB caching,
 * and SQLite Web Worker search into a single, consistent API.
 *
 * Architecture:
 * - catalogDbApi: HTTP download + IndexedDB cache management
 * - searchDatabaseApi: Web Worker lifecycle + query execution
 * - queries/: Structured query construction (SearchQueryBuilder)
 * - transformers/: Result transformation (raw DB rows → UI format)
 *
 * @module catalogSearch/api
 *
 * @example Basic Search
 * import { initializeCatalogSearch, searchCatalog, createSearchQuery } from './api';
 *
 * // Initialize once (downloads DB, starts worker)
 * await initializeCatalogSearch();
 *
 * // Build and execute search
 * const query = createSearchQuery()
 *   .withText('temperature')
 *   .withSpatialBounds({ latMin: 30, latMax: 50, lonMin: -130, lonMax: -110 })
 *   .build();
 *
 * const results = await searchCatalog(query);
 *
 * @example Advanced Query Building
 * import { createSearchQuery, DATE_RANGE_PRESETS, SEARCH_MODES } from './api';
 *
 * const query = createSearchQuery()
 *   .withText('ocean color chlorophyll', { phraseMatch: true })
 *   .withDateRangePreset(DATE_RANGE_PRESETS.LAST_YEAR)
 *   .withRegions(['North Pacific', 'Gulf of Alaska'])
 *   .withSearchMode(SEARCH_MODES.FTS)
 *   .withPagination(100, 0)
 *   .build();
 *
 * @example Cache Management
 * import { getDatabaseVersion, clearDatabaseCache } from './api';
 *
 * // Check cached version
 * const version = await getDatabaseVersion();
 * console.log(`Cached DB checksum: ${version?.checksum}`);
 *
 * // Force refresh by clearing cache
 * await clearDatabaseCache();
 * await initializeCatalogSearch();
 */

import {
  loadDatabase,
  getDatabaseVersion as getDbVersion,
  clearCache,
} from './catalogDbApi';
import {
  getSearchDatabaseApi,
  resetSearchDatabaseApi,
} from './searchDatabaseApi';

// Re-export low-level API access (for advanced use cases like estimation)
export { getSearchDatabaseApi };

// Re-export query construction and constants
export {
  createSearchQuery,
  SearchQueryBuilder,
  SEARCH_MODES,
  DATE_RANGE_PRESETS,
  DATASET_TYPES,
  DEFAULTS,
  LIMITS,
  validateQuery,
} from './queries';

// Re-export transformers (for advanced use cases)
export { transformSearchResults } from './transformers';

// =============================================================================
// High-Level API Functions
// =============================================================================

/**
 * Initialize the catalog search system
 *
 * Downloads the SQLite database (or loads from IndexedDB cache),
 * starts the Web Worker, and prepares the search system for use.
 *
 * This function is idempotent - calling it multiple times will not
 * re-initialize if already initialized.
 *
 * @returns {Promise<void>}
 * @throws {Error} If database download fails or worker initialization fails
 *
 * @example
 * try {
 *   await initializeCatalogSearch();
 *   console.log('Catalog search ready');
 * } catch (error) {
 *   console.error('Failed to initialize catalog search:', error);
 * }
 */
export async function initializeCatalogSearch() {
  const api = getSearchDatabaseApi();
  await api.initialize();
}

/**
 * Execute a catalog search query
 *
 * Searches the catalog using a structured query object.
 * Use SearchQueryBuilder (via createSearchQuery()) to construct queries.
 *
 * @param {Object} query - Structured search query object
 * @param {string} [query.text] - Text search term
 * @param {boolean} [query.phraseMatch=false] - Exact phrase vs keyword search
 * @param {string} [query.searchMode='like'] - Search mode: 'like' or 'fts'
 * @param {Object} [query.spatial] - Spatial bounds filter
 * @param {number} [query.spatial.latMin] - Minimum latitude (-90 to 90)
 * @param {number} [query.spatial.latMax] - Maximum latitude (-90 to 90)
 * @param {number} [query.spatial.lonMin] - Minimum longitude (-180 to 180)
 * @param {number} [query.spatial.lonMax] - Maximum longitude (-180 to 180)
 * @param {boolean} [query.spatial.includePartialOverlaps=true] - Include partial overlaps
 * @param {Object} [query.temporal] - Temporal range filter
 * @param {string} [query.temporal.timeMin] - Start date (ISO 8601: YYYY-MM-DD)
 * @param {string} [query.temporal.timeMax] - End date (ISO 8601: YYYY-MM-DD)
 * @param {string} [query.dateRangePreset='Any Date'] - Date range preset
 * @param {Object} [query.depth] - Depth range filter
 * @param {number} [query.depth.depthMin] - Minimum depth (meters)
 * @param {number} [query.depth.depthMax] - Maximum depth (meters)
 * @param {string[]} [query.regions] - Region name filters
 * @param {string} [query.datasetType='All Types'] - Dataset type filter
 * @param {number} [query.limit=50] - Maximum results (1-1000)
 * @param {number} [query.offset=0] - Pagination offset
 * @param {string[]} [query.excludeFields] - Fields to exclude from results
 *
 * @returns {Promise<Object[]>} Array of dataset objects with transformed fields:
 *   - datasetId: number - Unique dataset identifier
 *   - shortName: string - Dataset short name
 *   - longName: string - Dataset long name
 *   - description: string - Dataset description
 *   - type: string - Dataset type ('Model', 'Satellite', 'In-Situ')
 *   - regions: string[] - Array of region names
 *   - spatial: { latMin, latMax, lonMin, lonMax } - Spatial bounds
 *   - temporal: { timeMin, timeMax, timeStart, timeEnd } - Temporal range
 *   - depth: { depthMin, depthMax } - Depth range
 *   - rowCount: number - Number of data rows
 *   - rank: number - Relevance rank (for FTS queries)
 *   - metadata: object - Parsed metadata JSON
 *   - isInvalid: boolean - Always false (reserved for UI state)
 *
 * @throws {Error} If search service not initialized or query execution fails
 *
 * @example Using SearchQueryBuilder (recommended)
 * const query = createSearchQuery()
 *   .withText('chlorophyll')
 *   .withSpatialBounds({ latMin: 30, latMax: 50, lonMin: -130, lonMax: -110 })
 *   .build();
 * const results = await searchCatalog(query);
 *
 * @example Manual query object (advanced)
 * const results = await searchCatalog({
 *   text: 'temperature',
 *   spatial: { latMin: -90, latMax: 90, lonMin: -180, lonMax: 180 },
 *   limit: 100
 * });
 */
export async function searchCatalog(query) {
  const api = getSearchDatabaseApi();
  return await api.search(query);
}

/**
 * Get all available regions from the catalog
 *
 * Returns a list of unique region names that can be used for filtering.
 * Useful for populating region dropdown/filter UI components.
 *
 * @returns {Promise<string[]>} Array of region names, sorted alphabetically
 * @throws {Error} If search service not initialized
 *
 * @example
 * const regions = await getRegions();
 * // ['Atlantic Ocean', 'Gulf of Alaska', 'Mediterranean Sea', ...]
 */
export async function getRegions() {
  const api = getSearchDatabaseApi();
  return await api.getRegions();
}

/**
 * Get the initialization status of the catalog search system
 *
 * Returns the current state of the search system, useful for UI loading states
 * and error handling.
 *
 * @returns {Object} Status object
 * @property {boolean} isInitialized - True if fully initialized and ready
 * @property {boolean} isInitializing - True if initialization in progress
 * @property {Error|null} error - Initialization error, if any
 *
 * @example
 * const status = getCatalogSearchStatus();
 * if (status.isInitializing) {
 *   console.log('Loading catalog...');
 * } else if (status.error) {
 *   console.error('Failed to load:', status.error);
 * } else if (status.isInitialized) {
 *   console.log('Ready to search');
 * }
 */
export function getCatalogSearchStatus() {
  const api = getSearchDatabaseApi();
  return api.getStatus();
}

/**
 * Check if client-side search is available
 *
 * Returns true if the search system is fully initialized and ready for queries.
 * Use this for conditional logic or fallback to server-side search.
 *
 * @returns {boolean} True if search is available, false otherwise
 *
 * @example
 * if (isClientSideSearchAvailable()) {
 *   // Use local SQLite search
 *   const results = await searchCatalog(query);
 * } else {
 *   // Fall back to server-side API
 *   const results = await fetchFromServer(query);
 * }
 */
export function isClientSideSearchAvailable() {
  const api = getSearchDatabaseApi();
  return api.isClientSideAvailable();
}

/**
 * Get the version information of the cached database
 *
 * Returns metadata about the currently cached database, including checksum,
 * schema hash, dataset count, and generation timestamp.
 *
 * Returns null if no database is cached.
 *
 * @returns {Promise<Object|null>} Version metadata or null
 * @property {string} checksum - Data content checksum
 * @property {string} schemaHash - Auto-computed schema hash
 * @property {number} datasetCount - Total number of datasets
 * @property {string} generatedAt - ISO timestamp of generation
 *
 * @example
 * const version = await getDatabaseVersion();
 * if (version) {
 *   console.log(`Cached DB has ${version.datasetCount} datasets`);
 *   console.log(`Generated: ${version.generatedAt}`);
 *   console.log(`Checksum: ${version.checksum}`);
 * } else {
 *   console.log('No cached database');
 * }
 */
export async function getDatabaseVersion() {
  return await getDbVersion();
}

/**
 * Clear the cached database from IndexedDB
 *
 * Forces a fresh download on the next initialization.
 * Useful for testing, debugging, or forcing updates when you know
 * the catalog has been updated on the server.
 *
 * Note: This does NOT stop or cleanup the currently running search system.
 * Call cleanupCatalogSearch() first if you want to reset everything.
 *
 * @returns {Promise<void>}
 *
 * @example Force cache refresh
 * await clearDatabaseCache();
 * await initializeCatalogSearch(); // Downloads fresh copy
 *
 * @example Full reset
 * cleanupCatalogSearch();          // Stop worker
 * await clearDatabaseCache();      // Clear cache
 * await initializeCatalogSearch(); // Reinitialize from scratch
 */
export async function clearDatabaseCache() {
  await clearCache();
}

/**
 * Cleanup catalog search resources
 *
 * Terminates the Web Worker and cleans up all resources.
 * After calling this, you must call initializeCatalogSearch() again
 * before performing any searches.
 *
 * This does NOT clear the IndexedDB cache - use clearDatabaseCache() for that.
 *
 * Call this when:
 * - Component unmounting (if search is scoped to component lifecycle)
 * - App teardown
 * - Testing cleanup
 * - Forcing a fresh restart
 *
 * @returns {void}
 *
 * @example Component cleanup
 * useEffect(() => {
 *   initializeCatalogSearch();
 *   return () => {
 *     cleanupCatalogSearch();
 *   };
 * }, []);
 */
export function cleanupCatalogSearch() {
  const api = getSearchDatabaseApi();
  api.cleanup();
}

/**
 * Reset the search database API (for testing)
 *
 * Performs a full cleanup and resets the singleton instance.
 * This is primarily for testing purposes.
 *
 * After calling this, the next call to any search function will
 * create a new singleton instance.
 *
 * @returns {void}
 * @private
 *
 * @example Testing
 * afterEach(() => {
 *   resetCatalogSearchApi();
 * });
 */
export function resetCatalogSearchApi() {
  resetSearchDatabaseApi();
}
