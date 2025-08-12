import Fuse from 'fuse.js';
import { SEARCH_CONFIG, SEARCH_ENGINES } from '../constants/searchConstants';

/**
 * Initialize Fuse.js search instance with optimized configuration
 * @param {Array} files - Files to search through
 */
export function createSearchInstance(files) {
  return new Fuse(files, SEARCH_CONFIG);
}

/**
 * Perform fuzzy search
 */
export function performSearch(searchInstance, query) {
  if (!query || !query.trim()) {
    return {
      results: [],
      matches: [],
    };
  }

  const fuseResults = searchInstance.search(query.trim());

  // Extract results and match data
  const results = fuseResults.map((result) => result.item);
  const matches = fuseResults.map((result) => ({
    item: result.item,
    matches: result.matches || [],
    score: result.score,
  }));

  return {
    results,
    matches,
  };
}

/**
 * Get pattern hints from file list (first, middle, and last filename)
 */
export function getPatternHints(files) {
  if (!files || files.length === 0) {
    return { first: '', middle: '', last: '' };
  }

  const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name));
  const middleIndex = Math.floor(sortedFiles.length / 2);

  return {
    first: sortedFiles[0] ? sortedFiles[0].name : '',
    middle: sortedFiles[middleIndex] ? sortedFiles[middleIndex].name : '',
    last: sortedFiles[sortedFiles.length - 1]
      ? sortedFiles[sortedFiles.length - 1].name
      : '',
  };
}

/**
 * Check if search should be activated based on file count
 */
export function shouldActivateSearch(fileCount, threshold) {
  return fileCount > threshold;
}

/**
 * Convert wildcard pattern to regex
 * Rules:
 * 1. If no asterisk (*) in input, add wildcard at the end
 * 2. If asterisk exists in input, treat it as the wildcard (no additional asterisk added)
 * @param {string} pattern - Wildcard pattern with * characters
 * @returns {RegExp} - Compiled regex pattern
 */
export function wildcardToRegex(pattern) {
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

  return new RegExp(regexStr, 'i'); // Case-insensitive
}

/**
 * Sort files by relevance based on search input
 * @param {Array} files - Files to sort
 * @param {string} input - Search input (with or without wildcards)
 * @returns {Array} - Sorted array of files
 */
export function sortByRelevance(files, input) {
  const lowerInput = input.replace(/\*/g, '').toLowerCase();

  function score(file) {
    const name = file.name.toLowerCase();

    if (name === lowerInput) return 0; // exact match
    if (name.startsWith(lowerInput)) return 1; // starts with
    if (name.includes(lowerInput)) return 2; // contains
    return 3; // weak match via wildcard
  }

  return [...files].sort((a, b) => {
    const scoreA = score(a);
    const scoreB = score(b);

    if (scoreA !== scoreB) return scoreA - scoreB;
    return a.name.localeCompare(b.name); // alphabetical tiebreaker
  });
}

/**
 * Perform wildcard search (filtering only, no sorting)
 *
 * Wildcard Rules:
 * 1. If no asterisk (*) in query, adds wildcard at end (e.g., "test" becomes "test*")
 * 2. If asterisk exists in query, uses it as-is (e.g., "test*middle" stays "test*middle")
 *
 * Examples:
 * - "data" → matches "data.csv", "dataset.txt", etc.
 * - "data*2023" → matches "data_jan_2023.csv", "data-feb-2023.txt", etc.
 * - "*report*" → matches "monthly_report_final.pdf", "status_report.docx", etc.
 *
 * @param {Array} files - Files to search through
 * @param {string} query - Wildcard search query
 * @returns {Array} - Matched files (unsorted)
 */
export function performWildcardSearch(files, query) {
  if (!query || !query.trim()) {
    return [];
  }

  const trimmedQuery = query.trim();
  const regex = wildcardToRegex(trimmedQuery);

  // Filter files that match the pattern
  return files.filter((file) => regex.test(file.name));
}

// Keep rankWildcardResults for backward compatibility if needed
export function rankWildcardResults(matches) {
  const ranked = matches.map(({ item, matchType }) => ({
    item,
    rank: matchType,
  }));

  ranked.sort((a, b) => {
    if (a.rank !== b.rank) {
      return a.rank - b.rank;
    }
    return a.item.name.localeCompare(b.item.name);
  });

  return ranked.map((r) => r.item);
}

/**
 * Unified search function that handles both wildcard and fuzzy search
 * @param {Array} files - Files to search through
 * @param {string} query - Search query
 * @param {string} engine - Search engine type ('wildcard' or 'fuzzy')
 * @returns {Object} - Search results
 */
export function performUnifiedSearch(files, query, engine) {
  if (!query || !query.trim()) {
    return {
      results: [],
      matches: [],
    };
  }

  let results = [];
  let matches = [];

  if (engine === SEARCH_ENGINES.WILDCARD) {
    // Perform wildcard search (filtering only)
    results = performWildcardSearch(files, query);
  } else {
    // Perform fuzzy search using existing Fuse.js logic
    const searchInstance = createSearchInstance(files);
    const fuseResults = searchInstance.search(query.trim());

    // Get the matched files from Fuse.js
    results = fuseResults.map((result) => result.item);

    // Store the fuse results for later match data mapping
    matches = fuseResults;
  }

  // Sort all results by relevance, regardless of search engine
  results = sortByRelevance(results, query);

  // Create matches array after sorting
  if (engine === SEARCH_ENGINES.WILDCARD) {
    // Create matches array compatible with fuzzy search format
    matches = results.map((item) => ({
      item,
      matches: [], // No highlight data for wildcard
      score: 0, // Perfect score for wildcard matches
    }));
  } else {
    // Map the sorted results to their original Fuse.js match data
    const matchMap = new Map(matches.map((result) => [result.item, result]));
    matches = results.map((item) => {
      const fuseResult = matchMap.get(item);
      return {
        item,
        matches: fuseResult?.matches || [],
        score: fuseResult?.score || 1,
      };
    });
  }

  return {
    results,
    matches,
  };
}
