import * as visualizationActionTypes from '../actionTypes/visualization';

export const queryRequestSend = (query) => ({
  type: visualizationActionTypes.QUERY_REQUEST_SEND,
  payload: {
    query,
  },
});

export const queryRequestSuccess = (data) => ({
  type: visualizationActionTypes.QUERY_REQUEST_SUCCESS,
  payload: {
    data,
  },
});

export const queryRequestFailure = () => ({
  type: visualizationActionTypes.QUERY_REQUEST_FAILURE,
});

export const queryRequestProcessing = () => ({
  type: visualizationActionTypes.QUERY_REQUEST_PROCESSING,
});

export const storedProcedureRequestSend = (storedProcedureInfo) => ({
  type: visualizationActionTypes.STORED_PROCEDURE_REQUEST_SEND,
  payload: { ...storedProcedureInfo },
});

export const storedProcedureRequestSuccess = (data) => ({
  type: visualizationActionTypes.STORED_PROCEDURE_REQUEST_SUCCESS,
  payload: {
    data,
  },
});

export const storedProcedureRequestFailure = () => ({
  type: visualizationActionTypes.STORED_PROCEDURE_REQUEST_FAILURE,
});

export const storedProcedureRequestProcessing = () => ({
  type: visualizationActionTypes.STORED_PROCEDURE_REQUEST_PROCESSING,
});

export const storeSampleData = (sampleData) => ({
  type: visualizationActionTypes.STORE_SAMPLE_DATA,
  payload: {
    sampleData,
  },
});

export const addMap = (mapInfo) => ({
  type: visualizationActionTypes.ADD_MAP,
  payload: {
    mapInfo,
  },
});

export const addChart = (chartInfo) => ({
  type: visualizationActionTypes.ADD_CHART,
  payload: {
    chartInfo,
  },
});

export const clearCharts = () => ({
  type: visualizationActionTypes.CLEAR_CHARTS,
});

export const clearMaps = () => ({
  type: visualizationActionTypes.CLEAR_MAPS,
});

export const closeChart = (chartIndex) => ({
  type: visualizationActionTypes.CLOSE_CHART,
  payload: {
    chartIndex,
  },
});

export const tableStatsRequestSend = (tableName, datasetLongName) => ({
  type: visualizationActionTypes.TABLE_STATS_REQUEST_SEND,
  payload: {
    tableName,
    datasetLongName,
  },
});

export const tableStatsRequestProcessing = () => ({
  type: visualizationActionTypes.TABLE_STATS_REQUEST_PROCESSING,
});

export const tableStatsRequestSuccess = (tableStats, datasetLongName) => ({
  type: visualizationActionTypes.TABLE_STATS_REQUEST_SUCCESS,
  payload: {
    tableStats,
    datasetLongName,
  },
});

export const tableStatsRequestFailure = () => ({
  type: visualizationActionTypes.TABLE_STATS_REQUEST_FAILURE,
});

export const cruiseTrajectoryRequestSend = (id) => ({
  type: visualizationActionTypes.CRUISE_TRAJECTORY_REQUEST_SEND,
  payload: {
    id,
  },
});

export const cruiseTrajectoryRequestSuccess = (trajectory) => ({
  type: visualizationActionTypes.CRUISE_TRAJECTORY_REQUEST_SUCCESS,
  payload: {
    trajectory,
  },
});

export const cruiseTrajectoryRequestFailure = () => ({
  type: visualizationActionTypes.CRUISE_TRAJECTORY_REQUEST_FAILURE,
});

export const cruiseTrajectoryRequestProcessing = () => ({
  type: visualizationActionTypes.CRUISE_TRAJECTORY_REQUEST_PROCESSING,
});

export const cruiseTrajectoryClear = () => ({
  type: visualizationActionTypes.CRUISE_TRAJECTORY_CLEAR,
});

export const cruiseListRequestSend = (id) => ({
  type: visualizationActionTypes.CRUISE_LIST_REQUEST_SEND,
});

export const cruiseListRequestSuccess = (cruiseList) => ({
  type: visualizationActionTypes.CRUISE_LIST_REQUEST_SUCCESS,
  payload: {
    cruiseList,
  },
});

export const cruiseListRequestFailure = () => ({
  type: visualizationActionTypes.CRUISE_LIST_REQUEST_FAILURE,
});

export const cruiseListRequestProcessing = () => ({
  type: visualizationActionTypes.CRUISE_LIST_REQUEST_PROCESSING,
});

export const triggerShowCharts = () => ({
  type: visualizationActionTypes.TRIGGER_SHOW_CHARTS,
});

export const completedShowCharts = () => ({
  type: visualizationActionTypes.COMPLETED_SHOW_CHARTS,
});

export const csvDownloadRequestSend = (query, fileName, tableName) => ({
  type: visualizationActionTypes.CSV_DOWNLOAD_REQUEST_SEND,
  payload: {
    query,
    fileName,
    tableName,
  },
});

export const csvDownloadRequestFailure = () => ({
  type: visualizationActionTypes.CSV_DOWNLOAD_REQUEST_FAILURE,
});

export const csvDownloadRequestProcessing = () => ({
  type: visualizationActionTypes.CSV_DOWNLOAD_REQUEST_PROCESSING,
});

export const csvDownloadRequestSuccess = (text) => ({
  type: visualizationActionTypes.CSV_DOWNLOAD_REQUEST_SUCCESS,
  payload: {
    text,
  },
});

//dataset download
export const downloadTextAsCsv = (text, fileName) => ({
  type: visualizationActionTypes.DOWNLOAD_TEXT_AS_CSV,
  payload: {
    text,
    fileName,
  },
});

