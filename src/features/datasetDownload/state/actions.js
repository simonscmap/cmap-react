import * as datasetDownloadActionTypes from './actionTypes';

// Query size check actions
export const checkQuerySize = (query) => ({
  type: datasetDownloadActionTypes.CHECK_QUERY_SIZE_SEND,
  payload: { query },
});

export const setCheckQueryRequestState = (requestState) => ({
  type: datasetDownloadActionTypes.SET_CHECK_QUERY_SIZE_REQUEST_STATE,
  payload: requestState,
});

export const storeCheckQueryResult = (queryString, result) => ({
  type: datasetDownloadActionTypes.STORE_CHECK_QUERY_SIZE_RESULT,
  payload: {
    queryString,
    result,
  },
});

export const clearFailedSizeChecks = () => ({
  type: datasetDownloadActionTypes.CLEAR_FAILED_SIZE_CHECKS,
});

// Dataset download request actions
export const datasetDownloadRequestSend = ({
  subsetParams,
  ancillaryData,
  tableName,
  shortName,
  fileName,
}) => ({
  type: datasetDownloadActionTypes.DATASET_DOWNLOAD_REQUEST_SEND,
  payload: {
    subsetParams,
    ancillaryData,
    tableName,
    shortName,
    fileName,
  },
});

export const datasetDownloadRequestProcessing = () => ({
  type: datasetDownloadActionTypes.DATASET_DOWNLOAD_REQUEST_PROCESSING,
});

export const datasetDownloadRequestSuccess = (text) => ({
  type: datasetDownloadActionTypes.DATASET_DOWNLOAD_REQUEST_SUCCESS,
  payload: {
    text,
  },
});
