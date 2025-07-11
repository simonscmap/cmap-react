import * as dropboxActionTypes from '../actionTypes/dropbox';

export const dropboxFilesDownloadRequest = (
  shortName,
  datasetId,
  selectedFiles,
) => ({
  type: dropboxActionTypes.DROPBOX_FILES_DOWNLOAD_REQUEST,
  payload: {
    shortName,
    datasetId,
    selectedFiles,
  },
});

export const dropboxFilesDownloadSuccess = (downloadLink) => ({
  type: dropboxActionTypes.DROPBOX_FILES_DOWNLOAD_SUCCESS,
  payload: {
    downloadLink,
  },
});

export const dropboxFilesDownloadFailure = (error) => ({
  type: dropboxActionTypes.DROPBOX_FILES_DOWNLOAD_FAILURE,
  payload: {
    error,
  },
});

export const dropboxFilesDownloadClear = () => ({
  type: dropboxActionTypes.DROPBOX_FILES_DOWNLOAD_CLEAR,
});

export const fetchVaultFilesPage = () => ({
  type: dropboxActionTypes.FETCH_VAULT_FILES_PAGE,
});

export const fetchVaultFilesPageSuccess = (data) => ({
  type: dropboxActionTypes.FETCH_VAULT_FILES_PAGE_SUCCESS,
  payload: data,
});

export const fetchVaultFilesPageFailure = (error) => ({
  type: dropboxActionTypes.FETCH_VAULT_FILES_PAGE_FAILURE,
  payload: { error },
});

export const setVaultFilesPagination = (pagination) => ({
  type: dropboxActionTypes.SET_VAULT_FILES_PAGINATION,
  payload: pagination,
});

export const resetVaultFilesPagination = () => ({
  type: dropboxActionTypes.RESET_VAULT_FILES_PAGINATION,
});
