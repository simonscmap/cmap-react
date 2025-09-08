import { createStore, useStore } from 'zustand';
import { createContext, useContext, useRef } from 'react';
import { performSearch, SEARCH_ENGINES } from '../utils/searchEngines';

// Factory function creates store instances with props
const createSearchStore = (initProps) =>
  createStore((set, get, store) => ({
    // Core State (Story Points 1-2)
    items: initProps.items || [],
    searchKeys: initProps.searchKeys || [],
    filteredItems: initProps.items || [],
    searchQuery: '',

    // Enhanced State (Story Points 3-4)
    searchEngine: 'wildcard',
    isActive: false,
    resultCount: initProps.items?.length || 0,
    totalCount: initProps.items?.length || 0,

    // Actions
    actions: {
      // Core Action (Story Points 1-2)
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

      // Enhanced Actions (Story Points 3-4)
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

// Context for store instance
const SearchContext = createContext(null);

// Provider component
export function SearchProvider({ children, items, searchKeys }) {
  const store = useRef(createSearchStore({ items, searchKeys })).current;

  return (
    <SearchContext.Provider value={store}>{children}</SearchContext.Provider>
  );
}

// Internal store hook
const useSearchStore = (selector) => {
  const store = useContext(SearchContext);
  if (!store) {
    throw new Error('useSearchStore must be used within SearchProvider');
  }
  return useStore(store, selector);
};

// Exported atomic selectors
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
