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
  visibilityFilter: 'all', // 'all' | 'public' | 'private'
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
    const filteredCollections = get().applyFilters(
      collections,
      get().searchQuery,
      get().visibilityFilter,
    );

    set({
      userCollections: collections,
      filteredUserCollections: filteredCollections,
      statistics,
    });
  },

  setPublicCollections: (collections) => {
    const filteredCollections = get().applyFilters(
      collections,
      get().searchQuery,
      'all', // Public collections tab doesn't use visibility filter
    );

    set({
      publicCollections: collections,
      filteredPublicCollections: filteredCollections,
    });
  },

  setSearchQuery: (query) => {
    const { userCollections, publicCollections, visibilityFilter } = get();
    const filteredUserCollections = get().applyFilters(
      userCollections,
      query,
      visibilityFilter,
    );
    const filteredPublicCollections = get().applyFilters(
      publicCollections,
      query,
      'all', // Public collections tab doesn't use visibility filter
    );

    set({
      searchQuery: query,
      filteredUserCollections,
      filteredPublicCollections,
    });
  },

  setVisibilityFilter: (filter) => {
    const { userCollections } = get();
    const filteredCollections = get().applyFilters(
      userCollections,
      get().searchQuery,
      filter,
    );

    set({
      visibilityFilter: filter,
      filteredUserCollections: filteredCollections,
    });
  },

  createCollection: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const response = await collectionsAPI.createCollection(data);

      if (response.status === 201) {
        const result = await response.json();
        // Refetch collections to get the updated list with the new collection
        await get().fetchCollections({ includeDatasets: false });
        return result;
      } else if (response.status === 401) {
        throw new Error('You must be logged in to create collections');
      } else {
        throw new Error('Failed to create collection. Please try again.');
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCollection: async (collectionId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await collectionsAPI.deleteCollection(collectionId);

      if (response.status === 204) {
        // Success - remove from both user and public collections
        const {
          userCollections,
          publicCollections,
          filteredUserCollections,
          filteredPublicCollections,
        } = get();

        const updatedUserCollections = userCollections.filter(
          (c) => c.id !== collectionId,
        );
        const updatedPublicCollections = publicCollections.filter(
          (c) => c.id !== collectionId,
        );
        const updatedFilteredUserCollections = filteredUserCollections.filter(
          (c) => c.id !== collectionId,
        );
        const updatedFilteredPublicCollections =
          filteredPublicCollections.filter((c) => c.id !== collectionId);

        const statistics = get().calculateStatistics(updatedUserCollections);

        set({
          userCollections: updatedUserCollections,
          publicCollections: updatedPublicCollections,
          filteredUserCollections: updatedFilteredUserCollections,
          filteredPublicCollections: updatedFilteredPublicCollections,
          statistics,
        });
      } else if (response.status === 404) {
        throw new Error(
          "Collection not found or you don't have permission to delete it",
        );
      } else if (response.status === 401) {
        throw new Error('You must be logged in to delete collections');
      } else if (response.status === 400) {
        throw new Error('Invalid collection ID');
      } else {
        throw new Error('Failed to delete collection. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  verifyCollectionName: async (name) => {
    try {
      const response = await collectionsAPI.verifyCollectionName(name);

      if (response.ok) {
        const data = await response.json();
        return data.isAvailable;
      } else {
        throw new Error('Failed to verify collection name');
      }
    } catch (error) {
      console.error('Error verifying collection name:', error);
      throw error;
    }
  },

  // Utility functions
  applyFilters: (collections, query, visibilityFilter) => {
    let filtered = collections;

    // Apply visibility filter
    if (visibilityFilter === 'public') {
      filtered = filtered.filter((c) => c.isPublic === true);
    } else if (visibilityFilter === 'private') {
      filtered = filtered.filter((c) => c.isPublic !== true);
    }
    // 'all' shows everything, so no filter needed

    // Apply search filter
    if (query && query.trim() !== '') {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(
        (collection) =>
          collection.name?.toLowerCase().includes(searchLower) ||
          collection.description?.toLowerCase().includes(searchLower) ||
          collection.creatorName?.toLowerCase().includes(searchLower),
      );
    }

    return filtered;
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
      visibilityFilter: 'all',
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
