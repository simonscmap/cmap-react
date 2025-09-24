import { create } from 'zustand';

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

  // Pagination state
  userCollectionsPagination: {
    page: 0,
    rowsPerPage: 50,
    total: 0,
  },
  publicCollectionsPagination: {
    page: 0,
    rowsPerPage: 50,
    total: 0,
  },

  // Statistics (computed from userCollections)
  statistics: {
    totalCollections: 0,
    publicCollections: 0,
    privateCollections: 0,
    totalDatasets: 0,
  },

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),

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
      userCollectionsPagination: {
        ...get().userCollectionsPagination,
        total: filteredCollections.length,
      },
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
      publicCollectionsPagination: {
        ...get().publicCollectionsPagination,
        total: filteredCollections.length,
      },
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
      userCollectionsPagination: {
        ...get().userCollectionsPagination,
        page: 0, // Reset to first page on search
        total: filteredUserCollections.length,
      },
      publicCollectionsPagination: {
        ...get().publicCollectionsPagination,
        page: 0, // Reset to first page on search
        total: filteredPublicCollections.length,
      },
    });
  },

  setUserCollectionsPagination: (pagination) => {
    set({
      userCollectionsPagination: {
        ...get().userCollectionsPagination,
        ...pagination,
      },
    });
  },

  setPublicCollectionsPagination: (pagination) => {
    set({
      publicCollectionsPagination: {
        ...get().publicCollectionsPagination,
        ...pagination,
      },
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
      userCollectionsPagination: {
        ...get().userCollectionsPagination,
        total: updatedFilteredCollections.length,
      },
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
      return sum + (collection.datasetIds?.length || 0);
    }, 0);

    return {
      totalCollections,
      publicCollections,
      privateCollections,
      totalDatasets,
    };
  },

  // Computed getters
  getPaginatedUserCollections: () => {
    const { filteredUserCollections, userCollectionsPagination } = get();
    const { page, rowsPerPage } = userCollectionsPagination;
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredUserCollections.slice(startIndex, endIndex);
  },

  getPaginatedPublicCollections: () => {
    const { filteredPublicCollections, publicCollectionsPagination } = get();
    const { page, rowsPerPage } = publicCollectionsPagination;
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredPublicCollections.slice(startIndex, endIndex);
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
      userCollectionsPagination: {
        ...get().userCollectionsPagination,
        page: 0,
        total: get().userCollections.length,
      },
      publicCollectionsPagination: {
        ...get().publicCollectionsPagination,
        page: 0,
        total: get().publicCollections.length,
      },
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
      userCollectionsPagination: {
        page: 0,
        rowsPerPage: 50,
        total: 0,
      },
      publicCollectionsPagination: {
        page: 0,
        rowsPerPage: 50,
        total: 0,
      },
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
