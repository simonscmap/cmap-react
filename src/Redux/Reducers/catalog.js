import * as catalogActionTypes from '../actionTypes/catalog';

import states from '../../Enums/asyncRequestStates';

export default function(state, action) {
  switch (action.type) {
    case catalogActionTypes.RETRIEVAL_REQUEST_SUCCESS: return {
      ...state, 
      catalogRequestState: states.succeeded, 
      catalog: action.payload.catalog
    }
    case catalogActionTypes.RETRIEVAL_REQUEST_FAILURE: return {...state, catalogRequestState: states.failed}
    case catalogActionTypes.RETRIEVAL_REQUEST_PROCESSING: return {...state, catalogRequestState: states.inProgress}

    case catalogActionTypes.DATASET_RETRIEVAL_REQUEST_SUCCESS: return {...state,
      datasetsRequestState: states.succeeded, 
      datasets: action.payload.datasets
    }
    case catalogActionTypes.DATASET_RETRIEVAL_REQUEST_FAILURE: return {...state, datasetsRequestState: states.failed}
    case catalogActionTypes.DATASET_RETRIEVAL_REQUEST_PROCESSING: return {...state, datasetsRequestState: states.inProgress}
    case catalogActionTypes.STORE_SUBMISSION_OPTIONS: return {...state, submissionOptions: action.payload.options}

    case catalogActionTypes.KEYWORDS_STORE: return {...state, keywords: action.payload.keywords}

    case catalogActionTypes.SEARCH_OPTIONS_STORE: return {...state, searchOptions: action.payload.searchOptions}

    case catalogActionTypes.SEARCH_RESULTS_STORE: return {...state, searchResults: action.payload.searchResults}
    case catalogActionTypes.SEARCH_RESULTS_SET_LOADING_STATE: return {...state, searchResultsLoadingState: action.payload.state}

    case catalogActionTypes.DATASET_FULL_PAGE_DATA_STORE: return {...state, datasetFullPageData: action.payload.datasetFullPageData}
    case catalogActionTypes.DATASET_FULL_PAGE_DATA_SET_LOADING_STATE: return {...state, datasetFullPageDataLoadingState: action.payload.state}
    
    default:
      return state;
  }
}