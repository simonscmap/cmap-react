import states from '../../enums/asyncRequestStates';
import * as visualizationActionTypes from '../actionTypes/visualization';
import { helpActionTypes } from '../actions/help.js';
import { VISUALIZATION_PAGE } from '../../constants';

export default function (state, action) {
  switch (action.type) {
    case visualizationActionTypes.QUERY_REQUEST_PROCESSING:
      return { ...state, queryRequestState: states.inProgress };
    case visualizationActionTypes.QUERY_REQUEST_FAILURE:
      return { ...state, queryRequestState: states.failed };
    case visualizationActionTypes.QUERY_REQUEST_SUCCESS:
      return { ...state, queryRequestState: states.succeeded };

    case visualizationActionTypes.STORE_SAMPLE_DATA:
      return {
        ...state,
        sampleData: action.payload.sampleData,
      };

    case visualizationActionTypes.ADD_MAP:
      return {
        ...state,
        maps: [...state.maps, action.payload.mapInfo],
      };

    case visualizationActionTypes.ADD_CHART:
      return {
        ...state,
        // charts: [...state.charts, {...action.payload.chartInfo, id: state.chartID}],
        charts: [
          { ...action.payload.chartInfo, id: state.chartID },
          ...state.charts,
        ],
        chartID: state.chartID + 1,
        plotsActiveTab: state.charts.length + 1,
      };

    case visualizationActionTypes.CLEAR_CHARTS:
      return { ...state, charts: [] };

    case visualizationActionTypes.CLEAR_MAPS:
      return { ...state, maps: [] };

    case visualizationActionTypes.DELETE_CHART:
      return {
        ...state,
        charts: [
          ...state.charts.slice(0, action.payload.chartIndex),
          ...state.charts.slice(action.payload.chartIndex + 1),
        ],
        plotsActiveTab:
          state.charts.length === 1
            ? 0
            : // action.payload.chartIndex === state.charts.length - 1 ?
              // state.charts.length - 2 :
              // state.plotsActiveTab
              1,
      };

    case visualizationActionTypes.CRUISE_TRAJECTORY_REQUEST_PROCESSING:
      return { ...state, getCruiseTrajectoryRequestState: states.inProgress };

    case visualizationActionTypes.CRUISE_TRAJECTORY_REQUEST_SUCCESS:
      return {
        ...state,
        cruiseTrajectory: action.payload.trajectory,
        getCruiseTrajectoryRequestState: states.succeeded,
      };

    case visualizationActionTypes.CRUISE_TRAJECTORY_CLEAR:
      return { ...state, cruiseTrajectory: null };

    case visualizationActionTypes.CRUISE_TRAJECTORY_REQUEST_FAILURE:
      return { ...state, getCruiseTrajectoryRequestState: states.failed };

    case visualizationActionTypes.CRUISE_LIST_REQUEST_PROCESSING:
      return { ...state, getCruiseListRequestState: states.inProgress };

    case visualizationActionTypes.CRUISE_LIST_REQUEST_SUCCESS:
      return {
        ...state,
        getCruiseListRequestState: states.succeeded,
        cruiseList: action.payload.cruiseList,
      };

    case visualizationActionTypes.TRIGGER_SHOW_CHARTS:
      return { ...state, showChartsOnce: true };
    case visualizationActionTypes.COMPLETED_SHOW_CHARTS:
      return { ...state, showChartsOnce: false };

    case visualizationActionTypes.TABLE_STATS_REQUEST_SUCCESS:
      return {
        ...state,
        datasets: {
          ...state.datasets,
          [action.payload.datasetLongName]: {
            ...state.datasets[action.payload.datasetLongName],
            tableStats: action.payload.tableStats,
          },
        },
      };

    case visualizationActionTypes.VIZ_PAGE_DATA_TARGET_SET:
      return {
        ...state,
        vizPageDataTarget: action.payload.target,
        vizPageDataTargetDetails: null,
      };
    case visualizationActionTypes.VIZ_PAGE_DATA_TARGET_DETAILS_STORE:
      return {
        ...state,
        vizPageDataTargetDetails: action.payload.vizPageDataTargetDetails,
      };

    case visualizationActionTypes.VIZ_SEARCH_RESULTS_STORE_AND_UPDATE_OPTIONS:
      return {
        ...state,
        vizSearchResults: action.payload.searchResults,
        submissionOptions: action.payload.options,
        vizSearchResultsFullCounts: action.payload.counts,
      };
    case visualizationActionTypes.VIZ_SEARCH_RESULTS_STORE:
      return { ...state, vizSearchResults: action.payload.searchResults };
    case visualizationActionTypes.VIZ_SEARCH_RESULTS_SET_LOADING_STATE:
      return { ...state, vizSearchResultsLoadingState: action.payload.state };

    case visualizationActionTypes.MEMBER_VARIABLES_STORE:
      return { ...state, memberVariables: action.payload.variables };
    case visualizationActionTypes.MEMBER_VARIABLES_SET_LOADING_STATE:
      return { ...state, memberVariablesLoadingState: action.payload.state };

    case visualizationActionTypes.RELATED_DATA_STORE:
      return { ...state, relatedData: action.payload.data };
    case visualizationActionTypes.RELATED_DATA_SET_LOADING_STATE:
      return { ...state, relatedDataLoadingState: action.payload.state };

    case visualizationActionTypes.VARIABLE_NAME_AUTOCOMPLETE_STORE:
      return {
        ...state,
        autocompleteVariableNames: action.payload.autocompleteVariableNames,
      };

    case visualizationActionTypes.VARIABLE_STORE:
      return {
        ...state,
        variableFetchLoadingState: states.succeeded,
        variableDetails: action.payload.variableDetails,
      };
    case visualizationActionTypes.VARIABLE_FETCH_SET_LOADING_STATE:
      return { ...state, variableFetchLoadingState: action.payload.state };

    case visualizationActionTypes.DATASET_SUMMARY_STORE:
      return { ...state, datasetSummary: action.payload.datasetSummary };

    case visualizationActionTypes.PLOTS_ACTIVE_TAB_SET:
      return { ...state, plotsActiveTab: action.payload.tab };

    case visualizationActionTypes.SPARSE_DATA_MAX_SIZE_NOTIFICATION_UPDATE:
      return {
        ...state,
        sparseDataMaxSizeNotificationData: action.payload.lastRowData,
      };

    case visualizationActionTypes.GUEST_PLOT_LIMIT_NOTIFICATION_SET_IS_VISIBLE:
      return {
        ...state,
        guestPlotLimitNotificationIsVisible: action.payload.isVisible,
      };

    case visualizationActionTypes.VIZ_CONTROL_PANEL_VISIBILITY:
      return {
        ...state,
        showControlPanel: Boolean(action.payload.isVisible),
      };

    case visualizationActionTypes.DATA_SEARCH_VISIBILITY:
      return {
        ...state,
        dataSearchMenuOpen: Boolean(action.payload.isVisible),
      };

    case helpActionTypes.TOGGLE_INTRO:
      // if tour is being turned on, hide data search
      let { pageName, value } = action.payload;
      if (pageName !== VISUALIZATION_PAGE) {
        return state;
      }
      // this action can be dispatched with a specific value, or
      // it can be dispatched without a value, as a toggle
      // so check if it is being explicitly set to true, or if not, whether it will toggle to true
      if (value || state.intros[VISUALIZATION_PAGE] !== true) {
        return {
          ...state,
          dataSearchMenuOpen: false,
        };
      }

    default:
      return state;
  }
}
