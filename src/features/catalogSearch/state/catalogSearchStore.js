/**
 * Catalog Search Zustand Store
 *
 * Manages search state, initialization, and results.
 */

import { create } from 'zustand';
import {
  initializeCatalogSearch,
  searchCatalog,
  getRegions,
  cleanupCatalogSearch,
  createSearchQuery,
} from '../api';
import { captureError } from '../../../shared/errorCapture';
import { DATASET_TYPES, createDataTypesSet } from '../../../shared/utility/getDatasetType';

const useCatalogSearchStore = create((set, get) => ({
  // Initialization state
  isInitialized: false,
  isInitializing: false,
  initError: null,

  // Regions list
  regions: [],
  isLoadingRegions: false,
  regionsError: null,

  // Search state
  searchQuery: {
    text: '',
    spatial: null,
    temporal: null,
    depth: null,
    limit: null, // No limit - return all results
    offset: 0,
    searchMode: 'like', // Default to LIKE mode (matches backend)
    phraseMatch: false, // Keyword splitting with AND logic (matches backend)
    excludeFields: ['description'], // Exclude description field (matches backend)

    // Tab 1 filters
    region: 'All Regions', // 'All Regions' | <regionName>
    dateRangePreset: 'Any Date', // 'Any Date' | 'Last Year' | 'Last 5 Years' | 'Custom Range'
    customDateStart: null, // ISO date string (only used when dateRangePreset = 'Custom Range')
    customDateEnd: null, // ISO date string

    // Tab 2 filters (for future)
    includePartialOverlaps: true, // boolean (critical for Tab 2)
  },

  // Selected data types (stored outside searchQuery for Set type compatibility)
  selectedDataTypes: createDataTypesSet(), // All types selected by default
  results: [],
  isSearching: false,
  searchError: null,

  // Actions

  /**
   * Initialize the search service
   */
  initialize: async () => {
    const { isInitialized, isInitializing } = get();

    if (isInitialized || isInitializing) {
      return;
    }

    set({ isInitializing: true, initError: null });

    try {
      await initializeCatalogSearch();
      set({ isInitialized: true, isInitializing: false });

      // Load regions after initialization
      get().loadRegions();
    } catch (error) {
      captureError(error, { action: 'initializeSearch' });
      set({
        isInitializing: false,
        initError: error.message || 'Failed to initialize search',
      });
    }
  },

  /**
   * Load regions from the database
   */
  loadRegions: async () => {
    const { isInitialized, isLoadingRegions } = get();

    if (!isInitialized || isLoadingRegions) {
      return;
    }

    set({ isLoadingRegions: true, regionsError: null });

    try {
      const regions = await getRegions();
      set({ regions, isLoadingRegions: false });
    } catch (error) {
      console.error('Failed to load regions:', error);
      set({
        isLoadingRegions: false,
        regionsError: error.message || 'Failed to load regions',
        regions: [],
      });
    }
  },

  /**
   * Set search text
   * @param {string} text
   */
  setSearchText: (text) => {
    set((state) => ({
      searchQuery: {
        ...state.searchQuery,
        text,
      },
    }));
  },

  /**
   * Set filters
   * @param {Object} filters - Partial filter object
   */
  setFilters: (filters) => {
    set((state) => ({
      searchQuery: {
        ...state.searchQuery,
        ...filters,
      },
    }));
  },

  /**
   * Clear all filters
   */
  clearFilters: () => {
    set((state) => ({
      searchQuery: {
        ...state.searchQuery,
        spatial: null,
        temporal: null,
        depth: null,
      },
    }));
  },

  /**
   * Execute search
   */
  search: async () => {
    const { isInitialized, searchQuery } = get();

    if (!isInitialized) {
      set({ searchError: 'Search service not initialized' });
      return;
    }

    set({ isSearching: true, searchError: null });

    try {
      // Build query using SearchQueryBuilder fluent API
      const builder = createSearchQuery();

      // Add text search if provided
      if (searchQuery.text) {
        builder.withText(searchQuery.text, {
          phraseMatch: searchQuery.phraseMatch,
          searchMode: searchQuery.searchMode,
        });
      }

      // Add spatial bounds if provided
      if (searchQuery.spatial) {
        builder.withSpatialBounds(
          searchQuery.spatial,
          searchQuery.includePartialOverlaps,
        );
      }

      // Add temporal range based on preset or custom dates
      if (searchQuery.dateRangePreset) {
        builder.withDateRangePreset(searchQuery.dateRangePreset);
      }
      if (searchQuery.temporal) {
        builder.withTemporalRange(
          searchQuery.temporal.timeMin,
          searchQuery.temporal.timeMax,
          searchQuery.includePartialOverlaps,
        );
      }

      // Add depth range if provided
      if (searchQuery.depth) {
        builder.withDepthRange(
          searchQuery.depth,
          searchQuery.includePartialOverlaps,
        );
      }

      // Add region filter if provided
      if (searchQuery.region && searchQuery.region !== 'All Regions') {
        builder.withRegion(searchQuery.region);
      }

      // Add dataset type filter if provided (multi-select)
      const { selectedDataTypes } = get();
      const hasPartialSelection =
        selectedDataTypes.size > 0 && selectedDataTypes.size < DATASET_TYPES.length;

      if (hasPartialSelection) {
        // Convert Set to array for query builder
        builder.withDatasetType(Array.from(selectedDataTypes));
      }
      // If all types selected or none selected, don't add filter (show all)

      // Add pagination if limit is specified
      if (searchQuery.limit !== null && searchQuery.limit !== undefined) {
        builder.withPagination(searchQuery.limit, searchQuery.offset || 0);
      }

      // Add excluded fields if provided
      if (searchQuery.excludeFields) {
        builder.withExcludedFields(searchQuery.excludeFields);
      }

      // Build and execute query
      const query = builder.build();
      const results = await searchCatalog(query);
      set({ results, isSearching: false });
    } catch (error) {
      captureError(error, { action: 'search' });
      set({
        isSearching: false,
        searchError: error.message || 'Search failed',
        results: [],
      });
    }
  },

  /**
   * Clear search results
   */
  clearResults: () => {
    set({ results: [], searchError: null });
  },

  /**
   * Reset search query and results (but keep initialization state)
   * Used when closing modals or resetting search UI
   */
  resetSearch: () => {
    set({
      searchQuery: {
        text: '',
        spatial: null,
        temporal: null,
        depth: null,
        limit: null,
        offset: 0,
        searchMode: 'like',
        phraseMatch: false,
        excludeFields: ['description'],
        region: 'All Regions',
        dateRangePreset: 'Any Date',
        customDateStart: null,
        customDateEnd: null,
        includePartialOverlaps: true,
      },
      selectedDataTypes: createDataTypesSet(),
      results: [],
      isSearching: false,
      searchError: null,
    });
  },

  /**
   * Set search mode and phrase matching options
   * @param {Object} options - { searchMode, phraseMatch, excludeFields }
   */
  setSearchOptions: (options) => {
    set((state) => ({
      searchQuery: {
        ...state.searchQuery,
        ...options,
      },
    }));
  },

  /**
   * Set selected data types (multi-select)
   * @param {Set<string>} types - Set containing 'Model', 'Satellite', and/or 'In-Situ'
   */
  setSelectedDataTypes: (types) => {
    set({ selectedDataTypes: types });
  },

  /**
   * Set region filter
   * @param {string} region - 'All Regions' | <regionName>
   */
  setRegion: (region) => {
    set((state) => ({
      searchQuery: { ...state.searchQuery, region },
    }));
  },

  /**
   * Set date range preset
   * @param {string} preset - 'Any Date' | 'Last Year' | 'Last 5 Years' | 'Custom Range'
   */
  setDateRangePreset: (preset) => {
    set((state) => ({
      searchQuery: {
        ...state.searchQuery,
        dateRangePreset: preset,
        ...(preset !== 'Custom Range' && {
          customDateStart: null,
          customDateEnd: null,
          temporal: null,
        }),
      },
    }));
  },

  /**
   * Set custom date range (only used when dateRangePreset = 'Custom Range')
   * @param {string} start - ISO date string
   * @param {string} end - ISO date string
   */
  setCustomDateRange: (start, end) => {
    set((state) => ({
      searchQuery: {
        ...state.searchQuery,
        customDateStart: start,
        customDateEnd: end,
        temporal: start && end ? { timeMin: start, timeMax: end } : null,
      },
    }));
  },

  /**
   * Set partial overlaps mode (for Tab 2)
   * @param {boolean} value
   */
  setIncludePartialOverlaps: (value) => {
    set((state) => ({
      searchQuery: { ...state.searchQuery, includePartialOverlaps: value },
    }));
  },

  /**
   * Reset entire store
   */
  reset: () => {
    cleanupCatalogSearch();

    set({
      isInitialized: false,
      isInitializing: false,
      initError: null,
      regions: [],
      isLoadingRegions: false,
      regionsError: null,
      searchQuery: {
        text: '',
        spatial: null,
        temporal: null,
        depth: null,
        limit: null, // No limit - return all results
        offset: 0,
        searchMode: 'like', // Default to LIKE mode (matches backend)
        phraseMatch: false, // Keyword splitting with AND logic (matches backend)
        excludeFields: ['description'], // Exclude description field (matches backend)
        // Tab 1 filters
        region: 'All Regions',
        dateRangePreset: 'Any Date',
        customDateStart: null,
        customDateEnd: null,
        // Tab 2 filters (for future)
        includePartialOverlaps: true,
      },
      selectedDataTypes: createDataTypesSet(),
      results: [],
      isSearching: false,
      searchError: null,
    });
  },
}));

export default useCatalogSearchStore;
