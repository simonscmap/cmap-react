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

export const datasetFullPageNavigate = (shortname) => ({
  type: catalogActionTypes.DATASET_FULL_PAGE_NAVIGATE,
  payload: {
    shortname,
  },
});

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
    news: response.news,
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

export const datasetVariablesStore = (variables, datasetShortName) => ({
  type: catalogActionTypes.DATASET_VARIABLES_STORE,
  payload: {
    variables,
    datasetShortName
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

export const datasetVariableUMStore = (data) => ({
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

export const visualizableVariablesFetch = (shortname) => ({
  type: catalogActionTypes.DATASET_VISUALIZABLE_VARS_FETCH,
  payload: {
    shortname,
  }
});

export const visualizableVariablesStore = (data) => ({
  type: catalogActionTypes.DATASET_VISUALIZABLE_VARS_STORE,
  payload: data,
});

export const visualizableVariablesSetLoadingState = (state) => ({
  type: catalogActionTypes.DATASET_VISUALIZABLE_VARS_SET_LOADING_STATE,
  payload: { state },
});

export const datasetVariableVisDataFetch = (shortname, variableData, datasetShortName) => ({
  type: catalogActionTypes.DATASET_VARIABLE_VIS_DATA_FETCH,
  payload: {
    shortname, // variable short name, which acts as a key
    variableData,
    datasetShortName,
  },
});

export const datasetVariableVisDataStore = (shortname, data) => ({
  type: catalogActionTypes.DATASET_VARIABLE_VIS_DATA_STORE,
  payload: {
    shortname,
    data,
  },
});

export const datasetVariableVisDataSetLoadingState = (shortname, state) => ({
  type: catalogActionTypes.DATASET_VARIABLE_VIS_DATA_SET_LOADING_STATE,
  payload: {
    shortname,
    state
  },
});

export const datasetVariableSelect = (shortname) => ({
  type: catalogActionTypes.DATASET_VARIABLE_SELECT,
  payload: {
    shortname,
  },
});

export const setDatasetVisTabPreference = (variableShortName, n) => ({
  type: catalogActionTypes.DATASET_VIS_VAR_TAB_PREFERENCE,
  payload: {
    variableShortName,
    tab: n,
  }
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

/* Recommendations */

export const popularRecsRequestSend = () => ({
  type: catalogActionTypes.FETCH_RECS_POPULAR_SEND,
})

export const popularRecsRequestSuccess = (result) => ({
  type: catalogActionTypes.FETCH_RECS_POPULAR_SUCCESS,
  payload: result,
});

export const popularRecsRequestFailure = (err) => ({
  type: catalogActionTypes.FETCH_RECS_POPULAR_FAILURE,
  paload: err,
});


export const recentRecsRequestSend = (user_id) => ({
  type: catalogActionTypes.FETCH_RECS_RECENT_SEND,
  payload: {
    user_id: user_id
  }
})

export const recentRecsRequestSuccess = (result) => ({
  type: catalogActionTypes.FETCH_RECS_RECENT_SUCCESS,
  payload: result,
});

export const recentRecsRequestFailure = (err) => ({
  type: catalogActionTypes.FETCH_RECS_RECENT_FAILURE,
  paload: err,
});

export const recentRecsCacheHit = (cachedResult) => ({
  type: catalogActionTypes.FETCH_RECS_RECENT_CACHE_HIT,
  payload: cachedResult,
});


export const recommendedRecsRequestSend = (user_id) => ({
  type: catalogActionTypes.FETCH_RECS_RECOMMENDED_SEND,
  payload: {
    user_id: user_id
  }
})

export const recommendedRecsRequestSuccess = (result) => ({
  type: catalogActionTypes.FETCH_RECS_RECOMMENDED_SUCCESS,
  payload: result,
});

export const recommendedRecsRequestFailure = (err) => ({
  type: catalogActionTypes.FETCH_RECS_RECOMMENDED_FAILURE,
  paload: err,
});

export const recommendedRecsCacheHit = (cachedResult) => ({
  type: catalogActionTypes.FETCH_RECS_RECOMMENDED_CACHE_HIT,
  payload: cachedResult,
});

export const setSortingOptions = (options) => ({
  type: catalogActionTypes.SET_SORTING_OPTIONS,
  payload: options,
});

/* Programs */

export const fetchProgramsSend = () => ({
  type: catalogActionTypes.FETCH_PROGRAMS_SEND,
});

export const storePrograms = (programs) => ({
  type: catalogActionTypes.FETCH_PROGRAMS_SUCCESS,
  payload: programs,
});

export const fetchProgramsFailure = ({ message, err }) => ({
  type: catalogActionTypes.FETCH_PROGRAMS_FAILURE,
  message,
  err
});

export const fetchProgramDetailsSend = (programName) => ({
  type: catalogActionTypes.FETCH_PROGRAM_DETAILS_SEND,
  payload: {
    programName
  },
});

export const storeProgramDetails = (programs) => ({
  type: catalogActionTypes.FETCH_PROGRAM_DETAILS_SUCCESS,
  payload: programs,
});

export const fetchProgramDetailsFailure = ({ message, /* error */ }) => ({
  type: catalogActionTypes.FETCH_PROGRAM_DETAILS_FAILURE,
  payload: {
    message,
  }
});

export const setProgramCruiseTrajectoryFocus = ({ cruiseId }) => ({
  type: catalogActionTypes.SET_PROGRAM_CRUISE_TRAJECTORY_FOCUS,
  payload: {
    cruiseId,
  }
});

// sample vis on program page
export const selectProgramDataset = ({ shortName, datasetId }) => ({
  type: catalogActionTypes.PROGRAM_DATASET_SELECT,
  payload: {
    shortName,
    datasetId,
  }
});

export const selectProgramDatasetVariable = ({ varShortName, varId, datasetId }) => ({
  type: catalogActionTypes.PROGRAM_DATASET_VARIABLE_SELECT,
  payload: {
    varShortName,
    varId,
    datasetId
  }
});

export const programSampleVisDataFetch = ({ datasetShortName, variableId, variableData }) => ({
  type: catalogActionTypes.PROGRAM_SAMPLE_VIS_DATA_FETCH,
  payload: {
    datasetShortName,
    variableId,
    variableData,
  },
});

export const programSampleVisDataSetLoadingState = ({ datasetShortName, variableId, variableData }, status) => ({
  type: catalogActionTypes.PROGRAM_SAMPLE_VIS_DATA_SET_LOADING_STATE,
  payload: {
    datasetShortName,
    variableId,
    variableData,
    status,
  },
});

export const programSampleVisDataStore = ({ datasetShortName, variableId, variableData }, data) => ({
  type: catalogActionTypes.PROGRAM_SAMPLE_VIS_DATA_STORE,
  payload: {
    datasetShortName,
    variableId,
    variableData,
    data,
  },
});

export const fetchDatasetNames = () => ({
  type: catalogActionTypes.FETCH_DATASET_NAMES
});

export const fetchDatasetNamesSuccess = (result) => ({
  type: catalogActionTypes.FETCH_DATASET_NAMES_SUCCESS,
  payload: result,
});

export const setDatasetNamesRequestStatus = (status) => ({
  type: catalogActionTypes.SET_DATASET_NAMES_REQUEST_STATUS,
  payload: status,
});

// ~~~~~~~~

export const fetchVaultLink = (shortName) => ({
  type: catalogActionTypes.FETCH_VAULT_LINK,
  payload: {
    shortName
  }
});

export const fetchVaultLinkSuccess = (data) => ({
  type: catalogActionTypes.FETCH_VAULT_LINK_SUCCESS,
  payload: data,
});

export const setFetchVaultLinkRequestStatus = (status) => ({
  type: catalogActionTypes.SET_FETCH_VAULT_LINK_REQUEST_STATUS,
  payload: {
    status
  },
});

export const dropboxModalOpen = () => ({
  type: catalogActionTypes.DROPBOX_MODAL_OPEN,
});

export const dropboxModalCleanup = () => ({
  type: catalogActionTypes.DROPBOX_MODAL_CLEANUP,
});

export const dropboxModalClose = () => ({
  type: catalogActionTypes.DROPBOX_MODAL_CLOSE,
});
