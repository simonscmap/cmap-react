/**
 * Search Service
 *
 * Manages the Web Worker lifecycle and provides a clean API for catalog search.
 * Implements the SearchService interface defined in the plan.
 */

import { loadDatabase } from './dbLoader';

class SearchService {
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
   * @param {Object} query - Search query parameters
   * @returns {Promise<Array>} Search results
   */
  async search(query) {
    if (!this.isInitialized) {
      throw new Error(
        'Search service not initialized. Call initialize() first.',
      );
    }

    const results = await this.sendWorkerMessage('search', { query });

    return results;
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
let searchServiceInstance = null;

/**
 * Get singleton search service instance
 * @returns {SearchService}
 */
export function getSearchService() {
  if (!searchServiceInstance) {
    searchServiceInstance = new SearchService();
  }
  return searchServiceInstance;
}

/**
 * Reset search service (for testing)
 */
export function resetSearchService() {
  if (searchServiceInstance) {
    searchServiceInstance.cleanup();
    searchServiceInstance = null;
  }
}

export default SearchService;
