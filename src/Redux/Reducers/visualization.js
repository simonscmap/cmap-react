import states from '../../enums/asyncRequestStates';
import { helpActionTypes } from '../actions/help.js';
import { VISUALIZATION_PAGE } from '../../constants';
import temporalResolutions from '../../enums/temporalResolutions';
import { safePath } from '../../Utility/objectUtils';
import {
  QUERY_REQUEST_PROCESSING,
  QUERY_REQUEST_FAILURE,
  QUERY_REQUEST_SUCCESS,
  STORE_SAMPLE_DATA,
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
  SET_PARAM_LOCK,
  SET_LOCK_ALERTS_OPEN,
  // CHECK_VIZ_QUERY_SIZE,
  CHECK_VIZ_QUERY_SIZE_STORE,
  SET_CHECK_VIZ_QUERY_SIZE_STATUS,
} from '../actionTypes/visualization';

const monthlyClimatology = temporalResolutions.monthlyClimatology;

const paramLockFromState = safePath(['viz', 'chart', 'controls', 'paramLock']);

// for variable selection in the charts page,
// determine whether there is a date type  mismatch between previous variable and
// the variable that is set by this action
const dateTypeMismatchFromState = safePath([
  'viz',
  'chart',
  'controls',
  'dateTypeMismatch',
]);
const calculateDateTypeMismatch = (state, action) => {
  const { type: actionType, payload } = action;
  const dateTypeMismatch = dateTypeMismatchFromState(state);
  const paramLock = paramLockFromState(state);
  if (actionType !== VIZ_PAGE_DATA_TARGET_SET || !paramLock) {
    return dateTypeMismatch; // return prev state;
  } else {
    const prevTargetTemporalResolutionIsMC =
      state.vizPageDataTarget &&
      state.vizPageDataTarget.Temporal_Resolution === monthlyClimatology;
    const currTargetTemporalResolutionIsMC =
      payload &&
      payload.target &&
      payload.target.Temporal_Resolution === monthlyClimatology;
    if (prevTargetTemporalResolutionIsMC && !currTargetTemporalResolutionIsMC) {
      return true;
    } else {
      return false;
    }
  }
};

// for variable selection in the charts page,
// determine whether there is a target mismatch between previous variable and
// the variable that is set by this action
const variableResolutionMismatchFromState = safePath([
  'viz',
  'chart',
  'controls',
  'variableResolutionMismatch',
]);
const calculateVariableResolutionMismatch = (state, action) => {
  const { type: actionType } = action;
  const variableResolutionMismatch = variableResolutionMismatchFromState(state);
  const paramLock = paramLockFromState(state);
  if (actionType !== VIZ_PAGE_DATA_TARGET_SET || !paramLock) {
    return variableResolutionMismatch; // return prev state;
  } else {
    // check
    const prevDatasetShortName = safePath([
      'vizPageDataTargetDetails',
      'Short_Name',
    ])(state);
    const newTargetShortName = safePath([
      'payload',
      'target',
      'Dataset_Short_Name',
    ])(action);
    if (prevDatasetShortName && prevDatasetShortName !== newTargetShortName) {
      return true;
    }
    return false;
  }
};

const lockAlertsOpen_path = ['viz', 'chart', 'controls', 'lockAlertsOpen'];
const shouldOpenLockAlerts = (state, action) => {
  const isOpen = safePath(lockAlertsOpen_path)(state);
  if (!isOpen) {
    // don't calculate this (again) if you don't have to
    const dateMsmtch = calculateDateTypeMismatch(state, action);
    const varResMsmtch = calculateVariableResolutionMismatch(state, action);
    if (dateMsmtch || varResMsmtch) {
      return true; // open alerts
    } else {
      return false; // keep alerts closed;
    }
  } else {
    return isOpen; // don't change open state
  }
};

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
      console.log('close chart', action.payload.chartIndex);
      return {
        ...state,
        charts: [
          ...state.charts.slice(0, action.payload.chartIndex),
          ...state.charts.slice(action.payload.chartIndex + 1),
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
        cruiseTrajectoryFocusNonce: Math.random(),
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
        viz: {
          ...state.viz,
          chart: {
            ...state.viz.chart,
            controls: {
              ...state.viz.chart.controls,
              dateTypeMismatch: calculateDateTypeMismatch(state, action),
              variableResolutionMismatch: calculateVariableResolutionMismatch(
                state,
                action,
              ),
              lockAlertsOpen: shouldOpenLockAlerts(state, action),
            },
            validation: {
              ...state.viz.chart.validation,
              sizeCheck: {
                status: states.notTried,
                result: null,
              },
            },
          },
        },
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
      // eslint-disable-next-line
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

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    case SET_PARAM_LOCK:
      return {
        ...state,
        viz: {
          ...state.viz,
          chart: {
            ...state.viz.chart,
            controls: {
              ...state.viz.chart.controls,
              paramLock: action.payload,
            },
          },
        },
      };

    case SET_LOCK_ALERTS_OPEN:
      return {
        ...state,
        viz: {
          ...state.viz,
          chart: {
            ...state.viz.chart,
            controls: {
              ...state.viz.chart.controls,
              lockAlertsOpen: action.payload,
            },
          },
        },
      };
    // case CHECK_VIZ_QUERY_SIZE:
    // we don't set status to inProgress here, because the saga
    // will check to see if a different request is already in progress

    case SET_CHECK_VIZ_QUERY_SIZE_STATUS:
      return {
        ...state,
        viz: {
          ...state.viz,
          chart: {
            ...state.viz.chart,
            validation: {
              ...state.viz.chart.validation,
              sizeCheck: {
                // ...state.viz.chart.validation.sizeCheck,
                status: action.payload,
              },
            },
          },
        },
      };

    case CHECK_VIZ_QUERY_SIZE_STORE:
      return {
        ...state,
        viz: {
          ...state.viz,
          chart: {
            ...state.viz.chart,
            validation: {
              ...state.viz.chart.validation,
              sizeCheck: {
                status: states.succeeded,
                result: action.payload,
              },
            },
          },
        },
      };
    default:
      return state;
  }
}
