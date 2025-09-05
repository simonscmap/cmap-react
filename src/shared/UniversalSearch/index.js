// Universal Search Component - Public API
// Main entry point for Universal Search functionality

// Core Hook
export { useSearch } from './hooks/useSearch';

// Utilities
export {
  wildcardSearch,
  fuzzySearch,
  createFuseInstance,
} from './utils/searchEngines';

export {
  getNestedProperty,
  safePropertyAccess,
  extractSearchableText,
} from './utils/objectUtils';

// Constants
export {
  SEARCH_CONFIG,
  SEARCH_ENGINES,
  DEFAULT_SETTINGS,
} from './constants/searchConstants';
