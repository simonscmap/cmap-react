import Fuse from 'fuse.js';
import { getNestedProperty } from './objectUtils';

// Search Algorithm Utilities
// Implements wildcard and fuzzy search engines with Fuse.js integration

/**
 * Convert wildcard pattern to regex
 * Rules:
 * 1. If no asterisk (*) in input, add wildcard at the end
 * 2. If asterisk exists in input, treat it as the wildcard (no additional asterisk added)
 * @param {string} pattern - Wildcard pattern with * characters
 * @returns {RegExp} - Compiled regex pattern
 */
export function wildcardToRegex(pattern) {
  if (!pattern || typeof pattern !== 'string') {
    throw new Error('Pattern must be a non-empty string');
  }

  let adjustedPattern = pattern;

  // Rule 1: Add * to end only if no asterisk exists anywhere in the pattern
  if (!adjustedPattern.includes('*')) {
    adjustedPattern += '*';
  }
  // Rule 2: If asterisk exists, use pattern as-is (no additional asterisk)

  // Escape regex special characters except '*'
  const escaped = adjustedPattern.replace(/[-[\]/{}()+?.\\^$|]/g, '\\$&');

  // Convert '*' to '.*' for regex
  const regexStr = '^' + escaped.replace(/\*/g, '.*') + '$';

  try {
    return new RegExp(regexStr, 'i'); // Case-insensitive
  } catch (error) {
    throw new Error(`Invalid regex pattern: ${error.message}`);
  }
}

/**
 * Score relevance for sorting results
 * @param {string} value - The value to score against
 * @param {string} query - The search query (with wildcards removed)
 * @returns {number} - Relevance score (lower is better)
 */
function scoreRelevance(value, query) {
  if (!value || !query) return 4; // Lowest relevance

  const lowerValue = value.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (lowerValue === lowerQuery) return 0; // exact match
  if (lowerValue.startsWith(lowerQuery)) return 1; // starts with
  if (lowerValue.includes(lowerQuery)) return 2; // contains
  return 3; // pattern match only
}

/**
 * Sort items by relevance based on search input
 * @param {Array} items - Items to sort
 * @param {string} query - Search query
 * @param {Array} searchKeys - Keys to search in each item
 * @returns {Array} - Sorted array of items
 */
function sortByRelevance(items, query, searchKeys) {
  const cleanQuery = query.replace(/\*/g, '');

  return [...items].sort((a, b) => {
    // Get best relevance score for each item across all search keys
    let scoreA = Number.MAX_SAFE_INTEGER;
    let scoreB = Number.MAX_SAFE_INTEGER;

    for (const key of searchKeys) {
      const valueA = getNestedProperty(a, key) || '';
      const valueB = getNestedProperty(b, key) || '';

      scoreA = Math.min(scoreA, scoreRelevance(String(valueA), cleanQuery));
      scoreB = Math.min(scoreB, scoreRelevance(String(valueB), cleanQuery));
    }

    if (scoreA !== scoreB) return scoreA - scoreB;

    // Alphabetical tiebreaker using first search key
    const firstKeyA = getNestedProperty(a, searchKeys[0]) || '';
    const firstKeyB = getNestedProperty(b, searchKeys[0]) || '';
    return String(firstKeyA).localeCompare(String(firstKeyB));
  });
}

/**
 * Perform wildcard search on array of objects
 * @param {Array} items - Items to search through
 * @param {string} query - Wildcard search query
 * @param {Array} searchKeys - Object properties to search (supports dot notation)
 * @returns {Array} - Filtered and sorted items
 */
export const wildcardSearch = (items, query, searchKeys) => {
  if (!items || !Array.isArray(items)) {
    throw new Error('Items must be an array');
  }

  if (!query || !query.trim()) {
    return items;
  }

  if (!searchKeys || !Array.isArray(searchKeys) || searchKeys.length === 0) {
    throw new Error('SearchKeys must be a non-empty array');
  }

  try {
    const trimmedQuery = query.trim();
    const regex = wildcardToRegex(trimmedQuery);

    // Filter items that match the pattern in any of the search keys
    const filtered = items.filter((item) => {
      return searchKeys.some((key) => {
        const value = getNestedProperty(item, key);
        return value && regex.test(String(value));
      });
    });

    // Sort by relevance
    return sortByRelevance(filtered, query, searchKeys);
  } catch (error) {
    throw new Error(`Wildcard search failed: ${error.message}`);
  }
};

