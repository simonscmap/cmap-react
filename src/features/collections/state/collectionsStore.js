import { create } from 'zustand';
import collectionsAPI from '../api/collectionsApi';

const useCollectionsStore = create((set, get) => ({
  // State
  userCollections: [],
  publicCollections: [],
  isLoading: false,
  error: null,

  // Search and filter state
  searchQuery: '',
  filteredUserCollections: [],
  filteredPublicCollections: [],

  // Statistics (computed from userCollections)
  statistics: {
    totalCollections: 0,
    publicCollections: 0,
    privateCollections: 0,
    totalDatasets: 0,
  },

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),

  // API Actions
  fetchCollections: async (params = {}) => {
    set({ isLoading: true, error: null });

    try {
      const response = await collectionsAPI.getCollections(params);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch collections: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      // Filter collections based on isPublic and isOwner flags
      // API returns single array of collections with boolean flags
      const collections = Array.isArray(data) ? data : [];

      const userCollections = collections.filter(
        (collection) => collection.isOwner === true,
      );
      const publicCollections = collections.filter(
        (collection) => collection.isPublic === true,
      );

      get().setUserCollections(userCollections);
      get().setPublicCollections(publicCollections);
    } catch (error) {
      console.error('Error fetching collections:', error);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  setError: (error) => set({ error }),

  setUserCollections: (collections) => {
    const statistics = get().calculateStatistics(collections);
    const filteredCollections = get().applySearchFilter(
      collections,
      get().searchQuery,
    );

    set({
      userCollections: collections,
      filteredUserCollections: filteredCollections,
      statistics,
    });
  },

  setPublicCollections: (collections) => {
    const filteredCollections = get().applySearchFilter(
      collections,
      get().searchQuery,
    );

    set({
      publicCollections: collections,
      filteredPublicCollections: filteredCollections,
    });
  },

  setSearchQuery: (query) => {
    const { userCollections, publicCollections } = get();
    const filteredUserCollections = get().applySearchFilter(
      userCollections,
      query,
    );
    const filteredPublicCollections = get().applySearchFilter(
      publicCollections,
      query,
    );

    set({
      searchQuery: query,
      filteredUserCollections,
      filteredPublicCollections,
    });
  },

  deleteCollection: (collectionId) => {
    const { userCollections, filteredUserCollections } = get();
    const updatedUserCollections = userCollections.filter(
      (c) => c.id !== collectionId,
    );
    const updatedFilteredCollections = filteredUserCollections.filter(
      (c) => c.id !== collectionId,
    );
    const statistics = get().calculateStatistics(updatedUserCollections);

    set({
      userCollections: updatedUserCollections,
      filteredUserCollections: updatedFilteredCollections,
      statistics,
    });
  },

  // Utility functions
  applySearchFilter: (collections, query) => {
    if (!query || query.trim() === '') {
      return collections;
    }

    const searchLower = query.toLowerCase();
    return collections.filter(
      (collection) =>
        collection.name?.toLowerCase().includes(searchLower) ||
        collection.description?.toLowerCase().includes(searchLower) ||
        collection.creatorName?.toLowerCase().includes(searchLower),
    );
  },

  calculateStatistics: (collections) => {
    const totalCollections = collections.length;
    const publicCollections = collections.filter((c) => c.isPublic).length;
    const privateCollections = totalCollections - publicCollections;
    const totalDatasets = collections.reduce((sum, collection) => {
      return sum + (collection.datasetCount || 0);
    }, 0);

    return {
      totalCollections,
      publicCollections,
      privateCollections,
      totalDatasets,
    };
  },

  getCollectionById: (collectionId) => {
    const { userCollections, publicCollections } = get();
    return [...userCollections, ...publicCollections].find(
      (c) => c.id === collectionId,
    );
  },

  // Reset functions
  resetSearch: () => {
    set({
      searchQuery: '',
      filteredUserCollections: get().userCollections,
      filteredPublicCollections: get().publicCollections,
    });
  },

  resetStore: () => {
    set({
      userCollections: [],
      publicCollections: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      filteredUserCollections: [],
      filteredPublicCollections: [],
      statistics: {
        totalCollections: 0,
        publicCollections: 0,
        privateCollections: 0,
        totalDatasets: 0,
      },
    });
  },
}));

export default useCollectionsStore;
