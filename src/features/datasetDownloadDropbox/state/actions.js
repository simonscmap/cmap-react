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