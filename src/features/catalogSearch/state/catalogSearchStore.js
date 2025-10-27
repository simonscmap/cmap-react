/**
 * Catalog Search Zustand Store
 *
 * Manages search state, initialization, and results.
 */

import { create } from 'zustand';
import { getSearchService } from '../services/searchService';

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
    datasetType: 'All Types', // 'All Types' | 'Model' | 'Satellite' | 'In-Situ'
    region: 'All Regions', // 'All Regions' | <regionName>
    dateRangePreset: 'Any Date', // 'Any Date' | 'Last Year' | 'Last 5 Years' | 'Custom Range'
    customDateStart: null, // ISO date string (only used when dateRangePreset = 'Custom Range')
    customDateEnd: null, // ISO date string

    // Tab 2 filters (for future)
    includePartialOverlaps: true, // boolean (critical for Tab 2)
  },
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
      const searchService = getSearchService();
      await searchService.initialize();
      set({ isInitialized: true, isInitializing: false });

      // Load regions after initialization
      get().loadRegions();
    } catch (error) {
      console.error('Failed to initialize search service:', error);
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
      const searchService = getSearchService();
      const regions = await searchService.getRegions();
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
      const searchService = getSearchService();
      const results = await searchService.search(searchQuery);
      set({ results, isSearching: false });
    } catch (error) {
      console.error('Search failed:', error);
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
        datasetType: 'All Types',
        region: 'All Regions',
        dateRangePreset: 'Any Date',
        customDateStart: null,
        customDateEnd: null,
        includePartialOverlaps: true,
      },
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
   * Set data type filter
   * @param {string} type - 'All Types' | 'Model' | 'Satellite' | 'In-Situ'
   */
  setDatasetType: (type) => {
    set((state) => ({
      searchQuery: { ...state.searchQuery, datasetType: type },
    }));
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
      searchQuery: { ...state.searchQuery, dateRangePreset: preset },
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
    const searchService = getSearchService();
    searchService.cleanup();

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
        datasetType: 'All Types',
        region: 'All Regions',
        dateRangePreset: 'Any Date',
        customDateStart: null,
        customDateEnd: null,
        // Tab 2 filters (for future)
        includePartialOverlaps: true,
      },
      results: [],
      isSearching: false,
      searchError: null,
    });
  },
}));

export default useCatalogSearchStore;
