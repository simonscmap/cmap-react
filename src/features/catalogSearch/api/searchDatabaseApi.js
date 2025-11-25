/**
 * Search Database API
 *
 * Manages the Web Worker lifecycle and provides a clean API for catalog search.
 * Implements structured query interface to the SQLite Web Worker.
 */

import { loadDatabase } from './catalogDbApi';
import { transformSearchResults } from './transformers';

class SearchDatabaseApi {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
    this.isInitializing = false;
    this.initError = null;
    this.pendingSearches = new Map();
    this.searchIdCounter = 0;
  }

  /**
   * Initialize the search service
   * Downloads database and sets up worker
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    if (this.isInitializing) {
      // Wait for current initialization to complete
      return new Promise((resolve, reject) => {
        const checkInit = setInterval(() => {
          if (this.isInitialized) {
            clearInterval(checkInit);
            resolve();
          } else if (this.initError) {
            clearInterval(checkInit);
            reject(this.initError);
          }
        }, 100);
      });
    }

    this.isInitializing = true;
    this.initError = null;

    try {
      // Load database blob
      const dbBlob = await loadDatabase();

      // Create and setup worker
      // Worker is co-located with SQLite files in public/sqlite-wasm/
      // This allows the library to auto-detect sqlite3.wasm in the same directory
      this.worker = new Worker(
        `${process.env.PUBLIC_URL}/sqlite-wasm/catalogSearchWorker.js`,
      );

      // Setup message handler
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);

      // Initialize worker with database
      await this.sendWorkerMessage('init', { dbBlob });

      this.isInitialized = true;
      this.isInitializing = false;
    } catch (error) {
      this.initError = error;
      this.isInitializing = false;
      throw error;
    }
  }

  /**
   * Check if client-side search is available
   * @returns {boolean}
   */
  isClientSideAvailable() {
    return this.isInitialized && !this.initError;
  }

  /**
   * Execute search query
   * @param {Object} query - Structured search query object
   * @returns {Promise<Array>} Transformed search results
   */
  async search(query) {
    if (!this.isInitialized) {
      throw new Error(
        'Search service not initialized. Call initialize() first.',
      );
    }

    // Get raw results from worker
    const rawResults = await this.sendWorkerMessage('search', { query });

    // Transform raw database rows to UI format
    return transformSearchResults(rawResults);
  }

  /**
   * Get all regions from the database
   * @returns {Promise<Array>} Array of region names
   */
  async getRegions() {
    if (!this.isInitialized) {
      throw new Error(
        'Search service not initialized. Call initialize() first.',
      );
    }

    const regions = await this.sendWorkerMessage('get-regions', {});

    return regions;
  }

  /**
   * Execute raw SQL query with parameter bindings
   * @param {string} sql - SQL query with ? placeholders
   * @param {Array|object} bindings - Parameter bindings (array for positional ?, object for named params)
   * @returns {Promise<Array>} Array of result rows
   */
  async executeSql(sql, bindings = []) {
    if (!this.isInitialized) {
      throw new Error(
        'Search service not initialized. Call initialize() first.',
      );
    }

    const results = await this.sendWorkerMessage('execute-sql', {
      sql,
      bindings,
    });

    return results;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.worker) {
      this.worker.postMessage({ type: 'cleanup' });
      this.worker.terminate();
      this.worker = null;
    }
    this.isInitialized = false;
    this.isInitializing = false;
    this.initError = null;
    this.pendingSearches.clear();
  }

  /**
   * Get initialization status
   * @returns {Object} Status object
   */
  getStatus() {
    const status = {
      isInitialized: this.isInitialized,
      isInitializing: this.isInitializing,
      error: this.initError,
    };

    return status;
  }

  /**
   * Send message to worker and wait for response
   * @private
   * @param {string} type - Message type
   * @param {Object} data - Message data
   * @returns {Promise<any>}
   */
  sendWorkerMessage(type, data) {
    return new Promise((resolve, reject) => {
      const searchId = this.searchIdCounter++;
      this.pendingSearches.set(searchId, { resolve, reject, type });

      this.worker.postMessage({
        ...data,
        type,
        searchId,
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingSearches.has(searchId)) {
          this.pendingSearches.delete(searchId);
          reject(new Error('Worker operation timeout'));
        }
      }, 30000);
    });
  }

  /**
   * Handle worker messages
   * @private
   * @param {MessageEvent} event
   */
  handleWorkerMessage(event) {
    const { type, searchId, results, error } = event.data;

    switch (type) {
      case 'init-success':
        // Resolve the pending init promise
        for (const [id, pending] of this.pendingSearches.entries()) {
          if (pending.type === 'init') {
            this.pendingSearches.delete(id);
            pending.resolve();
          }
        }
        break;

      case 'init-error':
        // Reject the pending init promise
        for (const [id, pending] of this.pendingSearches.entries()) {
          if (pending.type === 'init') {
            this.pendingSearches.delete(id);
            pending.reject(new Error(error));
          }
        }
        break;

      case 'search-results':
        if (this.pendingSearches.has(searchId)) {
          const pending = this.pendingSearches.get(searchId);
          this.pendingSearches.delete(searchId);
          pending.resolve(results);
        }
        break;

      case 'search-error':
        if (this.pendingSearches.has(searchId)) {
          const pending = this.pendingSearches.get(searchId);
          this.pendingSearches.delete(searchId);
          pending.reject(new Error(error));
        }
        break;

      case 'regions-results':
        if (this.pendingSearches.has(searchId)) {
          const pending = this.pendingSearches.get(searchId);
          this.pendingSearches.delete(searchId);
          pending.resolve(results);
        }
        break;

      case 'regions-error':
        if (this.pendingSearches.has(searchId)) {
          const pending = this.pendingSearches.get(searchId);
          this.pendingSearches.delete(searchId);
          pending.reject(new Error(error));
        }
        break;

      case 'sql-results':
        if (this.pendingSearches.has(searchId)) {
          const pending = this.pendingSearches.get(searchId);
          this.pendingSearches.delete(searchId);
          pending.resolve(results);
        }
        break;

      case 'sql-error':
        if (this.pendingSearches.has(searchId)) {
          const pending = this.pendingSearches.get(searchId);
          this.pendingSearches.delete(searchId);
          pending.reject(new Error(error));
        }
        break;

      case 'cleanup-success':
        // Cleanup acknowledged
        break;

      default:
        console.warn('Unknown worker message type:', type);
    }
  }

  /**
   * Handle worker errors
   * @private
   * @param {ErrorEvent} event
   */
  handleWorkerError(event) {
    console.error('Worker error:', event);
    this.initError = new Error(event.message || 'Worker error');

    // Reject all pending operations
    for (const [id, pending] of this.pendingSearches.entries()) {
      this.pendingSearches.delete(id);
      pending.reject(this.initError);
    }
  }
}

// Singleton instance
let searchDatabaseApiInstance = null;

/**
 * Get singleton search database API instance
 * @returns {SearchDatabaseApi}
 */
export function getSearchDatabaseApi() {
  if (!searchDatabaseApiInstance) {
    searchDatabaseApiInstance = new SearchDatabaseApi();
  }
  return searchDatabaseApiInstance;
}

/**
 * Reset search database API (for testing)
 */
export function resetSearchDatabaseApi() {
  if (searchDatabaseApiInstance) {
    searchDatabaseApiInstance.cleanup();
    searchDatabaseApiInstance = null;
  }
}

export default SearchDatabaseApi;
