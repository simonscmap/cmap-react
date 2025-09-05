// Search Configuration Constants
// Defines thresholds, debounce timing, and Fuse.js settings

// Placeholder implementation - to be completed in Task 2, 3, 4
export const SEARCH_CONFIG = {
  // TODO: Define search configuration constants including thresholds, debounce timing
  DEBOUNCE_MS: 300,
  ACTIVATION_THRESHOLD: 2,
  FUSE_THRESHOLD: 0.4,
  FUSE_DISTANCE: 200,
  FUSE_MIN_MATCH_LENGTH: 1,
};

export const SEARCH_ENGINES = {
  WILDCARD: 'wildcard',
  FUZZY: 'fuzzy',
};

export const DEFAULT_SETTINGS = {
  // TODO: Define default settings for search functionality
  searchEngine: SEARCH_ENGINES.WILDCARD,
  debounceMs: SEARCH_CONFIG.DEBOUNCE_MS,
  activationThreshold: SEARCH_CONFIG.ACTIVATION_THRESHOLD,
  caseSensitive: false,
  trimWhitespace: true,
};

console.warn('searchConstants - placeholder implementation');
