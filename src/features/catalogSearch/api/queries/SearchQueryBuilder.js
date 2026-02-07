/**
 * Search Query Builder
 *
 * Fluent API for constructing structured search queries for the catalog search system.
 * Provides a type-safe, composable way to build complex search queries with validation.
 *
 * @example
 * // Basic text search
 * const query = createSearchQuery()
 *   .withText('temperature')
 *   .build();
 *
 * @example
 * // Advanced search with multiple filters
 * const query = createSearchQuery()
 *   .withText('salinity', { phraseMatch: true })
 *   .withSpatialBounds({ latMin: 30, latMax: 50, lonMin: -130, lonMax: -110 })
 *   .withTemporalRange('2020-01-01', '2023-12-31')
 *   .withDatasetType('Satellite')
 *   .withRegion('North Pacific')
 *   .withPagination(100, 0)
 *   .build();
 */

import {
  DEFAULTS,
  SEARCH_MODES,
  DATE_RANGE_PRESETS,
  DATASET_TYPES,
  validateQuery,
} from './querySchema';

/**
 * SearchQueryBuilder class provides a fluent API for constructing search queries
 */
class SearchQueryBuilder {
  constructor() {
    this.query = {
      searchMode: DEFAULTS.searchMode,
      phraseMatch: DEFAULTS.phraseMatch,
      includePartialOverlaps: DEFAULTS.includePartialOverlaps,
      limit: DEFAULTS.limit,
      offset: DEFAULTS.offset,
      useRanking: DEFAULTS.useRanking,
      excludeFields: [...DEFAULTS.excludeFields],
    };
  }

  /**
   * Set the text search query
   * @param {string} text - Search text
   * @param {object} [options] - Search options
   * @param {boolean} [options.phraseMatch=false] - If true, treat entire text as single phrase; if false, split into keywords with AND logic
   * @param {string} [options.searchMode='like'] - Search mode ('like' or 'fts')
   * @returns {SearchQueryBuilder} This builder for chaining
   *
   * @example
   * // Keyword search (default - splits into keywords with AND logic)
   * builder.withText('temperature salinity');
   *
   * @example
   * // Phrase search (treats entire text as single phrase)
   * builder.withText('sea surface temperature', { phraseMatch: true });
   *
   * @example
   * // Full-text search with ranking
   * builder.withText('temperature', { searchMode: 'fts' });
   */
  withText(text, options = {}) {
    this.query.text = text;
    if (options.phraseMatch !== undefined) {
      this.query.phraseMatch = options.phraseMatch;
    }
    if (options.searchMode !== undefined) {
      this.query.searchMode = options.searchMode;
    }
    return this;
  }

  /**
   * Set spatial bounds filter
   * @param {object} bounds - Spatial bounds
   * @param {number} [bounds.latMin] - Minimum latitude (-90 to 90)
   * @param {number} [bounds.latMax] - Maximum latitude (-90 to 90)
   * @param {number} [bounds.lonMin] - Minimum longitude (-180 to 180)
   * @param {number} [bounds.lonMax] - Maximum longitude (-180 to 180)
   * @param {boolean} [includePartialOverlaps=true] - If true, include datasets with partial spatial overlap; if false, only fully contained datasets
   * @returns {SearchQueryBuilder} This builder for chaining
   *
   * @example
   * // Partial overlap mode (default)
   * builder.withSpatialBounds({ latMin: 30, latMax: 50, lonMin: -130, lonMax: -110 });
   *
   * @example
   * // Full containment mode
   * builder.withSpatialBounds(
   *   { latMin: 30, latMax: 50, lonMin: -130, lonMax: -110 },
   *   false
   * );
   */
  withSpatialBounds(bounds, includePartialOverlaps = true) {
    this.query.spatial = bounds;
    this.query.includePartialOverlaps = includePartialOverlaps;
    return this;
  }

