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
  // Escape regex special characters except *
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  // Convert * to .* for regex matching
  const regexPattern = escaped.replace(/\*/g, '.*');
  return new RegExp(`^${regexPattern}$`, 'i'); // Case insensitive
}

/**
 * Rank wildcard results by match type
 * @param {Array} matches - Array of {item, matchType} objects
 * @returns {Array} - Sorted array of file items
 */
export function rankWildcardResults(matches) {
  const ranked = matches.map(({ item, matchType }) => ({
    item,
    rank: matchType,
  }));

  // Sort by rank (exact → prefix → suffix → substring → alphabetical)
  ranked.sort((a, b) => {
    if (a.rank !== b.rank) {
      return a.rank - b.rank;
    }
    // If same rank, sort alphabetically by filename
    return a.item.name.localeCompare(b.item.name);
  });

  return ranked.map((r) => r.item);
}

/**
 * Perform wildcard search with intelligent ranking
 * @param {Array} files - Files to search through
 * @param {string} query - Wildcard search query
 * @returns {Array} - Matched and ranked files
 */
export function performWildcardSearch(files, query) {
  if (!query || !query.trim()) {
    return [];
  }

  const trimmedQuery = query.trim();
  const regex = wildcardToRegex(trimmedQuery);
  const matches = [];

  for (const file of files) {
    if (regex.test(file.name)) {
      let matchType;
      const lowerName = file.name.toLowerCase();
      const lowerQuery = trimmedQuery.toLowerCase();

      // Determine match type for ranking
      if (lowerName === lowerQuery.replace(/\*/g, '')) {
        matchType = 1; // Exact match (ignoring wildcards)
      } else if (lowerQuery.startsWith('*') && lowerQuery.endsWith('*')) {
        matchType = 4; // Substring match (*term*)
      } else if (lowerQuery.startsWith('*')) {
        matchType = 3; // Suffix match (*term)
      } else if (lowerQuery.endsWith('*')) {
        matchType = 2; // Prefix match (term*)
      } else {
        matchType = 4; // Other patterns treated as substring
      }

      matches.push({ item: file, matchType });
    }
  }

  return rankWildcardResults(matches);
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
    // Perform wildcard search
    results = performWildcardSearch(files, query);
    // Create matches array compatible with fuzzy search format
    matches = results.map((item) => ({
      item,
      matches: [], // No highlight data for wildcard
      score: 0, // Perfect score for wildcard matches
    }));
  } else {
    // Perform fuzzy search using existing Fuse.js logic
    const searchInstance = createSearchInstance(files);
    const fuseResults = searchInstance.search(query.trim());
    results = fuseResults.map((result) => result.item);
    matches = fuseResults.map((result) => ({
      item: result.item,
      matches: result.matches || [],
      score: result.score,
    }));
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
