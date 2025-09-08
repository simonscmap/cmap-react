import React, { createContext, useContext, useRef } from 'react';
import { createStore, useStore } from 'zustand';
import { performSearch, SEARCH_ENGINES } from '../utils/searchEngines';

// Factory function creates store instances with props
const createSearchStore = (initProps) =>
  createStore((set, get, store) => ({
    items: initProps.items || [],
    searchKeys: initProps.searchKeys || [],
    filteredItems: initProps.items || [],
    searchQuery: '',
    searchEngine: 'wildcard',
    isActive: false,
    resultCount: initProps.items?.length || 0,
    totalCount: initProps.items?.length || 0,

    actions: {
      setSearchQuery: (query) => {
        const { items, searchKeys, searchEngine } = get();

        if (!query || query.trim() === '') {
          set({
            searchQuery: '',
            filteredItems: items,
            isActive: false,
            resultCount: items.length,
          });
          return;
        }

        try {
          const result = performSearch(
            items,
            query.trim(),
            searchKeys,
            searchEngine,
          );
          set({
            searchQuery: query,
            filteredItems: result.results,
            isActive: true,
            resultCount: result.results.length,
          });
        } catch (error) {
          console.warn('Search failed, showing all items:', error);
          set({
            searchQuery: query,
            filteredItems: items,
            isActive: true,
            resultCount: items.length,
          });
        }
      },

      setSearchEngine: (engine) => {
        const { searchQuery } = get();
        set({ searchEngine: engine });

        // Re-run search with new engine if query exists
        if (searchQuery) {
          get().actions.setSearchQuery(searchQuery);
        }
      },

      clearSearch: () => {
        const { items } = get();
        set({
          searchQuery: '',
          filteredItems: items,
          isActive: false,
          resultCount: items.length,
        });
      },

      resetState: () => set(store.getInitialState()),
    },
  }));

const SearchContext = createContext(null);

export function SearchProvider({ children, items, searchKeys }) {
  const store = useRef(createSearchStore({ items, searchKeys })).current;

  return (
    <SearchContext.Provider value={store}>{children}</SearchContext.Provider>
  );
}

const useSearchStore = (selector) => {
  const store = useContext(SearchContext);
  if (!store) {
    throw new Error('useSearchStore must be used within SearchProvider');
  }
  return useStore(store, selector);
};

export const useFilteredItems = () =>
  useSearchStore((state) => state.filteredItems);
export const useSearchQuery = () =>
  useSearchStore((state) => state.searchQuery);
export const useSearchEngine = () =>
  useSearchStore((state) => state.searchEngine);
export const useIsSearchActive = () =>
  useSearchStore((state) => state.isActive);
export const useResultCount = () =>
  useSearchStore((state) => state.resultCount);
export const useTotalCount = () => useSearchStore((state) => state.totalCount);
export const useSearchActions = () => useSearchStore((state) => state.actions);
