import { useEffect, useRef, useCallback } from 'react';
import { create } from 'zustand';
import { performSearch } from '../utils/searchEngines';

// Create store instance - one per hook usage
const createSearchStore = (initialItems, initialSearchKeys) =>
  create((set, get) => ({
    // Core state
    items: initialItems,
    searchKeys: initialSearchKeys,
    filteredItems: initialItems,
    searchQuery: '',
    searchEngine: 'wildcard',

    // Counts - essential tracking
    resultCount: initialItems.length,
    totalCount: initialItems.length,

    // Actions
    setQuery: (query) => {
      const trimmedQuery = query.trim();

      if (!trimmedQuery) {
        set({
          searchQuery: query,
          filteredItems: get().items,
          resultCount: get().items.length,
        });
        return;
      }

      const results = performSearch(
        get().items,
        trimmedQuery,
        get().searchKeys,
        get().searchEngine,
      );

      set({
        searchQuery: query,
        filteredItems: results.results,
        resultCount: results.results.length,
      });
    },

    setSearchEngine: (engine) => {
      set({ searchEngine: engine });

      // Re-run search if active
      if (get().searchQuery.trim()) {
        const results = performSearch(
          get().items,
          get().searchQuery,
          get().searchKeys,
          engine,
        );

        set({
          filteredItems: results.results,
          resultCount: results.results.length,
        });
      }
    },

    clearSearch: () => {
      set({
        searchQuery: '',
        filteredItems: get().items,
        resultCount: get().items.length,
      });
    },

    updateItems: (newItems) => {
      const currentQuery = get().searchQuery.trim();

      if (!currentQuery) {
        set({
          items: newItems,
          filteredItems: newItems,
          totalCount: newItems.length,
          resultCount: newItems.length,
        });
        return;
      }

      // Re-filter with current query
      const results = performSearch(
        newItems,
        currentQuery,
        get().searchKeys,
        get().searchEngine,
      );

      set({
        items: newItems,
        filteredItems: results.results,
        totalCount: newItems.length,
        resultCount: results.results.length,
      });
    },
  }));

/**
 * Simplified search hook with core functionality only
 * @param {Array} items - Items to search
 * @param {Array} searchKeys - Object keys to search
 * @param {number} debounceMs - Debounce delay (default: 300)
 */
export const useSearch2 = (items = [], searchKeys = [], debounceMs = 300) => {
  // Create store once
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = createSearchStore(items, searchKeys);
  }

  const store = storeRef.current;
  const state = store();
  const debounceRef = useRef(null);

  // Update items when they change
  useEffect(() => {
    store.getState().updateItems(items);
  }, [items, store]);

  // Debounced search
  const setSearchQuery = useCallback(
    (query) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        store.getState().setQuery(query);
      }, debounceMs);
    },
    [store, debounceMs],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    // Results
    filteredItems: state.filteredItems,
    resultCount: state.resultCount,
    totalCount: state.totalCount,

    // State
    searchQuery: state.searchQuery,
    isActive: !!state.searchQuery.trim(),
    searchEngine: state.searchEngine,

    // Actions
    setSearchQuery,
    setSearchEngine: store.getState().setSearchEngine,
    clearSearch: store.getState().clearSearch,
  };
};
