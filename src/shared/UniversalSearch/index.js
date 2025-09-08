// Universal Search Component - Public API
// Main entry point for Universal Search functionality

// UI Components
export { default as SearchInput } from './components/SearchInput';
export { default as SearchableInterface } from './components/SearchableInterface';

// Core Hook
export { useSearch } from './hooks/useSearch';

// Search State Management
export {
  SearchProvider,
  useFilteredItems,
  useSearchQuery,
  useSearchEngine,
  useIsSearchActive,
  useResultCount,
  useTotalCount,
  useSearchActions,
} from './state/useSearch';

// Utilities
export {
  wildcardSearch,
  fuzzySearch,
  createFuseInstance,
  performSearch,
  wildcardToRegex,
  DEFAULT_FUSE_OPTIONS,
  SEARCH_ENGINES as SEARCH_ENGINE_TYPES,
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
  SEARCH_STATES,
} from './constants/searchConstants';
