/**
 * Query Construction API
 *
 * Exports the SearchQueryBuilder and related constants for constructing
 * structured search queries for the catalog search system.
 *
 * @module catalogSearch/api/queries
 *
 * @example
 * import { createSearchQuery, SEARCH_MODES, DATE_RANGE_PRESETS } from './queries';
 *
 * const query = createSearchQuery()
 *   .withText('temperature')
 *   .withSpatialBounds({ latMin: 30, latMax: 50, lonMin: -130, lonMax: -110 })
 *   .withDateRangePreset(DATE_RANGE_PRESETS.LAST_YEAR)
 *   .build();
 */

export {
  createSearchQuery,
  default as SearchQueryBuilder,
} from './SearchQueryBuilder';

export {
  SEARCH_MODES,
  DATE_RANGE_PRESETS,
  DATASET_TYPES,
  DEFAULTS,
  LIMITS,
  validateQuery,
} from './querySchema';
