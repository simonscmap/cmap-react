// Search activation threshold - when to show search interface
export const SEARCH_ACTIVATION_THRESHOLD = 25;

// Search performance target (milliseconds)
export const SEARCH_PERFORMANCE_TARGET = 100;

// Search debounce delay (milliseconds) - delay before performing search after user stops typing
export const SEARCH_DEBOUNCE_DELAY = 300;

// Maximum number of search results to display in dropdown
export const SEARCH_RESULTS_DISPLAY_LIMIT = 10000;

export const MIN_SEARCH_LENGTH = 1;

// Fuse.js search configuration
export const SEARCH_CONFIG = {
  keys: ['name'], // Search filename only
  threshold: 0.4, // 0.0 = exact match, 1.0 = match anything
  distance: 200, // Maximum distance for fuzzy matching
  minMatchCharLength: 1, // Minimum character length to trigger search
  includeMatches: true, // Include match data for highlighting
  includeScore: true, // Include search score
  shouldSort: true, // Sort results by score
  location: 0, // Expected location of match
  maxPatternLength: 100, // Maximum pattern length
  findAllMatches: false, // Stop after first match per item
};

// Search state constants
export const SEARCH_STATES = {
  IDLE: 'idle',
  SEARCHING: 'searching',
  RESULTS: 'results',
  NO_RESULTS: 'no_results',
  ERROR: 'error',
};
