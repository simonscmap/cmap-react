import * as dropboxActionTypes from '../actionTypes/dropbox';

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

export const fetchVaultFilesPageFailure = (error) => ({
  type: dropboxActionTypes.FETCH_DROPBOX_VAULT_FILES_PAGE_FAILURE,
  payload: { error },
});

export const setVaultFilesPagination = (pagination) => ({
  type: dropboxActionTypes.SET_DROPBOX_VAULT_FILES_PAGINATION,
  payload: pagination,
});

export const resetVaultFilesPagination = () => ({
  type: dropboxActionTypes.RESET_DROPBOX_VAULT_FILES_PAGINATION,
});

export const setLocalPaginationPage = (page) => ({
  type: dropboxActionTypes.SET_LOCAL_PAGINATION_PAGE,
  payload: { page },
});

export const setLocalPaginationSize = (pageSize) => ({
  type: dropboxActionTypes.SET_LOCAL_PAGINATION_SIZE,
  payload: { pageSize },
});
