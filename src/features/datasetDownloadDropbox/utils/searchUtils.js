import Fuse from 'fuse.js';
import { SEARCH_CONFIG, SEARCH_PERFORMANCE_TARGET } from '../constants/searchConstants';

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
      violationCount: 0 // Times search exceeded target time
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
      console.warn(`Search performance violation: ${duration.toFixed(2)}ms > ${SEARCH_PERFORMANCE_TARGET}ms`, {
        query,
        resultCount,
        duration
      });
    }

    return {
      duration,
      violatesTarget: duration > SEARCH_PERFORMANCE_TARGET,
      metrics: this.getMetrics()
    };
  }

  updateMetrics(duration) {
    this.metrics.searchCount++;
    this.metrics.totalTime += duration;
    this.metrics.averageTime = this.metrics.totalTime / this.metrics.searchCount;
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
      violationCount: 0
    };
  }
}

/**
 * Initialize Fuse.js search instance with optimized configuration
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
      performance: null
    };
  }

  const startTime = performanceMonitor.startTimer();
  const fuseResults = searchInstance.search(query.trim());
  
  // Extract results and match data
  const results = fuseResults.map(result => result.item);
  const matches = fuseResults.map(result => ({
    item: result.item,
    matches: result.matches || [],
    score: result.score
  }));

  const performance = performanceMonitor.endTimer(startTime, query, results.length);

  return {
    results,
    matches,
    performance
  };
}

/**
 * Get pattern hints from file list (first and last filename)
 */
export function getPatternHints(files) {
  if (!files || files.length === 0) {
    return { first: '', last: '' };
  }

  const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name));
  
  return {
    first: sortedFiles[0] ? sortedFiles[0].name : '',
    last: sortedFiles[sortedFiles.length - 1] ? sortedFiles[sortedFiles.length - 1].name : ''
  };
}

/**
 * Check if search should be activated based on file count
 */
export function shouldActivateSearch(fileCount, threshold) {
  return fileCount > threshold;
}