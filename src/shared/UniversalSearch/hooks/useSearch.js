// Core Search Hook with Zustand State Management
// Implements isolated store instances per hook usage with factory pattern

import { useEffect, useRef, useCallback } from 'react';
import { create } from 'zustand';
import { performSearch, SEARCH_ENGINES } from '../utils/searchEngines';
import { DEFAULT_SETTINGS } from '../constants/searchConstants';

/**
 * Create an isolated Zustand store instance for search functionality
 * @param {Object} initialConfig - Initial configuration for the search store
 * @returns {Object} - Zustand store with search state and actions
 */
function createSearchStore(initialConfig = {}) {
  const {
    items = [],
    searchKeys = [],
    debounceMs = DEFAULT_SETTINGS.debounceMs,
    searchEngine = DEFAULT_SETTINGS.searchEngine,
    activationThreshold = DEFAULT_SETTINGS.activationThreshold,
    fuseOptions = {},
  } = initialConfig;

  return create((set, get) => ({
    // State
    items,
    searchKeys,
    filteredItems: items,
    searchQuery: '',
    isActive: false,
    searchEngine,
    debounceMs,
    activationThreshold,
    fuseOptions,
    resultCount: items.length,
    totalCount: items.length,
    isSearching: false,
    lastSearchTime: 0,

    // Actions
    setItems: (newItems) =>
      set((state) => {
        const filteredItems = state.searchQuery
          ? performSearch(
              newItems,
              state.searchQuery,
              state.searchKeys,
              state.searchEngine,
              state.fuseOptions,
            ).results
          : newItems;

        return {
          items: newItems,
          filteredItems,
          totalCount: newItems.length,
          resultCount: filteredItems.length,
        };
      }),

    setSearchKeys: (newKeys) =>
      set((state) => {
        if (!Array.isArray(newKeys) || newKeys.length === 0) {
          throw new Error('SearchKeys must be a non-empty array');
        }

        const filteredItems = state.searchQuery
          ? performSearch(
              state.items,
              state.searchQuery,
              newKeys,
              state.searchEngine,
              state.fuseOptions,
            ).results
          : state.items;

        return {
          searchKeys: newKeys,
          filteredItems,
          resultCount: filteredItems.length,
        };
      }),

    setQuery: (query) =>
      set((state) => {
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
          return {
            searchQuery: query,
            filteredItems: state.items,
            resultCount: state.items.length,
            isActive: false,
            isSearching: false,
          };
        }

        const shouldActivate = trimmedQuery.length >= state.activationThreshold;

        if (!shouldActivate) {
          return {
            searchQuery: query,
            filteredItems: state.items,
            resultCount: state.items.length,
            isActive: false,
            isSearching: false,
          };
        }

        try {
          const searchResults = performSearch(
            state.items,
            trimmedQuery,
            state.searchKeys,
            state.searchEngine,
            state.fuseOptions,
          );

          return {
            searchQuery: query,
            filteredItems: searchResults.results,
            resultCount: searchResults.results.length,
            isActive: true,
            isSearching: false,
            lastSearchTime: Date.now(),
          };
        } catch (error) {
          console.error('Search failed:', error);
          return {
            searchQuery: query,
            filteredItems: [],
            resultCount: 0,
            isActive: true,
            isSearching: false,
          };
        }
      }),

    setSearchEngine: (engine) =>
      set((state) => {
        if (!Object.values(SEARCH_ENGINES).includes(engine)) {
          throw new Error(
            `Invalid search engine: ${engine}. Must be one of: ${Object.values(
              SEARCH_ENGINES,
            ).join(', ')}`,
          );
        }

        if (!state.searchQuery.trim()) {
          return { searchEngine: engine };
        }

        try {
          const searchResults = performSearch(
            state.items,
            state.searchQuery,
            state.searchKeys,
            engine,
            state.fuseOptions,
          );

          return {
            searchEngine: engine,
            filteredItems: searchResults.results,
            resultCount: searchResults.results.length,
            lastSearchTime: Date.now(),
          };
        } catch (error) {
          console.error('Search engine change failed:', error);
          return {
            searchEngine: engine,
            filteredItems: [],
            resultCount: 0,
          };
        }
      }),

    clearSearch: () =>
      set((state) => ({
        searchQuery: '',
        filteredItems: state.items,
        resultCount: state.items.length,
        isActive: false,
        isSearching: false,
      })),

    setIsSearching: (searching) => set({ isSearching: searching }),

    // Configuration updates
    setDebounceMs: (ms) => set({ debounceMs: ms }),
    setActivationThreshold: (threshold) =>
      set({ activationThreshold: threshold }),
    setFuseOptions: (options) => set({ fuseOptions: options }),
  }));
}

