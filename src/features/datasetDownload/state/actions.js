import * as datasetDownloadActionTypes from './actionTypes';

// Query size check actions
export const checkQuerySize = (query) => ({
  type: datasetDownloadActionTypes.CHECK_QUERY_SIZE_SEND,
  payload: query,
});

export const setCheckQueryRequestState = (requestState) => ({
  type: datasetDownloadActionTypes.SET_CHECK_QUERY_SIZE_REQUEST_STATE,
  payload: requestState,
});

export const storeCheckQueryResult = (result) => ({
  type: datasetDownloadActionTypes.STORE_CHECK_QUERY_SIZE_RESULT,
  payload: result,
});

export const clearFailedSizeChecks = () => ({
  type: datasetDownloadActionTypes.CLEAR_FAILED_SIZE_CHECKS,
});

// Dataset download request actions
export const datasetDownloadRequestSend = (query) => ({
  type: datasetDownloadActionTypes.DATASET_DOWNLOAD_REQUEST_SEND,
  payload: query,
});

export const datasetDownloadRequestProcessing = () => ({
  type: datasetDownloadActionTypes.DATASET_DOWNLOAD_REQUEST_PROCESSING,
});

export const datasetDownloadRequestSuccess = (result) => ({
  type: datasetDownloadActionTypes.DATASET_DOWNLOAD_REQUEST_SUCCESS,
  payload: result,
});

// Vault link actions
export const fetchVaultLink = (query) => ({
  type: datasetDownloadActionTypes.FETCH_VAULT_LINK,
  payload: query,
});

export const fetchVaultLinkSuccess = (result) => ({
  type: datasetDownloadActionTypes.FETCH_VAULT_LINK_SUCCESS,
  payload: result,
});

// Dropbox modal actions
export const dropboxModalOpen = (dataset) => ({
  type: datasetDownloadActionTypes.DROPBOX_MODAL_OPEN,
  payload: dataset,
});

export const dropboxModalCleanup = () => ({
  type: datasetDownloadActionTypes.DROPBOX_MODAL_CLEANUP,
});

export const dropboxModalClose = () => ({
  type: datasetDownloadActionTypes.DROPBOX_MODAL_CLOSE,
});