/**
 * Default Fuse.js configuration matching task requirements
 */
export const DEFAULT_FUSE_OPTIONS = {
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

/**
 * Create and configure Fuse.js instance
 * @param {Array} items - Items to search through
 * @param {Array} searchKeys - Object properties to search (supports dot notation)
 * @param {Object} options - Custom Fuse.js options
 * @returns {Fuse} - Configured Fuse.js instance
 */
export const createFuseInstance = (items, searchKeys, options = {}) => {
  if (!items || !Array.isArray(items)) {
    throw new Error('Items must be an array');
  }

  if (!searchKeys || !Array.isArray(searchKeys) || searchKeys.length === 0) {
    throw new Error('SearchKeys must be a non-empty array');
  }

  try {
    const fuseOptions = {
      ...DEFAULT_FUSE_OPTIONS,
      ...options,
      keys: searchKeys, // Override keys with provided searchKeys
    };

    return new Fuse(items, fuseOptions);
  } catch (error) {
    throw new Error(`Failed to create Fuse instance: ${error.message}`);
  }
};

/**
 * Perform fuzzy search using Fuse.js
 * @param {Array} items - Items to search through
 * @param {string} query - Search query
 * @param {Array} searchKeys - Object properties to search (supports dot notation)
 * @param {Object} options - Custom Fuse.js options
 * @returns {Array} - Search results with match data
 */
export const fuzzySearch = (items, query, searchKeys, options = {}) => {
  if (!items || !Array.isArray(items)) {
    throw new Error('Items must be an array');
  }

  if (!query || !query.trim()) {
    return items.map((item) => ({
      item,
      matches: [],
      score: 0,
    }));
  }

  if (!searchKeys || !Array.isArray(searchKeys) || searchKeys.length === 0) {
    throw new Error('SearchKeys must be a non-empty array');
  }

  try {
    const fuse = createFuseInstance(items, searchKeys, options);
    const results = fuse.search(query.trim());

    return results.map((result) => ({
      item: result.item,
      matches: result.matches || [],
      score: result.score || 0,
    }));
  } catch (error) {
    throw new Error(`Fuzzy search failed: ${error.message}`);
  }
};

/**
 * Search engine types
 */
export const SEARCH_ENGINES = {
  WILDCARD: 'wildcard',
  FUZZY: 'fuzzy',
};

/**
 * Unified search function that handles both wildcard and fuzzy search
 * @param {Array} items - Items to search through
 * @param {string} query - Search query
 * @param {Array} searchKeys - Object properties to search
 * @param {string} engine - Search engine type ('wildcard' or 'fuzzy')
 * @param {Object} options - Additional options for fuzzy search
 * @returns {Object} - Search results with consistent format
 */
export const performSearch = (
  items,
  query,
  searchKeys,
  engine = SEARCH_ENGINES.FUZZY,
  options = {},
) => {
  if (!items || !Array.isArray(items)) {
    throw new Error('Items must be an array');
  }

  if (!query || !query.trim()) {
    return {
      results: items,
      matches: items.map((item) => ({
        item,
        matches: [],
        score: 0,
      })),
    };
  }

  if (!searchKeys || !Array.isArray(searchKeys) || searchKeys.length === 0) {
    throw new Error('SearchKeys must be a non-empty array');
  }

  try {
    if (engine === SEARCH_ENGINES.WILDCARD) {
      const results = wildcardSearch(items, query, searchKeys);
      return {
        results,
        matches: results.map((item) => ({
          item,
          matches: [], // No highlight data for wildcard
          score: 0, // Perfect score for wildcard matches
        })),
      };
    } else {
      const matches = fuzzySearch(items, query, searchKeys, options);
      return {
        results: matches.map((match) => match.item),
        matches,
      };
    }
  } catch (error) {
    throw new Error(`Search failed: ${error.message}`);
  }
};
