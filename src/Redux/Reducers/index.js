import catalog from './catalog';
import user from './user';
import ui from './ui';
import news from './news';
import visualization from './visualization';
import dataSubmission from './dataSubmission.js';
import help from './help.js';
import reduceReducers from 'reduce-reducers';
import Cookies from 'js-cookie';
import states from '../../enums/asyncRequestStates';
import buildSearchOptionsFromVariableList from '../../Utility/Catalog/buildSearchOptionsFromVariablesList';
import {
  localStorageIntroState,
  localStorageHintState,
} from '../../Components/Navigation/Help/initialState.js';
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

  // Dataset Download
  download: {
    currentRequest: null,
    checkQueryRequestState: states.notTried,
    querySizeChecks: [], // list of { queryString, result }
  },

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
  },

  // Cruise Page
  cruiseFullPageData: {},

  // App (General Data)
  cart: {},
  showCart: false,
  tablesWithAncillaryData: null,
  tablesWithContinuousIngestion: null,

  // Interface state pieces
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

  // User state pieces
  user: JSON.parse(Cookies.get('UserInfo') || null), // catch much? // block much?
  userIsGuest: false,
  apiKeys: null,
  apiKeyRetrievalState: null,
  apiKeyCreationState: null,
  clearLoginDialog: false,
  userLoginState: null,
  userValidationState: null,
  userRegistrationState: null,
  choosePasswordState: null,
  preferences: {},
  intros: localStorageIntroState,
  hints: localStorageHintState,
  contactUs: {
    requestState: states.notTried,
    data: null,
  },
  nominateNewData: {
    requestState: states.notTried,
    data: null,
  },

  // Visualization state pieces
  maps: [],
  charts: [],
  getCruiseTrajectoryRequestState: null,
  cruiseTrajectory: null,
  sampleData: null,
  queryRequestState: null,
  getTableStatsRequestState: null,
  cruiseList: [],
  getCruiseListRequestState: null,
  showChartsOnce: null,
  chartID: 0,
  vizPageDataTarget: null,
  vizPageDataTargetDetails: null,
  vizSearchResults: { Observation: [], Model: [] },
  vizSearchResultsFullCounts: { Observation: 0, Model: 0 },
  vizSearchResultsLoadingState: states.succeeded,
  memberVariables: [],
  memberVariablesLoadingState: states.succeeded,
  relatedData: [],
  relatedDataLoadingState: states.succeeded,
  autocompleteVariableNames: [],
  variableDetails: null,
  datasetSummary: null,
  plotsActiveTab: 0,
  sparseDataMaxSizeNotificationData: null,
  guestPlotLimitNotificationIsVisible: false,
  showControlPanel: true,
  dataSearchMenuOpen: false,

  // Data Submission state pieces
  dataSubmissions: [],
  submissionComments: [],
  submissionCommentHistoryRetrievalState: states.succeeded,
  submissionFile: null,
  submissionUploadState: null,
  dataSubmissionSelectOptions: null,

  // News
  news: {
    stories: [],
    viewStateFilter: [1,2,3],
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
    }
  }
};

const reducedReducer = reduceReducers(
  initialState,
  catalog,
  user,
  ui,
  visualization,
  dataSubmission,
  help,
  news,
);

export default reducedReducer;
