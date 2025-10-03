// Search Configuration Constants
// Defines thresholds, debounce timing, and Fuse.js settings

/**
 * Core search configuration constants
 */
export const SEARCH_CONFIG = {
  DEBOUNCE_MS: 300,
  ACTIVATION_THRESHOLD: 3,
  FUSE_THRESHOLD: 0.4,
  FUSE_DISTANCE: 200,
  FUSE_MIN_MATCH_LENGTH: 1,
};

/**
 * Available search engine types
 */
export const SEARCH_ENGINES = {
  WILDCARD: 'wildcard',
  FUZZY: 'fuzzy',
};

/**
 * Default settings for search functionality
 */
export const DEFAULT_SETTINGS = {
  searchEngine: SEARCH_ENGINES.WILDCARD,
  debounceMs: SEARCH_CONFIG.DEBOUNCE_MS,
  activationThreshold: SEARCH_CONFIG.ACTIVATION_THRESHOLD,
  caseSensitive: false,
  trimWhitespace: true,
};

/**
 * Search states for UI components
 */
export const SEARCH_STATES = {
  IDLE: 'idle',
  SEARCHING: 'searching',
  RESULTS: 'results',
  NO_RESULTS: 'no_results',
  ERROR: 'error',
};
