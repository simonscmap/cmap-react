// Selectors for dropbox feature state
export const selectDropboxState = (state) => state.dropbox || {};

export const selectDropboxDownloadState = (state) => ({
  isLoading: (state.dropbox && state.dropbox.isLoading) || false,
  success: (state.dropbox && state.dropbox.success) || false,
  error: (state.dropbox && state.dropbox.error) || null,
  downloadLink: (state.dropbox && state.dropbox.downloadLink) || null,
});

export const selectVaultFilesPagination = (state) =>
  (state.dropbox && state.dropbox.vaultFilesPagination) || {};

export const selectCurrentPageFiles = (state) =>
  (state.dropbox && state.dropbox.vaultFilesPagination && state.dropbox.vaultFilesPagination.currentPageFiles) || [];

export const selectPaginationInfo = (state) => {
  const pagination = (state.dropbox && state.dropbox.vaultFilesPagination) || {};
  return {
    currentPage: (pagination.local && pagination.local.currentPage) || 1,
    pageSize: (pagination.local && pagination.local.pageSize) || 25,
    totalPages: (pagination.local && pagination.local.totalPages) || null,
    totalFileCount: pagination.totalFileCount || null,
    hasMore: (pagination.backend && pagination.backend.hasMore) || false,
    isLoading: (pagination.backend && pagination.backend.isLoading) || false,
  };
};

export const selectAllCachedFiles = (state) =>
  (state.dropbox && state.dropbox.vaultFilesPagination && state.dropbox.vaultFilesPagination.allCachedFiles) || [];

export const selectPaginationError = (state) =>
  (state.dropbox && state.dropbox.vaultFilesPagination && state.dropbox.vaultFilesPagination.error) || null;

// New selectors for folder support
export const selectAvailableFolders = (state) =>
  (state.dropbox && state.dropbox.availableFolders) || { hasRep: false, hasNrt: false, hasRaw: false };

export const selectMainFolder = (state) =>
  (state.dropbox && state.dropbox.mainFolder) || null;

export const selectCurrentTab = (state) =>
  (state.dropbox && state.dropbox.currentTab) || null;

// Folder-specific selectors
export const selectPaginationByFolder = (state) =>
  (state.dropbox && state.dropbox.paginationByFolder) || {};

export const selectFolderPagination = (state, folderType) => {
  const paginationByFolder = selectPaginationByFolder(state);
  return paginationByFolder[folderType] || null;
};

export const selectCurrentFolderPagination = (state) => {
  const currentTab = selectCurrentTab(state) || selectMainFolder(state);
  if (!currentTab) return null;
  return selectFolderPagination(state, currentTab);
};

export const selectFolderFiles = (state, folderType) => {
  const folderPagination = selectFolderPagination(state, folderType);
  return (folderPagination && folderPagination.currentPageFiles) || [];
};

export const selectCurrentFolderFiles = (state) => {
  const currentTab = selectCurrentTab(state) || selectMainFolder(state);
  if (!currentTab) return [];
  return selectFolderFiles(state, currentTab);
};

export const selectFolderPaginationInfo = (state, folderType) => {
  const folderPagination = selectFolderPagination(state, folderType);
  if (!folderPagination) {
    return {
      currentPage: 1,
      pageSize: 25,
      totalPages: null,
      totalFileCount: null,
      hasMore: false,
      isLoading: false,
    };
  }
  
  return {
    currentPage: (folderPagination.local && folderPagination.local.currentPage) || 1,
    pageSize: (folderPagination.local && folderPagination.local.pageSize) || 25,
    totalPages: (folderPagination.local && folderPagination.local.totalPages) || null,
    totalFileCount: folderPagination.totalFileCount || null,
    hasMore: (folderPagination.backend && folderPagination.backend.hasMore) || false,
    isLoading: (folderPagination.backend && folderPagination.backend.isLoading) || false,
  };
};

export const selectCurrentFolderPaginationInfo = (state) => {
  const currentTab = selectCurrentTab(state) || selectMainFolder(state);
  if (!currentTab) {
    return {
      currentPage: 1,
      pageSize: 25,
      totalPages: null,
      totalFileCount: null,
      hasMore: false,
      isLoading: false,
    };
  }
  return selectFolderPaginationInfo(state, currentTab);
};

export const selectFolderAllCachedFiles = (state, folderType) => {
  const folderPagination = selectFolderPagination(state, folderType);
  return (folderPagination && folderPagination.allCachedFiles) || [];
};

export const selectFolderError = (state, folderType) => {
  const folderPagination = selectFolderPagination(state, folderType);
  return (folderPagination && folderPagination.error) || null;
};

// Auto-download selectors
export const selectAutoDownloadEligible = (state) =>
  (state.dropbox && state.dropbox.autoDownloadEligible) || false;

export const selectDirectDownloadLink = (state) =>
  (state.dropbox && state.dropbox.directDownloadLink) || null;

export const selectIsVaultFilesLoaded = (state) => {
  const pagination = selectVaultFilesPagination(state);
  return !!(pagination.allCachedFiles && pagination.allCachedFiles.length > 0);
};

// Search selectors
export const selectSearchState = (state) =>
  (state.dropbox && state.dropbox.search) || {
    isActive: false,
    query: '',
    filteredFiles: [],
    highlightMatches: [],
    searchStartTime: null,
    lastSearchDuration: null,
  };

export const selectSearchQuery = (state) => {
  const searchState = selectSearchState(state);
  return searchState.query || '';
};

export const selectIsSearchActive = (state) => {
  const searchState = selectSearchState(state);
  return searchState.isActive || false;
};

export const selectSearchResults = (state) => {
  const searchState = selectSearchState(state);
  return searchState.filteredFiles || [];
};

export const selectSearchHighlightMatches = (state) => {
  const searchState = selectSearchState(state);
  return searchState.highlightMatches || [];
};

export const selectSearchDuration = (state) => {
  const searchState = selectSearchState(state);
  return searchState.lastSearchDuration;
};

export const selectSearchPerformanceData = (state) => {
  const searchState = selectSearchState(state);
  return {
    startTime: searchState.searchStartTime,
    duration: searchState.lastSearchDuration,
  };
};

// Integration selector to determine which files to display (search results or normal pagination)
export const selectDisplayFiles = (state) => {
  const isSearchActive = selectIsSearchActive(state);
  if (isSearchActive) {
    return selectSearchResults(state);
  }
  // Return current folder's cached files when search is not active
  return selectCurrentFolderFiles(state);
};

// Selector to get all files available for search from current folder
export const selectSearchableFiles = (state) => {
  const currentTab = selectCurrentTab(state) || selectMainFolder(state);
  if (!currentTab) return [];
  return selectFolderAllCachedFiles(state, currentTab);
};