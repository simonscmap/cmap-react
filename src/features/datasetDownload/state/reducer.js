import * as actionTypes from './actionTypes';
import states from '../../../enums/asyncRequestStates';

// Dataset download slice initial state - extracted from main initialState object
const initialDatasetDownloadState = {
  requestStatus: states.notTried,
  querySizeChecks: [], // list of { queryString, result }
  vaultLink: null,
  dropboxModalOpen: 'closed',
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

    // Vault link actions
    case actionTypes.FETCH_VAULT_LINK:
      return {
        ...datasetDownloadState,
        requestStatus: states.inProgress,
      };

    case actionTypes.FETCH_VAULT_LINK_SUCCESS:
      return {
        ...datasetDownloadState,
        vaultLink: action.payload,
        requestStatus: states.succeeded,
      };

    case actionTypes.SET_FETCH_VAULT_LINK_REQUEST_STATUS:
      return {
        ...datasetDownloadState,
        requestStatus: action.payload.status,
      };

    // Dropbox modal actions
    case actionTypes.DROPBOX_MODAL_OPEN:
      return {
        ...datasetDownloadState,
        dropboxModalOpen: 'open',
      };

    case actionTypes.DROPBOX_MODAL_CLEANUP:
      return {
        ...datasetDownloadState,
        dropboxModalOpen: 'closed',
      };

    case actionTypes.DROPBOX_MODAL_CLOSE:
      return {
        ...datasetDownloadState,
        dropboxModalOpen: 'closed',
      };

    default:
      return datasetDownloadState;
  }
}

export { initialDatasetDownloadState };
