import states from '../../enums/asyncRequestStates';
import { helpActionTypes } from '../actions/help.js';
import { VISUALIZATION_PAGE } from '../../constants';
import {
  QUERY_REQUEST_PROCESSING,
  QUERY_REQUEST_FAILURE,
  QUERY_REQUEST_SUCCESS,
  STORE_SAMPLE_DATA,
  ADD_MAP,
  ADD_CHART,
  CLEAR_CHARTS,
  CLEAR_MAPS,
  CLOSE_CHART,
  CRUISE_TRAJECTORY_REQUEST_PROCESSING,
  CRUISE_TRAJECTORY_REQUEST_SUCCESS,
  CRUISE_TRAJECTORY_CLEAR,
  CRUISE_TRAJECTORY_REQUEST_FAILURE,
  CRUISE_TRAJECTORY_ZOOM_TO,
  CRUISE_LIST_REQUEST_PROCESSING,
  CRUISE_LIST_REQUEST_SUCCESS,
  TRIGGER_SHOW_CHARTS,
  COMPLETED_SHOW_CHARTS,
  TABLE_STATS_REQUEST_SUCCESS,
  VIZ_PAGE_DATA_TARGET_SET,
  VIZ_PAGE_DATA_TARGET_DETAILS_STORE,
  VIZ_SEARCH_RESULTS_STORE_AND_UPDATE_OPTIONS,
  VIZ_SEARCH_RESULTS_STORE,
  VIZ_SEARCH_RESULTS_SET_LOADING_STATE,
  MEMBER_VARIABLES_STORE,
  MEMBER_VARIABLES_SET_LOADING_STATE,
  RELATED_DATA_STORE,
  RELATED_DATA_SET_LOADING_STATE,
  VARIABLE_NAME_AUTOCOMPLETE_STORE,
  VARIABLE_STORE,
  VARIABLE_FETCH_SET_LOADING_STATE,
  DATASET_SUMMARY_STORE,
  PLOTS_ACTIVE_TAB_SET,
  SPARSE_DATA_MAX_SIZE_NOTIFICATION_UPDATE,
  GUEST_PLOT_LIMIT_NOTIFICATION_SET_IS_VISIBLE,
  VIZ_CONTROL_PANEL_VISIBILITY,
  DATA_SEARCH_VISIBILITY,
  TRAJECTORY_POINT_COUNT_SUCCESS,

} from '../actionTypes/visualization';

