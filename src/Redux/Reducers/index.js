import catalog from './catalog';
import user from './user';
import ui from './ui';
import news from './news';
import notifications from './notifications';
import visualization from './visualization';
import dataSubmission from './dataSubmission.js';
import help from './help.js';
import highlights from './highlights';
import data from './data';
import dropbox from '../../features/datasetDownloadDropbox/state/reducer';
import reduceReducers from 'reduce-reducers';
import { combineReducers } from 'redux';
import states from '../../enums/asyncRequestStates';
import buildSearchOptionsFromVariableList from '../../Utility/Catalog/buildSearchOptionsFromVariablesList';
import {
  localStorageIntroState,
  localStorageHintState,
} from '../../Components/Navigation/Help/initialState.js';
import initialSubscribeIntroState from '../../Components/User/Subscriptions/initialIntroState';

import { initialHelpState } from './help';
import { initialHighlightsState } from './highlights';
import { initialUserState } from './user';
import { initialDataSubmissionState } from './dataSubmission';
// Consider building this object from initial states from each reducer
// ** When adding new keys to redux store consider whether they need to be
// reset on navigation for UI purposes. If so, add them with a default state
// to the uiResetState in the ui reducer **

const initialState = {
  // Catalog state pieces
  catalogRequestState: null,
  catalog: {},
  datasetRequestState: null,
  datasets: null,
  submissionOptions: buildSearchOptionsFromVariableList([]),
  keywords: [],
  searchOptions: {},
  searchResults: [],
  searchResultsLoadingState: states.notTried,
  catalogSortingOptions: {
    direction: 'DESC',
    field: 'id',
  },

  // Catalog Recommendations
  popularDatasetsRequestState: states.notTried,
  popularDatasets: null,
  recentDatasetsRequestState: states.notTried,
  recentDatasets: null,
  recommendedDatasetsRequestState: states.notTried,
  recommendedDatasets: null,

  // Dataset Download
  download: {
    currentRequest: null,
    checkQueryRequestState: states.notTried,
    querySizeChecks: [], // list of { queryString, result }
    vaultLink: null,
    dropboxModalOpen: 'closed',
  }, // NOTE see also state.downloadDialog
  // this is an artifact of initially only using redux for the ui state

  // Dataset Details Page
  datasetDetailsPage: {
    selectedDatasetId: null,
    selectedDatasetShortname: null,

    primaryPageLoadingState: states.notTried,
    variablesLoadingState: states.notTried,
    unstructuredMetadataLoadingState: states.notTried,

    data: null,
    cruises: null,
    references: null,
    variables: null,
    sensors: null,
    unstructuredVariableMetadata: null,

    visualizableVariables: null,
    visualizableVariablesLoadingState: states.notTried,
    visualizationSelection: null,
    visualizableDataByName: null,

    tabPreference: 0,
  },

  // Programs
  programs: [],
  programsRequestStatus: states.notTried,
  programDetails: null,
  programDetailsRequestStates: states.notTried,
  programDetailsErrMessage: null,

  // Program Detail Page

  // Cruise Page
  cruiseFullPageData: {},

  // App (General Data)
  tablesWithAncillaryData: null,
  tablesWithContinuousIngestion: null,

  // Homepage
  home: {},

  // Homepage Anomaly Monitor Data
  sstReqStatus: states.notTried,
  adtReqStatus: states.notTried,
  avgSstReqStatus: states.notTried,
  avgAdtReqStatus: states.notTried,
  avgSSTData: null,
  avgADTData: null,

  // UI
  loginDialogIsOpen: false,
  changePasswordDialogIsOpen: false,
  changeEmailDialogIsOpen: false,
  registrationActiveStep: 0,
  snackbarIsOpen: false,
  snackbarMessage: null,
  loadingMessage: '',
  showHelp: false,
  windowHeight: window.innerHeight,
  windowWidth: window.innerWidth,
  subscribeDatasetDialog: {
    open: false,
    shortName: null,
  },
  downloadDialog: {
    open: false,
  },

  // User state pieces moved to user slice reducer

  preferences: {},
  intros: localStorageIntroState,
  hints: localStorageHintState,

  resumeAction: null, // a literal action to resume, e.g. after user login

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Visualization state pieces
  charts: [],

  // viz
  viz: {
    chart: {
      controls: {
        paramLock: false, // lock the spatial-temporal constraints
        dateTypeMismatch: false, // e.g locked monthly dates with currnt non-monthly target
        variableResolutionMismatch: false,
        lockAlertsOpen: false,
        resolutionMismatch: false,
        // controlPanelVisible: true,
        // searchOpen: false,
      },
      validation: {
        sizeCheck: {
          status: states.notTried,
          result: null,
        },
      },
      // variables: [],        // (was memberVariables)
      // targetVariable: null, // (was vizPageDataTarget)
      // targetDetails: null,  // (was vizPageDataTargetDetails)
      //
    },
  },

  // controls
  showControlPanel: true,
  dataSearchMenuOpen: false,

  // variables
  memberVariables: [], // list of variables available for selection in viz control panel
  memberVariablesLoadingState: states.succeeded,

  chartID: 0,

  vizPageDataTarget: null,
  vizPageDataTargetDetails: null,
  vizSearchResults: { Observation: [], Model: [] },
  vizSearchResultsFullCounts: { Observation: 0, Model: 0 },
  vizSearchResultsLoadingState: states.succeeded,

  showChartsOnce: null,

  cruiseList: [],

  trajectoryPointCounts: null,
  getCruiseTrajectoryRequestState: null,
  cruiseTrajectories: null,
  cruiseTrajectoryFocus: null,

  sampleData: null,
  queryRequestState: null,
  getTableStatsRequestState: null,
  getCruiseListRequestState: null,

  relatedData: [],
  relatedDataLoadingState: states.succeeded,

  autocompleteVariableNames: [],

  variableDetails: null,

  datasetSummary: null,

  plotsActiveTab: 0,

  sparseDataMaxSizeNotificationData: null,

  guestPlotLimitNotificationIsVisible: false,

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  // Data Submission state pieces - MIGRATED to dataSubmission slice reducer

  // News
  news: {
    stories: [],
    viewStateFilter: [1, 2, 3],
    rankFilter: false,
    sortTerm: 'modify_date',
    orderOfImportance: 'descending',
    openRanksEditor: false,
    ranks: [],
    addRank: [],
    adminMessages: [],
    requestStatus: {
      create: states.notTried,
      update: states.notTried,
      updateRanks: states.notTried,
      updateViewStatus: states.notTried,
      list: states.notTried,
    },
  },

  // Notifications && Subscriptions
  notificationHistory: {},
  notificationRecipientProjections: {},
  notificationRecipientProjectionsRequestStatus: {},
  sentNotifications: [],
  sendNotificationsStatus: [],
  reSendNotificationsStatus: [],
  subscribeIntroActive: initialSubscribeIntroState.subscribeIntroActive,
  // dropbox initial state moved to slice reducer in dropbox/reducer.js
};

