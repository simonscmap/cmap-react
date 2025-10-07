import { create } from 'zustand';
import collectionsAPI from '../api/collectionsApi';

const useCollectionsStore = create((set, get) => ({
  // State
  userCollections: [],
  publicCollections: [],
  isLoading: false,
  isCopying: false,
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

  // Pending deletion state
  pendingDeletions: new Set(),

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),

  // Pending deletion actions
  setPendingDeletion: (collectionId) => {
    const { pendingDeletions } = get();
    const newPendingDeletions = new Set(pendingDeletions);
    newPendingDeletions.add(collectionId);
    set({ pendingDeletions: newPendingDeletions });
  },

  removePendingDeletion: (collectionId) => {
    const { pendingDeletions } = get();
    const newPendingDeletions = new Set(pendingDeletions);
    newPendingDeletions.delete(collectionId);
    set({ pendingDeletions: newPendingDeletions });
  },

  // Optimistic collection actions
  addOptimisticCollection: (optimisticCollection) => {
    const { userCollections, searchQuery, visibilityFilter } = get();

    // Add optimistic collection to userCollections
    const updatedUserCollections = [...userCollections, optimisticCollection];

    // Update filtered collections
    const filteredCollections = get().applyFilters(
      updatedUserCollections,
      searchQuery,
      visibilityFilter,
    );

    // Recalculate statistics
    const statistics = get().calculateStatistics(updatedUserCollections);

    set({
      userCollections: updatedUserCollections,
      filteredUserCollections: filteredCollections,
      statistics,
    });
  },

  replaceOptimisticCollection: (optimisticId, serverCollection) => {
    const {
      userCollections,
      publicCollections,
      searchQuery,
      visibilityFilter,
    } = get();

    // Replace optimistic collection with server data in userCollections
    const updatedUserCollections = userCollections.map((collection) =>
      collection.id === optimisticId ? serverCollection : collection,
    );

    // If collection is public, also add/update in publicCollections
    let updatedPublicCollections = publicCollections;
    if (serverCollection.isPublic) {
      // Check if already exists in publicCollections (shouldn't, but be safe)
      const existsInPublic = publicCollections.some(
        (c) => c.id === serverCollection.id,
      );
      if (!existsInPublic) {
        updatedPublicCollections = [...publicCollections, serverCollection];
      }
    }

    // Update filtered collections
    const filteredUserCollections = get().applyFilters(
      updatedUserCollections,
      searchQuery,
      visibilityFilter,
    );
    const filteredPublicCollections = get().applyFilters(
      updatedPublicCollections,
      searchQuery,
      'all',
    );

    // Recalculate statistics
    const statistics = get().calculateStatistics(updatedUserCollections);

    set({
      userCollections: updatedUserCollections,
      publicCollections: updatedPublicCollections,
      filteredUserCollections,
      filteredPublicCollections,
      statistics,
    });
  },

  removeOptimisticCollection: (optimisticId) => {
    const { userCollections, searchQuery, visibilityFilter } = get();

    // Remove optimistic collection from userCollections
    const updatedUserCollections = userCollections.filter(
      (collection) => collection.id !== optimisticId,
    );

    // Update filtered collections
    const filteredCollections = get().applyFilters(
      updatedUserCollections,
      searchQuery,
      visibilityFilter,
    );

    // Recalculate statistics
    const statistics = get().calculateStatistics(updatedUserCollections);

    set({
      userCollections: updatedUserCollections,
      filteredUserCollections: filteredCollections,
      statistics,
    });
  },

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
    // Generate temporary ID for optimistic collection
    const optimisticId = `optimistic-${Date.now()}`;

    // Create optimistic collection object with form data
    const optimisticCollection = {
      id: optimisticId,
      name: data.collection_name,
      description: data.description || null,
      isPublic: !data.private,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      ownerName: '', // Will be replaced with server data
      ownerAffiliation: '', // Will be replaced with server data
      datasetCount: data.datasets?.length || 0,
      isOwner: true,
      hasInvalidDatasets: false,
    };

    // Immediately add to state via optimistic update
    get().addOptimisticCollection(optimisticCollection);

    try {
      const response = await collectionsAPI.createCollection(data);

      if (response.status === 201) {
        const result = await response.json();

        // Fetch full collection data from server
        const collectionResponse = await collectionsAPI.getCollectionById(
          result.collection_id,
          { includeDatasets: false },
        );

        if (collectionResponse.ok) {
          const serverCollection = await collectionResponse.json();
          // Replace optimistic collection with server data
          get().replaceOptimisticCollection(optimisticId, serverCollection);
        } else {
          // If we can't fetch the full data, remove optimistic and refetch all
          get().removeOptimisticCollection(optimisticId);
          await get().fetchCollections({ includeDatasets: false });
        }

        return result;
      } else if (response.status === 401) {
        // Remove optimistic collection on error
        get().removeOptimisticCollection(optimisticId);
        throw new Error('You must be logged in to create collections');
      } else {
        // Remove optimistic collection on error
        get().removeOptimisticCollection(optimisticId);
        throw new Error('Failed to create collection. Please try again.');
      }
    } catch (error) {
      // Remove optimistic collection on error
      get().removeOptimisticCollection(optimisticId);
      console.error('Error creating collection:', error);
      throw error;
    }
  },

  deleteCollection: async (collectionId) => {
    // Set pending deletion state before making API call
    get().setPendingDeletion(collectionId);

    try {
      const response = await collectionsAPI.deleteCollection(collectionId);

      if (response.status === 204) {
        // Success - remove pending state, then remove from collections
        get().removePendingDeletion(collectionId);

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
      // Remove pending state to restore card to normal state
      get().removePendingDeletion(collectionId);
      console.error('Error deleting collection:', error);
      // Don't set global error state - let component handle display
      throw error;
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

  copyCollection: async (collectionId) => {
    set({ isCopying: true });

    try {
      const response = await collectionsAPI.copyCollection(collectionId);

      if (response.status === 201) {
        const result = await response.json();
        // Refetch collections to get the updated list with the new collection
        await get().fetchCollections({ includeDatasets: true });
        return result;
      } else if (response.status === 404) {
        throw new Error('Collection not found or not accessible');
      } else if (response.status === 401) {
        throw new Error('You must be logged in to copy collections');
      } else {
        throw new Error('Failed to copy collection. Please try again.');
      }
    } catch (error) {
      console.error('Error copying collection:', error);
      throw error;
    } finally {
      set({ isCopying: false });
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
      pendingDeletions: new Set(),
    });
  },
}));

export default useCollectionsStore;