export default function (state, action) {
  switch (action.type) {
    case QUERY_REQUEST_PROCESSING:
      return {
        ...state,
        queryRequestState: states.inProgress,
      };
    case QUERY_REQUEST_FAILURE:
      return {
        ...state,
        queryRequestState: states.failed,
      };
    case QUERY_REQUEST_SUCCESS:
      return {
        ...state,
        queryRequestState: states.succeeded,
      };
    case STORE_SAMPLE_DATA:
      return {
        ...state,
        sampleData: action.payload.sampleData,
      };
    case ADD_MAP:
      return {
        ...state,
        maps: [...state.maps, action.payload.mapInfo],
      };
    case ADD_CHART:
      return {
        ...state,
        charts: [
          { ...action.payload.chartInfo, id: state.chartID },
          ...state.charts,
        ],
        chartID: state.chartID + 1,
        plotsActiveTab: state.charts.length + 1,
      };
    case CLEAR_CHARTS:
      return {
        ...state,
        charts: [],
      };
    case CLEAR_MAPS:
      return {
        ...state,
        maps: [],
      };
    case CLOSE_CHART:
      return {
        ...state,
        charts: [
          ...state.charts.slice(0, action.payload.chartIndex),
          ...state.charts.slice(action.payload.chartInedx + 1),
        ],
        plotsActiveTab: state.charts.length === 1 ? 0 : 1,
      };

    case TRAJECTORY_POINT_COUNT_SUCCESS:
      return {
        ...state,
        trajectoryPointCounts: action.payload,
      };
    case CRUISE_TRAJECTORY_REQUEST_PROCESSING:
      return {
        ...state,
        getCruiseTrajectoryRequestState: states.inProgress,
      };
    case CRUISE_TRAJECTORY_REQUEST_SUCCESS:
      return {
        ...state,
        cruiseTrajectories: action.payload.trajectories,
        getCruiseTrajectoryRequestState: states.succeeded,
      };
    case CRUISE_TRAJECTORY_CLEAR:
      return {
        ...state,
        cruiseTrajectories: null,
      };
    case CRUISE_TRAJECTORY_ZOOM_TO:
      return {
        ...state,
        cruiseTrajectoryFocus: action.payload,
      };
    case CRUISE_TRAJECTORY_REQUEST_FAILURE:
      return {
        ...state,
        getCruiseTrajectoryRequestState: states.failed,
      };
    case CRUISE_LIST_REQUEST_PROCESSING:
      return {
        ...state,
        getCruiseListRequestState: states.inProgress,
      };
    case CRUISE_LIST_REQUEST_SUCCESS:
      return {
        ...state,
        getCruiseListRequestState: states.succeeded,
        cruiseList: action.payload.cruiseList,
      };
    case TRIGGER_SHOW_CHARTS:
      return {
        ...state,
        showChartsOnce: true,
      };
    case COMPLETED_SHOW_CHARTS:
      return {
        ...state,
        showChartsOnce: false,
      };
    case TABLE_STATS_REQUEST_SUCCESS:
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
    case VIZ_PAGE_DATA_TARGET_SET:
      return {
        ...state,
        vizPageDataTarget: action.payload.target,
        vizPageDataTargetDetails: null,
      };
    case VIZ_PAGE_DATA_TARGET_DETAILS_STORE:
      return {
        ...state,
        vizPageDataTargetDetails: action.payload.vizPageDataTargetDetails,
      };
    case VIZ_SEARCH_RESULTS_STORE_AND_UPDATE_OPTIONS:
      return {
        ...state,
        vizSearchResults: action.payload.searchResults,
        submissionOptions: action.payload.options,
        vizSearchResultsFullCounts: action.payload.counts,
      };
    case VIZ_SEARCH_RESULTS_STORE:
      return {
        ...state,
        vizSearchResults: action.payload.searchResults,
      };
    case VIZ_SEARCH_RESULTS_SET_LOADING_STATE:
      return {
        ...state,
        vizSearchResultsLoadingState: action.payload.state,
      };
    case MEMBER_VARIABLES_STORE:
      return {
        ...state,
        memberVariables: action.payload.variables,
      };
    case MEMBER_VARIABLES_SET_LOADING_STATE:
      return {
        ...state,
        memberVariablesLoadingState: action.payload.state,
      };
    case RELATED_DATA_STORE:
      return {
        ...state,
        relatedData: action.payload.data,
      };
    case RELATED_DATA_SET_LOADING_STATE:
      return {
        ...state,
        relatedDataLoadingState: action.payload.state,
      };
    case VARIABLE_NAME_AUTOCOMPLETE_STORE:
      return {
        ...state,
        autocompleteVariableNames: action.payload.autocompleteVariableNames,
      };
    case VARIABLE_STORE:
      return {
        ...state,
        variableFetchLoadingState: states.succeeded,
        variableDetails: action.payload.variableDetails,
      };
    case VARIABLE_FETCH_SET_LOADING_STATE:
      return {
        ...state,
        variableFetchLoadingState: action.payload.state,
      };
    case DATASET_SUMMARY_STORE:
      return {
        ...state,
        datasetSummary: action.payload.datasetSummary,
      };
    case PLOTS_ACTIVE_TAB_SET:
      return {
        ...state,
        plotsActiveTab: action.payload.tab,
      };
    case SPARSE_DATA_MAX_SIZE_NOTIFICATION_UPDATE:
      return {
        ...state,
        sparseDataMaxSizeNotificationData: action.payload.lastRowData,
      };
    case GUEST_PLOT_LIMIT_NOTIFICATION_SET_IS_VISIBLE:
      return {
        ...state,
        guestPlotLimitNotificationIsVisible: action.payload.isVisible,
      };
    case VIZ_CONTROL_PANEL_VISIBILITY:
      return {
        ...state,
        showControlPanel: Boolean(action.payload.isVisible),
      };
    case DATA_SEARCH_VISIBILITY:
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
      } else {
        return state;
      }


    default:
      return state;
  }
}