// Stage 1: Create combineReducers structure for migrated slice reducers
// This function is updated as individual reducers are migrated to slice pattern
const createCombinedSliceReducers = () => {
  return combineReducers({
    user: user, // Migrated to slice reducer pattern
    dropbox: dropbox, // Migrated to slice reducer pattern
    help: help, // Migrated to slice reducer pattern
    highlights: highlights, // Migrated to slice reducer pattern
    dataSubmission: dataSubmission, // Migrated to slice reducer pattern
  });
};

// Stage 2: Hybrid root reducer combining slice-based and full-state patterns
// Custom hybrid reducer that properly partitions state between combineReducers and full-state reducers
const reducedReducer = (state = initialState, action) => {
  // Step 1: Extract slice state for combineReducers (only the keys it manages)
  // Note: For newly migrated slices, state.sliceName might not exist yet on first initialization
  const sliceState = {
    user: state.user || undefined, // user slice manages its own state now, undefined allows reducer to use default
    dropbox: state.dropbox,
    help: state.help || undefined, // help slice manages its own state now, undefined allows reducer to use default
    highlights: state.highlights || undefined, // highlights slice manages its own state now, undefined allows reducer to use default
    dataSubmission: state.dataSubmission || undefined, // dataSubmission slice manages its own state now, undefined allows reducer to use default
  };

  // Step 2: Process slice reducers with combineReducers
  const combinedSliceReducer = createCombinedSliceReducers();
  const newSliceState = combinedSliceReducer(sliceState, action);

  // Step 3: Create updated state with slice changes and compatibility mappings
  // SINGLE SOURCE OF TRUTH PATTERN: Use imported initial states from each reducer
  // instead of hardcoded fallbacks to eliminate duplication and ensure consistency
  const stateWithSliceUpdates = {
    ...state,
    ...newSliceState, // Direct merge for state shape compatible slices (e.g., dropbox, user)
    // STATE SHAPE TRANSFORMATIONS: Required when slice shape differs from original

    ...(newSliceState.user || initialUserState),
    intros: newSliceState.help
      ? newSliceState.help.intros
      : initialHelpState.intros,
    hints: newSliceState.help
      ? newSliceState.help.hints
      : initialHelpState.hints,
    home: {
      ...state.home,
      highlights: newSliceState.highlights || initialHighlightsState,
    },
    // Spread dataSubmission slice state directly into root state shape
    ...(newSliceState.dataSubmission || initialDataSubmissionState),
  };

  // Step 3: Process through full-state reducers in sequence
  return reduceReducers(
    stateWithSliceUpdates,
    catalog, // Full-state reducer (reverted from slice pattern)
    ui, // Full-state reducer (reverted from slice pattern)
    visualization, // Full-state reducer (reverted from slice pattern)
    news, // Full-state reducer (reverted from slice pattern)
    // user, // MIGRATED to slice reducer pattern
    // dataSubmission, // MIGRATED to slice reducer pattern
    // highlights, // MIGRATED to slice reducer pattern
    data, // Full-state reducer (unmigrated)
    notifications, // Full-state reducer (unmigrated)
  )(stateWithSliceUpdates, action);
};

// Export the hybrid reducer as default (current usage)
export default reducedReducer;
