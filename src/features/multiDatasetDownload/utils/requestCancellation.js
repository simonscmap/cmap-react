/**
 * Request cancellation utilities for multi-dataset download operations
 *
 * Provides AbortController-based request cancellation with per-request tracking
 * and cleanup capabilities for filter change scenarios.
 */

/**
 * Creates and manages request cancellation controllers
 * Supports per-request cancellation and bulk cleanup operations
 */
export class RequestCancellationManager {
  constructor() {
    this.controllers = new Map();
    this.requestCounter = 0;
  }

  /**
   * Creates a new AbortController for a request
   * @param {string} requestType - Type of request (e.g., 'rowCount', 'download')
   * @param {string|number} [requestId] - Optional specific request ID
   * @returns {Object} { controller, requestId, signal }
   */
  createController(requestType, requestId = null) {
    const id =
      requestId || `${requestType}_${++this.requestCounter}_${Date.now()}`;
    const controller = new AbortController();

    this.controllers.set(id, {
      controller,
      type: requestType,
      createdAt: Date.now(),
    });

    return {
      controller,
      requestId: id,
      signal: controller.signal,
    };
  }

  /**
   * Cancels a specific request by ID
   * @param {string} requestId - ID of the request to cancel
   * @returns {boolean} - True if request was found and cancelled
   */
  cancelRequest(requestId) {
    const requestData = this.controllers.get(requestId);
    if (requestData) {
      requestData.controller.abort();
      this.controllers.delete(requestId);
      return true;
    }
    return false;
  }

  /**
   * Cancels all requests of a specific type
   * @param {string} requestType - Type of requests to cancel
   * @returns {number} - Number of requests cancelled
   */
  cancelRequestsByType(requestType) {
    let cancelledCount = 0;

    for (const [id, data] of this.controllers.entries()) {
      if (data.type === requestType) {
        data.controller.abort();
        this.controllers.delete(id);
        cancelledCount++;
      }
    }

    return cancelledCount;
  }

  /**
   * Cancels all active requests
   * @returns {number} - Number of requests cancelled
   */
  cancelAllRequests() {
    const count = this.controllers.size;

    for (const [, data] of this.controllers.entries()) {
      data.controller.abort();
    }

    this.controllers.clear();
    return count;
  }

  /**
   * Removes completed/cancelled requests from tracking
   * @param {string} requestId - ID of the request to clean up
   */
  cleanup(requestId) {
    this.controllers.delete(requestId);
  }

  /**
   * Gets the count of active requests by type
   * @param {string} [requestType] - Optional type filter
   * @returns {number} - Number of active requests
   */
  getActiveRequestCount(requestType = null) {
    if (!requestType) {
      return this.controllers.size;
    }

    let count = 0;
    for (const [, data] of this.controllers.values()) {
      if (data.type === requestType) {
        count++;
      }
    }
    return count;
  }

  /**
   * Checks if a request is still active
   * @param {string} requestId - ID of the request to check
   * @returns {boolean} - True if request is active
   */
  isRequestActive(requestId) {
    return this.controllers.has(requestId);
  }

  /**
   * Gets all active request IDs by type
   * @param {string} [requestType] - Optional type filter
   * @returns {string[]} - Array of active request IDs
   */
  getActiveRequestIds(requestType = null) {
    const ids = [];

    for (const [id, data] of this.controllers.entries()) {
      if (!requestType || data.type === requestType) {
        ids.push(id);
      }
    }

    return ids;
  }

  /**
   * Cleans up requests older than the specified age
   * @param {number} maxAgeMs - Maximum age in milliseconds
   * @returns {number} - Number of requests cleaned up
   */
  cleanupOldRequests(maxAgeMs = 300000) {
    // 5 minutes default
    const now = Date.now();
    let cleanedCount = 0;

    for (const [id, data] of this.controllers.entries()) {
      if (now - data.createdAt > maxAgeMs) {
        data.controller.abort();
        this.controllers.delete(id);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}

/**
 * Global request cancellation manager instance
 * Used across the multi-dataset download feature for consistent request management
 */
export const globalRequestManager = new RequestCancellationManager();

/**
 * Utility function to create a cancellable request wrapper
 * @param {Function} requestFunction - The async function to wrap
 * @param {string} requestType - Type of request for tracking
 * @param {string|number} [requestId] - Optional specific request ID
 * @returns {Object} { promise, cancel, requestId }
 */
export function createCancellableRequest(
  requestFunction,
  requestType,
  requestId = null,
) {
  const {
    controller,
    requestId: id,
    signal,
  } = globalRequestManager.createController(requestType, requestId);

  const promise = requestFunction(signal).finally(() => {
    globalRequestManager.cleanup(id);
  });

  return {
    promise,
    cancel: () => globalRequestManager.cancelRequest(id),
    requestId: id,
    isActive: () => globalRequestManager.isRequestActive(id),
  };
}

/**
 * Hook-like utility for React components to manage request cancellation
 * @param {string} requestType - Type of requests this component manages
 * @returns {Object} - Request management utilities
 */
export function useRequestCancellation(requestType) {
  return {
    createRequest: (requestFunction, requestId) =>
      createCancellableRequest(requestFunction, requestType, requestId),

    cancelByType: () => globalRequestManager.cancelRequestsByType(requestType),

    cancelAll: () => globalRequestManager.cancelAllRequests(),

    getActiveCount: () =>
      globalRequestManager.getActiveRequestCount(requestType),

    cleanup: (requestId) => globalRequestManager.cleanup(requestId),
  };
}

/**
 * Handles AbortError for cancelled requests
 * @param {Error} error - The error to check
 * @returns {boolean} - True if error is from request cancellation
 */
export function isRequestCancelled(error) {
  return error.name === 'AbortError' || error.message.includes('aborted');
}

/**
 * Creates a timeout-based AbortController
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {AbortController} - Controller that will abort after timeout
 */
export function createTimeoutController(timeoutMs) {
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  return controller;
}