  /**
   * Set temporal range filter with custom dates
   * @param {string} timeMin - Start date in ISO 8601 format (YYYY-MM-DD)
   * @param {string} timeMax - End date in ISO 8601 format (YYYY-MM-DD)
   * @param {boolean} [includePartialOverlaps=true] - If true, include datasets with partial temporal overlap; if false, only fully contained datasets
   * @returns {SearchQueryBuilder} This builder for chaining
   *
   * @example
   * builder.withTemporalRange('2020-01-01', '2023-12-31');
   */
  withTemporalRange(timeMin, timeMax, includePartialOverlaps = true) {
    this.query.temporal = { timeMin, timeMax };
    this.query.dateRangePreset = DATE_RANGE_PRESETS.CUSTOM;
    this.query.includePartialOverlaps = includePartialOverlaps;
    return this;
  }

  /**
   * Set temporal filter using a preset
   * @param {string} preset - Date range preset ('Any Date', 'Last Year', 'Last 5 Years')
   * @returns {SearchQueryBuilder} This builder for chaining
   *
   * @example
   * // Filter to datasets with data from the last year
   * builder.withDateRangePreset('Last Year');
   *
   * @example
   * // No temporal filtering
   * builder.withDateRangePreset('Any Date');
   */
  withDateRangePreset(preset) {
    this.query.dateRangePreset = preset;

    // Calculate temporal range based on preset
    if (preset === DATE_RANGE_PRESETS.LAST_YEAR) {
      const now = new Date();
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      this.query.temporal = {
        timeMin: oneYearAgo.toISOString().split('T')[0],
        timeMax: now.toISOString().split('T')[0],
      };
    } else if (preset === DATE_RANGE_PRESETS.LAST_5_YEARS) {
      const now = new Date();
      const fiveYearsAgo = new Date(now);
      fiveYearsAgo.setFullYear(now.getFullYear() - 5);
      this.query.temporal = {
        timeMin: fiveYearsAgo.toISOString().split('T')[0],
        timeMax: now.toISOString().split('T')[0],
      };
    } else if (preset !== DATE_RANGE_PRESETS.CUSTOM) {
      // 'Any Date' or other - clear temporal filter
      this.query.temporal = undefined;
    }

    return this;
  }

  /**
   * Set depth range filter
   * @param {object} depth - Depth filter options
   * @param {number} [depth.depthMin] - Minimum depth
   * @param {number} [depth.depthMax] - Maximum depth
   * @param {boolean} [includePartialOverlaps=true] - If true, include datasets with partial depth overlap; if false, only fully contained datasets
   * @returns {SearchQueryBuilder} This builder for chaining
   *
   * @example
   * // Filter by depth range
   * builder.withDepthRange({ depthMin: 0, depthMax: 100 });
   */
  withDepthRange(depth, includePartialOverlaps = true) {
    this.query.depth = depth;
    this.query.includePartialOverlaps = includePartialOverlaps;
    return this;
  }

  /**
   * Set region filter
   * @param {string} region - Region name (e.g., 'North Pacific', 'Mediterranean')
   * @returns {SearchQueryBuilder} This builder for chaining
   *
   * @example
   * builder.withRegion('North Pacific');
   */
  withRegion(region) {
    // Only set if not 'All Regions'
    if (region && region !== 'All Regions') {
      this.query.region = region;
    } else {
      this.query.region = undefined;
    }
    return this;
  }

  /**
   * Set dataset type filter
   * @param {string|string[]} datasetType - Dataset type(s): single string ('Model', 'Satellite', 'In-Situ') or array of types
   * @returns {SearchQueryBuilder} This builder for chaining
   *
   * @example
   * // Single type
   * builder.withDatasetType('Satellite');
   *
   * @example
   * // Multiple types (array)
   * builder.withDatasetType(['Model', 'Satellite']);
   */
  withDatasetType(datasetType) {
    // Handle array of types
    if (Array.isArray(datasetType)) {
      // Filter out 'All Types' if present in array
      const filtered = datasetType.filter((type) => type !== DATASET_TYPES.ALL);
      // Only set if array has types
      if (filtered.length > 0) {
        this.query.datasetType = filtered;
      } else {
        this.query.datasetType = undefined;
      }
    }
    // Handle single type string
    else if (datasetType && datasetType !== DATASET_TYPES.ALL) {
      this.query.datasetType = datasetType;
    } else {
      this.query.datasetType = undefined;
    }
    return this;
  }

