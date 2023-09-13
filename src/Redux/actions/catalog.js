import * as catalogActionTypes from '../actionTypes/catalog';

export const submissionOptionsRetrieval = () => ({
  type: catalogActionTypes.SUBMISSION_OPTIONS_RETRIEVAL,
});

export const storeSubmissionOptions = (options) => ({
  type: catalogActionTypes.STORE_SUBMISSION_OPTIONS,
  payload: {
    options,
  },
});

export const searchOptionsFetch = () => ({
  type: catalogActionTypes.SEARCH_OPTIONS_FETCH,
});

export const keywordsFetch = () => ({
  type: catalogActionTypes.KEYWORDS_FETCH,
});

export const keywordsStore = (keywords) => ({
  type: catalogActionTypes.KEYWORDS_STORE,
  payload: {
    keywords,
  },
});

// the combination of SEARCH_RESUTLS_FETCH and SEARCH_RESULTS_STORE
// not only fetches catalog resutls, but preserves the user-selected
// search options
// it is unclear why; the search component gets its options from state,
// and state gets it in turn from this action, which gets it from url query
// it seems like redux state should be the source of truth, and have search
// update the options in redux, which would trigger (if necessary) a re-fetch
// as it is now, query changes trigger re-fetch in-component
export const searchResultsFetch = (queryString) => ({
  type: catalogActionTypes.SEARCH_RESULTS_FETCH,
  payload: {
    queryString,
  },
});

export const searchResultsStore = (searchResults, submissionOptions) => ({
  type: catalogActionTypes.SEARCH_RESULTS_STORE,
  payload: {
    searchResults,
    submissionOptions,
  },
});

export const searchResultsSetLoadingState = (state) => ({
  type: catalogActionTypes.SEARCH_RESULTS_SET_LOADING_STATE,
  payload: {
    state,
  },
});

/************** Dataset Detail Page **********************/

export const datasetFullPageDataFetch = (shortname) => ({
  type: catalogActionTypes.DATASET_FULL_PAGE_DATA_FETCH,
  payload: {
    shortname,
  },
});

export const datasetFullPageDataStore = (response) => ({
  type: catalogActionTypes.DATASET_FULL_PAGE_DATA_STORE,
  payload: {
    dataset: response.dataset,
    references: response.references,
    cruises: response.cruises,
    sensors: response.sensors,
  },
});

export const datasetFullPageDataSetLoadingState = (state) => ({
  type: catalogActionTypes.DATASET_FULL_PAGE_DATA_SET_LOADING_STATE,
  payload: {
    state,
  },
});

export const datasetVariablesFetch = (shortname) => ({
  type: catalogActionTypes.DATASET_VARIABLES_FETCH,
  payload: {
    shortname,
  },
});

export const datasetVariablesStore = (variables) => ({
  type: catalogActionTypes.DATASET_VARIABLES_STORE,
  payload: {
    variables,
  },
});

export const datasetVariablesSetLoadingState = (state) => ({
  type: catalogActionTypes.DATASET_VARIABLES_SET_LOADING_STATE,
  payload: {
    state,
  },
});

export const datasetVariableUMFetch = (shortname) => ({
  type: catalogActionTypes.DATASET_VARIABLE_UM_FETCH,
  payload: {
    shortname,
  },
});

export const datasetVariableUMStore= (data) => ({
  type: catalogActionTypes.DATASET_VARIABLE_UM_STORE,
  payload: {
    variableUnstructuredMetadata: data,
  },
});

export const datasetVariableUMSetLoadingState = (state) => ({
  type: catalogActionTypes.DATASET_VARIABLE_UM_SET_LOADING_STATE,
  payload: {
    state,
  },
});

/************** Cruise Detail Page **********************/

export const cruiseFullPageDataFetch = (name) => ({
  type: catalogActionTypes.CRUISE_FULL_PAGE_DATA_FETCH,
  payload: {
    name,
  },
});

export const cruiseFullPageDataStore = (cruiseFullPageData) => ({
  type: catalogActionTypes.CRUISE_FULL_PAGE_DATA_STORE,
  payload: {
    cruiseFullPageData,
  },
});

export const cruiseFullPageDataSetLoadingState = (state) => ({
  type: catalogActionTypes.CRUISE_FULL_PAGE_DATA_SET_LOADING_STATE,
  payload: {
    state,
  },
});

/************** Favorites **********************/

export const cartAddItem = (item) => ({
  type: catalogActionTypes.CART_ADD_ITEM,
  payload: {
    item,
  },
});

export const cartRemoveItem = (item) => ({
  type: catalogActionTypes.CART_REMOVE_ITEM,
  payload: {
    item,
  },
});

export const cartClear = () => ({
  type: catalogActionTypes.CART_CLEAR,
});

export const cartAddMultiple = (items) => ({
  type: catalogActionTypes.CART_ADD_MULTIPLE,
  payload: {
    items,
  },
});

/************** Dataset Features **********************/

export const fetchDatasetFeatures = () => ({
  type: catalogActionTypes.FETCH_DATASET_FEATURES,
});

/************** Dataset Download **********************/

export const checkQuerySize = (query) => ({
  type: catalogActionTypes.CHECK_QUERY_SIZE_SEND,
  payload: { query }
});

export const setCheckQueryRequestState = (requestState) => ({
  type: catalogActionTypes.SET_CHECK_QUERY_SIZE_REQUEST_STATE,
  payload: requestState,
});

export const storeCheckQueryResult = (queryString, result) => ({
  type: catalogActionTypes.STORE_CHECK_QUERY_SIZE_RESULT,
  payload: {
    queryString,
    result
  }
});

export const clearFailedSizeChecks = () => ({
  type: catalogActionTypes.CLEAR_FAILED_SIZE_CHECKS,
});

export const datasetDownloadRequestSend = ({
  subsetParams,
  ancillaryData,
  tableName,
  shortName,
  fileName,
}) => ({
  type: catalogActionTypes.DATASET_DOWNLOAD_REQUEST_SEND,
  payload: {
    subsetParams,
    ancillaryData,
    tableName,
    shortName,
    fileName,
  },
});

export const datasetDownloadRequestProcessing = () => ({
  type: catalogActionTypes.DATASET_DOWNLOAD_REQUEST_PROCESSING,
  // TODO it would be helpful to have generate a request id and include it here
});

export const datasetDownloadRequestSuccess = (text) => ({
  type: catalogActionTypes.DATASET_DOWNLOAD_REQUEST_SUCCESS,
  payload: {
    text,
  },
});
