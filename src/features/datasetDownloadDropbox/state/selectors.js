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