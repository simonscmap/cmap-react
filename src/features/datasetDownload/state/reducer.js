import * as actionTypes from './actionTypes';
import states from '../../../enums/asyncRequestStates';

// Dataset download slice initial state - extracted from main initialState object
const initialDatasetDownloadState = {
  requestStatus: states.notTried,
  querySizeChecks: [], // list of { queryString, result }
};

export default function datasetDownloadReducer(
  datasetDownloadState = initialDatasetDownloadState,
  action,
) {
  switch (action.type) {
    // Query size check actions
    case actionTypes.CHECK_QUERY_SIZE_SEND:
      return {
        ...datasetDownloadState,
        requestStatus: states.inProgress,
      };

    case actionTypes.SET_CHECK_QUERY_SIZE_REQUEST_STATE:
      return {
        ...datasetDownloadState,
        requestStatus: action.payload,
      };

    case actionTypes.STORE_CHECK_QUERY_SIZE_RESULT:
      const { queryString, result } = action.payload;
      return {
        ...datasetDownloadState,
        querySizeChecks: [
          ...datasetDownloadState.querySizeChecks,
          { queryString, result },
        ],
      };

    case actionTypes.CLEAR_FAILED_SIZE_CHECKS:
      return {
        ...datasetDownloadState,
        querySizeChecks: [],
      };

    // Dataset download request actions
    case actionTypes.DATASET_DOWNLOAD_REQUEST_SEND:
      return {
        ...datasetDownloadState,
        requestStatus: states.inProgress,
      };

    case actionTypes.DATASET_DOWNLOAD_REQUEST_PROCESSING:
      return {
        ...datasetDownloadState,
        requestStatus: states.inProgress,
      };

    case actionTypes.DATASET_DOWNLOAD_REQUEST_SUCCESS:
      return {
        ...datasetDownloadState,
        requestStatus: states.succeeded,
      };

    case actionTypes.DATASET_DOWNLOAD_REQUEST_FAILURE:
      return {
        ...datasetDownloadState,
        requestStatus: states.failed,
      };

    default:
      return datasetDownloadState;
  }
}

export { initialDatasetDownloadState };
