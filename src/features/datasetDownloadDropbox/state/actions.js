import * as dropboxActionTypes from './actionTypes';

export const dropboxFilesDownloadRequest = (
  shortName,
  datasetId,
  selectedFiles,
) => ({
  type: dropboxActionTypes.DOWNLOAD_DROPBOX_VAULT_FILES_REQUEST,
  payload: {
    shortName,
    datasetId,
    selectedFiles,
  },
});

export const dropboxFilesDownloadSuccess = (downloadLink) => ({
  type: dropboxActionTypes.DOWNLOAD_DROPBOX_VAULT_FILES_SUCCESS,
  payload: {
    downloadLink,
  },
});

export const dropboxFilesDownloadFailure = (error) => ({
  type: dropboxActionTypes.DOWNLOAD_DROPBOX_VAULT_FILES_FAILURE,
  payload: {
    error,
  },
});

export const dropboxFilesDownloadClear = () => ({
  type: dropboxActionTypes.DOWNLOAD_DROPBOX_VAULT_FILES_CLEAR,
});

export const fetchVaultFilesPage = (shortName, paginationParams) => ({
  type: dropboxActionTypes.FETCH_DROPBOX_VAULT_FILES_PAGE,
  payload: {
    shortName,
    paginationParams,
  },
});

export const fetchVaultFilesPageSuccess = (data) => ({
  type: dropboxActionTypes.FETCH_DROPBOX_VAULT_FILES_PAGE_SUCCESS,
  payload: data,
});

export const fetchVaultFilesPageFailure = (error, folderType = null) => ({
  type: dropboxActionTypes.FETCH_DROPBOX_VAULT_FILES_PAGE_FAILURE,
  payload: { error, folderType },
});

export const setVaultFilesPagination = (pagination) => ({
  type: dropboxActionTypes.SET_DROPBOX_VAULT_FILES_PAGINATION,
  payload: pagination,
});

export const resetVaultFilesPagination = () => ({
  type: dropboxActionTypes.RESET_DROPBOX_VAULT_FILES_PAGINATION,
});

export const setLocalPaginationPage = (page, folderType = null) => ({
  type: dropboxActionTypes.SET_LOCAL_PAGINATION_PAGE,
  payload: { page, folderType },
});

export const setLocalPaginationSize = (pageSize, folderType = null) => ({
  type: dropboxActionTypes.SET_LOCAL_PAGINATION_SIZE,
  payload: { pageSize, folderType },
});

// Action to switch between folder tabs
export const setCurrentFolderTab = (folderType) => ({
  type: dropboxActionTypes.SET_CURRENT_FOLDER_TAB,
  payload: { folderType },
});

// Auto-download actions
export const setAutoDownloadEligibility = (
  autoDownloadEligible,
  directDownloadLink = null,
) => ({
  type: dropboxActionTypes.SET_AUTO_DOWNLOAD_ELIGIBILITY,
  payload: {
    autoDownloadEligible,
    directDownloadLink,
  },
});

export const triggerDirectDownload = (downloadLink) => ({
  type: dropboxActionTypes.TRIGGER_DIRECT_DOWNLOAD,
  payload: { downloadLink },
});

// Search action creators
export const setSearchQuery = (query, folderType) => ({
  type: dropboxActionTypes.SET_SEARCH_QUERY,
  payload: { query, folderType, timestamp: Date.now() },
});

export const setSearchResults = (
  filteredFiles,
  highlightMatches,
  searchDuration,
  folderType,
) => ({
  type: dropboxActionTypes.SET_SEARCH_RESULTS,
  payload: { filteredFiles, highlightMatches, searchDuration, folderType },
});

export const clearSearch = (folderType) => ({
  type: dropboxActionTypes.CLEAR_SEARCH,
  payload: { folderType },
});

export const setSearchActive = (isActive, folderType) => ({
  type: dropboxActionTypes.SET_SEARCH_ACTIVE,
  payload: { isActive, folderType },
});

export const setFuzzySearchEnabled = (enabled, folderType) => ({
  type: dropboxActionTypes.SET_FUZZY_SEARCH_ENABLED,
  payload: { enabled, folderType },
});