/**
 * Core search hook with isolated Zustand store and debounced search
 * @param {Object} config - Configuration object
 * @param {Array} config.items - Items to search through
 * @param {Array} config.searchKeys - Object properties to search
 * @param {number} config.debounceMs - Debounce delay in milliseconds
 * @param {string} config.searchEngine - Search engine type ('wildcard' or 'fuzzy')
 * @param {number} config.activationThreshold - Minimum query length to activate search
 * @param {Object} config.fuseOptions - Custom Fuse.js options
 * @returns {Object} - Search state and actions
 */
export const useSearch = (config = {}) => {
  const {
    items = [],
    searchKeys = [],
    debounceMs = DEFAULT_SETTINGS.debounceMs,
    searchEngine = DEFAULT_SETTINGS.searchEngine,
    activationThreshold = DEFAULT_SETTINGS.activationThreshold,
    fuseOptions = {},
  } = config;

  // Validation
  if (!Array.isArray(items)) {
    throw new Error('items must be an array');
  }

  if (!Array.isArray(searchKeys) || searchKeys.length === 0) {
    throw new Error('searchKeys must be a non-empty array');
  }

  // Create isolated store instance (only once per hook instance)
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = createSearchStore({
      items,
      searchKeys,
      debounceMs,
      searchEngine,
      activationThreshold,
      fuseOptions,
    });
  }

  const store = storeRef.current;
  const state = store();

  // Debounce timer ref
  const debounceTimerRef = useRef(null);

  // Update store when config changes
  useEffect(() => {
    store.getState().setItems(items);
  }, [items, store]);

  useEffect(() => {
    store.getState().setSearchKeys(searchKeys);
  }, [searchKeys, store]);

  useEffect(() => {
    store.getState().setDebounceMs(debounceMs);
  }, [debounceMs, store]);

  useEffect(() => {
    store.getState().setActivationThreshold(activationThreshold);
  }, [activationThreshold, store]);

  useEffect(() => {
    store.getState().setFuseOptions(fuseOptions);
  }, [fuseOptions, store]);

  // Debounced search function
  const debouncedSetQuery = useCallback(
    (query) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set searching state immediately for UI feedback
      store.getState().setIsSearching(true);

      // Debounce the actual search
      debounceTimerRef.current = setTimeout(() => {
        store.getState().setQuery(query);
      }, state.debounceMs);
    },
    [store, state.debounceMs],
  );

  // Cleanup function
  const cleanup = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Return public API
  return {
    // State
    filteredItems: state.filteredItems,
    resultCount: state.resultCount,
    totalCount: state.totalCount,
    searchQuery: state.searchQuery,
    isActive: state.isActive,
    isSearching: state.isSearching,
    searchEngine: state.searchEngine,
    lastSearchTime: state.lastSearchTime,

    // Actions
    setQuery: debouncedSetQuery,
    setQueryImmediate: store.getState().setQuery, // Non-debounced version
    setSearchEngine: store.getState().setSearchEngine,
    clearSearch: store.getState().clearSearch,
    setItems: store.getState().setItems,
    setSearchKeys: store.getState().setSearchKeys,

    // Configuration
    debounceMs: state.debounceMs,
    activationThreshold: state.activationThreshold,
    setDebounceMs: store.getState().setDebounceMs,
    setActivationThreshold: store.getState().setActivationThreshold,
    setFuseOptions: store.getState().setFuseOptions,

    // Cleanup
    cleanup,
  };
};
