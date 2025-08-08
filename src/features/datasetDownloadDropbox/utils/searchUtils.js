import Fuse from 'fuse.js';
import {
  SEARCH_CONFIG,
  SEARCH_PERFORMANCE_TARGET,
  SEARCH_ENGINES,
} from '../constants/searchConstants';

/**
 * Performance monitoring utility for search operations
 */
export class SearchPerformanceMonitor {
  constructor() {
    this.metrics = {
      searchCount: 0,
      totalTime: 0,
      averageTime: 0,
      maxTime: 0,
      minTime: Infinity,
      violationCount: 0, // Times search exceeded target time
    };
  }

  startTimer() {
    return performance.now();
  }

  endTimer(startTime, query, resultCount) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    this.updateMetrics(duration);

    // Log performance violation
    if (duration > SEARCH_PERFORMANCE_TARGET) {
      console.warn(
        `Search performance violation: ${duration.toFixed(2)}ms > ${SEARCH_PERFORMANCE_TARGET}ms`,
        {
          query,
          resultCount,
          duration,
        },
      );
    }

    return {
      duration,
      violatesTarget: duration > SEARCH_PERFORMANCE_TARGET,
      metrics: this.getMetrics(),
    };
  }

  updateMetrics(duration) {
    this.metrics.searchCount++;
    this.metrics.totalTime += duration;
    this.metrics.averageTime =
      this.metrics.totalTime / this.metrics.searchCount;
    this.metrics.maxTime = Math.max(this.metrics.maxTime, duration);
    this.metrics.minTime = Math.min(this.metrics.minTime, duration);

    if (duration > SEARCH_PERFORMANCE_TARGET) {
      this.metrics.violationCount++;
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }

  reset() {
    this.metrics = {
      searchCount: 0,
      totalTime: 0,
      averageTime: 0,
      maxTime: 0,
      minTime: Infinity,
      violationCount: 0,
    };
  }
}

/**
 * Initialize Fuse.js search instance with optimized configuration
 * @param {Array} files - Files to search through
 */
export function createSearchInstance(files) {
  return new Fuse(files, SEARCH_CONFIG);
}

/**
 * Perform fuzzy search with performance monitoring
 */
export function performSearch(searchInstance, query, performanceMonitor) {
  if (!query || !query.trim()) {
    return {
      results: [],
      matches: [],
      performance: null,
    };
  }

  const startTime = performanceMonitor.startTimer();
  const fuseResults = searchInstance.search(query.trim());

  // Extract results and match data
  const results = fuseResults.map((result) => result.item);
  const matches = fuseResults.map((result) => ({
    item: result.item,
    matches: result.matches || [],
    score: result.score,
  }));

  const performance = performanceMonitor.endTimer(
    startTime,
    query,
    results.length,
  );

  return {
    results,
    matches,
    performance,
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
 * @param {string} pattern - Wildcard pattern with * characters
 * @returns {RegExp} - Compiled regex pattern
 */
export function wildcardToRegex(pattern) {
  let adjustedPattern = pattern;

  // Add * to end if not already present
  if (!adjustedPattern.endsWith('*')) {
    adjustedPattern += '*';
  }

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
 * @param {SearchPerformanceMonitor} performanceMonitor - Performance monitor instance
 * @returns {Object} - Search results with performance data
 */
export function performUnifiedSearch(files, query, engine, performanceMonitor) {
  if (!query || !query.trim()) {
    return {
      results: [],
      matches: [],
      performance: null,
    };
  }

  const startTime = performanceMonitor.startTimer();
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

  const performance = performanceMonitor.endTimer(
    startTime,
    query,
    results.length,
  );

  return {
    results,
    matches,
    performance,
  };
}
