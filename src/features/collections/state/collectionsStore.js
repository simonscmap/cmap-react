import { create } from 'zustand';
import collectionsAPI from '../api/collectionsApi';
import { getDatasetType } from '../../../shared/utility';
import { captureError } from '../../../shared/errorCapture';
import HttpError from '../../../shared/errorCapture/HttpError';

const useCollectionsStore = create((set, get) => ({
  // State
  userCollections: [],
  publicCollections: [],
  followedCollections: [],
  isLoading: false,
  isCopying: false,
  error: null,

  // Preview modal state
  previewData: [],
  isLoadingPreview: false,
  previewError: null,

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

  followPendingIds: new Set(),

  // Just created collection ID (for showing at top of My Collections)
  justCreatedId: null,

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

  setFollowPending: (collectionId) => {
    const { followPendingIds } = get();
    const newPendingIds = new Set(followPendingIds);
    newPendingIds.add(collectionId);
    set({ followPendingIds: newPendingIds });
  },

  removeFollowPending: (collectionId) => {
    const { followPendingIds } = get();
    const newPendingIds = new Set(followPendingIds);
    newPendingIds.delete(collectionId);
    set({ followPendingIds: newPendingIds });
  },

  followCollection: async (collectionId) => {
    get().setFollowPending(collectionId);

    try {
      const response = await collectionsAPI.followCollection(collectionId);

      if (response.status === 201) {
        const result = await response.json();
        get().removeFollowPending(collectionId);
        return result;
      } else if (response.status === 400) {
        const error = await response.json();
        throw new HttpError(error.error || 'Cannot follow this collection', response.status);
      } else if (response.status === 409) {
        throw new HttpError('Already following this collection', response.status);
      } else if (response.status === 404) {
        throw new HttpError('Collection not found', response.status);
      } else {
        const error = new HttpError(
          `Failed to follow collection: ${response.status} ${response.statusText}`,
          response.status,
        );
        captureError(error, {
          action: 'followCollection',
          id: collectionId,
          status: response.status,
        });
        throw error;
      }
    } catch (error) {
      get().removeFollowPending(collectionId);
      if (!(error instanceof HttpError)) {
        captureError(error, { action: 'followCollection', id: collectionId });
      }
      throw error;
    }
  },

  // Just created collection actions
  clearJustCreated: () => {
    set({ justCreatedId: null });
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
      justCreatedId: serverCollection.id, // Set flag to show at top of My Collections
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
      const [collectionsResponse, followedResponse] = await Promise.all([
        collectionsAPI.getCollections(params),
        collectionsAPI.getFollowedCollections().catch((err) => {
          captureError(err, { action: 'fetchFollowedCollections' });
          return { ok: false, status: 0, error: err };
        }),
      ]);

      if (collectionsResponse.ok) {
        const data = await collectionsResponse.json();
        const collections = Array.isArray(data) ? data : [];

        const userCollections = collections.filter(
          (collection) => collection.isOwner === true,
        );
        const publicCollections = collections.filter(
          (collection) => collection.isPublic === true,
        );

        get().setUserCollections(userCollections);
        get().setPublicCollections(publicCollections);
      } else {
        const error = new HttpError(
          `Failed to fetch collections: ${collectionsResponse.status} ${collectionsResponse.statusText}`,
          collectionsResponse.status,
        );
        captureError(error, {
          action: 'fetchCollections',
          status: collectionsResponse.status,
        });
        throw error;
      }

      if (followedResponse.ok) {
        const followedData = await followedResponse.json();
        const followedCollections = Array.isArray(followedData) ? followedData : [];
        set({ followedCollections });
      } else if (followedResponse.status === 401) {
        // User not authenticated - expected, just clear followed collections
        set({ followedCollections: [] });
      } else {
        // Unexpected error - already captured above, clear followed collections
        // but don't fail the whole fetch
        set({ followedCollections: [] });
      }
    } catch (error) {
      if (!(error instanceof HttpError)) {
        captureError(error, { action: 'fetchCollections' });
      }
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
      name: data.collectionName,
      description: data.description || null,
      isPublic: data.isPublic,
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
        // Backend now returns the complete collection object
        const serverCollection = await response.json();

        // Replace optimistic collection with server data
        get().replaceOptimisticCollection(optimisticId, serverCollection);

        return serverCollection;
      } else if (response.status === 409) {
        get().removeOptimisticCollection(optimisticId);
        throw new HttpError(
          'A collection with this name already exists',
          response.status,
        );
      } else {
        get().removeOptimisticCollection(optimisticId);
        const error = new HttpError(
          `Failed to create collection: ${response.status} ${response.statusText}`,
          response.status,
        );
        captureError(error, {
          action: 'createCollection',
          name: data.collectionName,
          status: response.status,
        });
        throw error;
      }
    } catch (error) {
      get().removeOptimisticCollection(optimisticId);
      if (!(error instanceof HttpError)) {
        captureError(error, {
          action: 'createCollection',
          name: data.collectionName,
        });
      }
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
        throw new HttpError(
          "Collection not found or you don't have permission to delete it",
          response.status,
        );
      } else if (response.status === 400) {
        throw new HttpError('Invalid collection ID', response.status);
      } else if (response.status === 401) {
        throw new HttpError('Session expired', response.status);
      } else {
        const error = new HttpError(
          `Failed to delete collection: ${response.status} ${response.statusText}`,
          response.status,
        );
        captureError(error, {
          action: 'deleteCollection',
          id: collectionId,
          status: response.status,
        });
        throw error;
      }
    } catch (error) {
      // Remove pending state to restore card to normal state
      get().removePendingDeletion(collectionId);
      if (!(error instanceof HttpError)) {
        captureError(error, { action: 'deleteCollection', id: collectionId });
      }
      throw error;
    }
  },

  verifyCollectionName: async (name, collectionId) => {
    try {
      const response = await collectionsAPI.verifyCollectionName(
        name,
        collectionId,
      );

      if (response.ok) {
        const data = await response.json();
        return data.isAvailable;
      } else {
        throw new Error('Failed to verify collection name');
      }
    } catch (error) {
      captureError(error, { action: 'verifyCollectionName', name });
      throw error;
    }
  },

  copyCollection: async (collectionId) => {
    set({ isCopying: true });

    try {
      const response = await collectionsAPI.copyCollection(collectionId);

      if (response.status === 201) {
        const result = await response.json();

        // Add new collection to user collections (prepend to show at top)
        const { userCollections, filteredUserCollections } = get();
        const updatedUserCollections = [result, ...userCollections];
        const updatedFilteredUserCollections = [
          result,
          ...filteredUserCollections,
        ];

        // Recalculate statistics with new collection
        const statistics = get().calculateStatistics(updatedUserCollections);

        // First, add the new collection to state
        set({
          userCollections: updatedUserCollections,
          filteredUserCollections: updatedFilteredUserCollections,
          statistics,
        });

        // Then increment source collection's copies count locally
        get().incrementCollectionStat(collectionId, 'copies');

        return result;
      } else if (response.status === 404) {
        throw new HttpError(
          'Collection not found or not accessible',
          response.status,
        );
      } else {
        const error = new HttpError(
          `Failed to copy collection: ${response.status} ${response.statusText}`,
          response.status,
        );
        captureError(error, {
          action: 'copyCollection',
          id: collectionId,
          status: response.status,
        });
        throw error;
      }
    } catch (error) {
      if (!(error instanceof HttpError)) {
        captureError(error, { action: 'copyCollection', id: collectionId });
      }
      throw error;
    } finally {
      set({ isCopying: false });
    }
  },

  fetchPreviewData: async (datasetShortNames, collectionId) => {
    set({ isLoadingPreview: true, previewError: null, previewData: [] });

    try {
      const response = await collectionsAPI.getCollectionPreview(
        datasetShortNames,
        collectionId,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch preview data');
      }

      const data = await response.json();

      // Add type field to each dataset
      const dataWithType = data.map((dataset) => ({
        ...dataset,
        type: getDatasetType(dataset.makes, dataset.sensors),
      }));

      set({ previewData: dataWithType, isLoadingPreview: false });

      // Increment view count locally since backend incremented it
      if (collectionId !== undefined && collectionId !== null) {
        get().incrementCollectionStat(collectionId, 'views');
      }

      return dataWithType;
    } catch (error) {
      captureError(error, { action: 'fetchPreviewData', collectionId });
      set({
        previewError: error.message || 'Failed to load preview data',
        isLoadingPreview: false,
      });
      throw error;
    }
  },

  clearPreviewData: () => {
    set({ previewData: [], previewError: null, isLoadingPreview: false });
  },

  incrementCollectionStat: (collectionId, statName) => {
    // Helper to increment a stat in a collection object
    // statName can be: 'views', 'downloads', 'copies'
    const incrementStat = (collection) =>
      collection.id === collectionId
        ? { ...collection, [statName]: (collection[statName] ?? 0) + 1 }
        : collection;

    const {
      publicCollections,
      userCollections,
      filteredPublicCollections,
      filteredUserCollections,
    } = get();

    set({
      publicCollections: publicCollections.map(incrementStat),
      userCollections: userCollections.map(incrementStat),
      filteredPublicCollections: filteredPublicCollections.map(incrementStat),
      filteredUserCollections: filteredUserCollections.map(incrementStat),
    });
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

  isCollectionFollowed: (collectionId) => {
    const { followedCollections } = get();
    return followedCollections.some((c) => c.id === collectionId);
  },

  getAllMyCollections: () => {
    const { userCollections, followedCollections } = get();
    // Combine owned and followed collections, with owned collections first
    // followed collections have isFollowing = true implicitly
    return [...userCollections, ...followedCollections.map(c => ({ ...c, isFollowing: true }))];
  },

  updateCollection: (collectionId, updatedFields) => {
    const {
      userCollections,
      publicCollections,
      searchQuery,
      visibilityFilter,
    } = get();

    // Find the original collection to check previous visibility state
    const originalInUserCollections = userCollections.find(
      (c) => c.id === collectionId,
    );
    const originalInPublicCollections = publicCollections.find(
      (c) => c.id === collectionId,
    );

    if (!originalInUserCollections) {
      console.warn(
        `updateCollection: Collection ${collectionId} not found in userCollections`,
      );
      return;
    }

    // Update collection in userCollections
    const updatedUserCollections = userCollections.map((collection) =>
      collection.id === collectionId
        ? { ...collection, ...updatedFields }
        : collection,
    );

    // Handle publicCollections based on visibility changes
    let updatedPublicCollections = publicCollections;

    if (updatedFields.isPublic !== undefined) {
      if (updatedFields.isPublic && !originalInPublicCollections) {
        // Changed from private to public - add to publicCollections
        const updatedCollection = updatedUserCollections.find(
          (c) => c.id === collectionId,
        );
        updatedPublicCollections = [...publicCollections, updatedCollection];
      } else if (!updatedFields.isPublic && originalInPublicCollections) {
        // Changed from public to private - remove from publicCollections
        updatedPublicCollections = publicCollections.filter(
          (c) => c.id !== collectionId,
        );
      } else if (updatedFields.isPublic && originalInPublicCollections) {
        // Still public - update in publicCollections
        updatedPublicCollections = publicCollections.map((collection) =>
          collection.id === collectionId
            ? { ...collection, ...updatedFields }
            : collection,
        );
      }
    } else if (originalInPublicCollections) {
      // No visibility change but collection is in public - update it
      updatedPublicCollections = publicCollections.map((collection) =>
        collection.id === collectionId
          ? { ...collection, ...updatedFields }
          : collection,
      );
    }

    // Update filtered collections by re-applying filters
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
      followedCollections: [],
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
      justCreatedId: null,
    });
  },
}));

export default useCollectionsStore;
