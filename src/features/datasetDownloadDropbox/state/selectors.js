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
  (state.dropbox &&
    state.dropbox.vaultFilesPagination &&
    state.dropbox.vaultFilesPagination.currentPageFiles) ||
  [];

export const selectPaginationInfo = (state) => {
  const pagination =
    (state.dropbox && state.dropbox.vaultFilesPagination) || {};
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
  (state.dropbox &&
    state.dropbox.vaultFilesPagination &&
    state.dropbox.vaultFilesPagination.allCachedFiles) ||
  [];

export const selectPaginationError = (state) =>
  (state.dropbox &&
    state.dropbox.vaultFilesPagination &&
    state.dropbox.vaultFilesPagination.error) ||
  null;

// New selectors for folder support
export const selectAvailableFolders = (state) =>
  (state.dropbox && state.dropbox.availableFolders) || {
    hasRep: false,
    hasNrt: false,
    hasRaw: false,
  };

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
    currentPage:
      (folderPagination.local && folderPagination.local.currentPage) || 1,
    pageSize: (folderPagination.local && folderPagination.local.pageSize) || 25,
    totalPages:
      (folderPagination.local && folderPagination.local.totalPages) || null,
    totalFileCount: folderPagination.totalFileCount || null,
    hasMore:
      (folderPagination.backend && folderPagination.backend.hasMore) || false,
    isLoading:
      (folderPagination.backend && folderPagination.backend.isLoading) || false,
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

// Search selectors - now per folder like pagination
export const selectSearchByFolder = (state) =>
  (state.dropbox && state.dropbox.searchByFolder) || {};

export const selectFolderSearchState = (state, folderType) => {
  const searchByFolder = selectSearchByFolder(state);
  return (
    searchByFolder[folderType] || {
      isActive: false,
      query: '',
      filteredFiles: [],
      highlightMatches: [],
      searchStartTime: null,
      lastSearchDuration: null,
    }
  );
};

export const selectCurrentFolderSearchState = (state) => {
  const currentTab =
    selectCurrentTab(state) || selectMainFolder(state) || 'rep';
  return selectFolderSearchState(state, currentTab);
};

// Legacy selector for backward compatibility
export const selectSearchState = (state) =>
  selectCurrentFolderSearchState(state);

export const selectSearchQuery = (state, folderType) => {
  const currentTab =
    folderType || selectCurrentTab(state) || selectMainFolder(state) || 'rep';
  const searchState = selectFolderSearchState(state, currentTab);
  return searchState.query || '';
};

export const selectIsSearchActive = (state, folderType) => {
  const currentTab =
    folderType || selectCurrentTab(state) || selectMainFolder(state) || 'rep';
  const searchState = selectFolderSearchState(state, currentTab);
  return searchState.isActive || false;
};

export const selectSearchResults = (state, folderType) => {
  const currentTab =
    folderType || selectCurrentTab(state) || selectMainFolder(state) || 'rep';
  const searchState = selectFolderSearchState(state, currentTab);
  return searchState.filteredFiles || [];
};

export const selectSearchHighlightMatches = (state, folderType) => {
  const currentTab =
    folderType || selectCurrentTab(state) || selectMainFolder(state) || 'rep';
  const searchState = selectFolderSearchState(state, currentTab);
  return searchState.highlightMatches || [];
};

export const selectSearchDuration = (state, folderType) => {
  const currentTab =
    folderType || selectCurrentTab(state) || selectMainFolder(state) || 'rep';
  const searchState = selectFolderSearchState(state, currentTab);
  return searchState.lastSearchDuration;
};

export const selectSearchPerformanceData = (state, folderType) => {
  const currentTab =
    folderType || selectCurrentTab(state) || selectMainFolder(state) || 'rep';
  const searchState = selectFolderSearchState(state, currentTab);
  return {
    startTime: searchState.searchStartTime,
    duration: searchState.lastSearchDuration,
  };
};

// Integration selector to determine which files to display (search results or normal pagination)
export const selectDisplayFiles = (state, folderType) => {
  const currentTab =
    folderType || selectCurrentTab(state) || selectMainFolder(state) || 'rep';
  const isSearchActive = selectIsSearchActive(state, currentTab);
  if (isSearchActive) {
    return selectSearchResults(state, currentTab);
  }
  // Return current folder's cached files when search is not active
  return selectFolderFiles(state, currentTab);
};

// Selector to get all files available for search from current folder
export const selectSearchableFiles = (state, folderType) => {
  const currentTab =
    folderType || selectCurrentTab(state) || selectMainFolder(state) || 'rep';
  return selectFolderAllCachedFiles(state, currentTab);
};