export const csvFromVizRequestSend = (
  vizObject,
  tableName,
  shortName,
  longName,
) => ({
  type: visualizationActionTypes.CSV_FROM_VIZ_REQUEST_SEND,
  payload: {
    vizObject,
    tableName,
    shortName,
    longName,
  },
});

export const vizPageDataTargetSet = (target) => ({
  type: visualizationActionTypes.VIZ_PAGE_DATA_TARGET_SET,
  payload: {
    target,
  },
});

export const vizSearchResultsFetch = (params) => ({
  type: visualizationActionTypes.VIZ_SEARCH_RESULTS_FETCH,
  payload: {
    params,
  },
});

export const vizSearchResultsStore = (searchResults) => ({
  type: visualizationActionTypes.VIZ_SEARCH_RESULTS_STORE,
  payload: {
    searchResults,
  },
});

export const vizSearchResultsSetLoadingState = (state) => ({
  type: visualizationActionTypes.VIZ_SEARCH_RESULTS_SET_LOADING_STATE,
  payload: {
    state,
  },
});

export const memberVariablesFetch = (datasetID) => ({
  type: visualizationActionTypes.MEMBER_VARIABLES_FETCH,
  payload: {
    datasetID,
  },
});

export const memberVariablesStore = (variables) => ({
  type: visualizationActionTypes.MEMBER_VARIABLES_STORE,
  payload: {
    variables,
  },
});

export const memberVariablesSetLoadingState = (state) => ({
  type: visualizationActionTypes.MEMBER_VARIABLES_SET_LOADING_STATE,
  payload: {
    state,
  },
});

export const relatedDataFetch = (params) => ({
  type: visualizationActionTypes.RELATED_DATA_FETCH,
  payload: {
    params,
  },
});

export const relatedDataStore = (data) => ({
  type: visualizationActionTypes.RELATED_DATA_STORE,
  payload: {
    data,
  },
});

export const relatedDataSetLoadingState = (state) => ({
  type: visualizationActionTypes.RELATED_DATA_SET_LOADING_STATE,
  payload: {
    state,
  },
});

export const variableNameAutocompleteFetch = (terms) => ({
  type: visualizationActionTypes.VARIABLE_NAME_AUTOCOMPLETE_FETCH,
  payload: {
    terms,
  },
});

export const variableNameAutocompleteStore = (autocompleteVariableNames) => ({
  type: visualizationActionTypes.VARIABLE_NAME_AUTOCOMPLETE_STORE,
  payload: {
    autocompleteVariableNames,
  },
});

export const vizSearchResultsStoreAndUpdateOptions = (
  searchResults,
  options,
  counts,
) => ({
  type: visualizationActionTypes.VIZ_SEARCH_RESULTS_STORE_AND_UPDATE_OPTIONS,
  payload: {
    searchResults,
    options,
    counts,
  },
});

export const variableFetch = (id) => ({
  type: visualizationActionTypes.VARIABLE_FETCH,
  payload: {
    id,
  },
});

export const variableStore = (variableDetails) => ({
  type: visualizationActionTypes.VARIABLE_STORE,
  payload: {
    variableDetails,
  },
});

export const variableFetchSetLoadingState = (state) => ({
  type: visualizationActionTypes.VARIABLE_FETCH_SET_LOADING_STATE,
  payload: {
    state,
  },
});

export const datasetSummaryFetch = (id) => ({
  type: visualizationActionTypes.DATASET_SUMMARY_FETCH,
  payload: {
    id,
  },
});

export const datasetSummaryStore = (datasetSummary) => ({
  type: visualizationActionTypes.DATASET_SUMMARY_STORE,
  payload: {
    datasetSummary,
  },
});

export const vizPageDataTargetDetailsStore = (vizPageDataTargetDetails) => ({
  type: visualizationActionTypes.VIZ_PAGE_DATA_TARGET_DETAILS_STORE,
  payload: {
    vizPageDataTargetDetails,
  },
});

export const vizPageDataTargetSetAndFetchDetails = (vizPageDataTarget) => ({
  type: visualizationActionTypes.VIZ_PAGE_DATA_TARGET_SET_AND_FETCH_DETAILS,
  payload: {
    vizPageDataTarget,
  },
});

export const setDataSearchMenuVisibility = (isVisible) => ({
  type: visualizationActionTypes.DATA_SEARCH_VISIBILITY,
  payload: {
    isVisible,
  },
});

export const setControlPanelVisibility = (isVisible) => ({
  type: visualizationActionTypes.VIZ_CONTROL_PANEL_VISIBILITY,
  payload: {
    isVisible,
  },
});

export const plotsActiveTabSet = (tab) => ({
  type: visualizationActionTypes.PLOTS_ACTIVE_TAB_SET,
  payload: {
    tab,
  },
});

export const sparseDataQuerySend = (payload) => ({
  type: visualizationActionTypes.SPARSE_DATA_QUERY_SEND,
  payload,
});

export const sparseDataMaxSizeNotificationUpdate = (lastRowData) => ({
  type: visualizationActionTypes.SPARSE_DATA_MAX_SIZE_NOTIFICATION_UPDATE,
  payload: {
    lastRowData,
  },
});

export const handleGuestVisualization = () => ({
  type: visualizationActionTypes.HANDLE_GUEST_VISUALIZATION,
});

export const guestPlotLimitNotificationSetIsVisible = (isVisible) => ({
  type: visualizationActionTypes.GUEST_PLOT_LIMIT_NOTIFICATION_SET_IS_VISIBLE,
  payload: {
    isVisible,
  },
});