  /**
   * Set pagination parameters
   * @param {number} limit - Maximum number of results to return (1-1000)
   * @param {number} [offset=0] - Number of results to skip
   * @returns {SearchQueryBuilder} This builder for chaining
   *
   * @example
   * // Get first 100 results
   * builder.withPagination(100);
   *
   * @example
   * // Get second page of 50 results
   * builder.withPagination(50, 50);
   */
  withPagination(limit, offset = 0) {
    this.query.limit = limit;
    this.query.offset = offset;
    return this;
  }

  /**
   * Set search mode
   * @param {string} mode - Search mode ('like' or 'fts')
   * @returns {SearchQueryBuilder} This builder for chaining
   *
   * @example
   * // Use full-text search
   * builder.withSearchMode('fts');
   */
  withSearchMode(mode) {
    this.query.searchMode = mode;
    return this;
  }

  /**
   * Enable or disable result ranking
   * @param {boolean} useRanking - Whether to use ranking (only applies to FTS mode)
   * @returns {SearchQueryBuilder} This builder for chaining
   *
   * @example
   * builder.withRanking(true);
   */
  withRanking(useRanking) {
    this.query.useRanking = useRanking;
    return this;
  }

  /**
   * Exclude specific fields from text search
   * @param {string[]} fields - Array of field names to exclude
   * @returns {SearchQueryBuilder} This builder for chaining
   *
   * @example
   * // Exclude description and keywords from search
   * builder.withExcludedFields(['description', 'keywords']);
   */
  withExcludedFields(fields) {
    this.query.excludeFields = fields;
    return this;
  }

  /**
   * Set the overlap mode for spatial, temporal, and depth filters
   * @param {boolean} includePartialOverlaps - If true, include partial overlaps; if false, require full containment
   * @returns {SearchQueryBuilder} This builder for chaining
   *
   * @example
   * // Only fully contained datasets
   * builder.withOverlapMode(false);
   */
  withOverlapMode(includePartialOverlaps) {
    this.query.includePartialOverlaps = includePartialOverlaps;
    return this;
  }

  /**
   * Set sort mode for result ordering
   * @param {string} mode - Sort mode ('default', 'spatial', 'temporal', 'depth')
   * @param {string} direction - Sort direction ('asc' or 'desc', default: 'desc')
   * @returns {SearchQueryBuilder} This builder for chaining
   *
   * @example
   * // Sort by spatial coverage descending
   * builder.withSortMode('spatial', 'desc');
   */
  withSortMode(mode, direction = 'desc') {
    this.query.sortMode = mode;
    this.query.sortDirection = direction;
    return this;
  }

  /**
   * Build and validate the query object
   * @returns {object} The constructed query object
   * @throws {Error} If the query is invalid
   *
   * @example
   * const query = builder
   *   .withText('temperature')
   *   .withSpatialBounds({ latMin: 30, latMax: 50, lonMin: -130, lonMax: -110 })
   *   .build();
   */
  build() {
    const validation = validateQuery(this.query);
    if (!validation.valid) {
      throw new Error(`Invalid query: ${validation.errors.join(', ')}`);
    }
    return { ...this.query };
  }

  /**
   * Reset the builder to default values
   * @returns {SearchQueryBuilder} This builder for chaining
   *
   * @example
   * builder.reset().withText('new search');
   */
  reset() {
    this.query = {
      searchMode: DEFAULTS.searchMode,
      phraseMatch: DEFAULTS.phraseMatch,
      includePartialOverlaps: DEFAULTS.includePartialOverlaps,
      limit: DEFAULTS.limit,
      offset: DEFAULTS.offset,
      useRanking: DEFAULTS.useRanking,
      excludeFields: [...DEFAULTS.excludeFields],
    };
    return this;
  }
}

/**
 * Factory function to create a new SearchQueryBuilder instance
 * @returns {SearchQueryBuilder} A new query builder instance
 *
 * @example
 * const query = createSearchQuery()
 *   .withText('temperature')
 *   .withSpatialBounds({ latMin: 30, latMax: 50, lonMin: -130, lonMax: -110 })
 *   .build();
 */
export function createSearchQuery() {
  return new SearchQueryBuilder();
}

export default SearchQueryBuilder;
