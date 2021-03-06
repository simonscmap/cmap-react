import catalog from './catalog';
import user from './user';
import ui from './ui';
import visualization from './visualization';
import dataSubmission from './dataSubmission.js';
import reduceReducers from 'reduce-reducers';
import Cookies from 'js-cookie';
import states from '../../Enums/asyncRequestStates';
import buildSearchOptionsFromVariableList from '../../Utility/Catalog/buildSearchOptionsFromVariablesList';
// Consider building this object from initial states from each reducer
// ** When adding new keys to redux store consider whether they need to be
// reset on navigation for UI purposes. If so, add them with a default state
// to the uiResetState in the ui reducer **
const initialState = {

    // Catalog state pieces
    catalogRequestState: null,
    catalog: null,
    datasetRequestState: null,
    datasets: null,
    submissionOptions: buildSearchOptionsFromVariableList([]),
    keywords: [],
    searchOptions: {},
    searchResults: [],
    searchResultsLoadingState: states.succeeded,
    datasetFullPageData: {},
    datasetFullPageDataLoadingState: states.succeeded,
    cruiseFullPageData: {},
    datasetFullPageDataLoadingState: states.succeeded,
    cart: {},
    showCart: false,

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
    user: JSON.parse(Cookies.get('UserInfo') || null),
    userIsGuest: false,

    apiKeys: null,
    apiKeyRetrievalState: null,
    apiKeyCreationState: null,

    clearLoginDialog: false,

    userLoginState: null,

    userValidationState: null,

    userRegistrationState: null,

    choosePasswordState: null,

    preferences: {
        
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
    vizSearchResults: {Observation: [], Model: []},
    vizSearchResultsFullCounts: {Observation: 0, Model: 0},
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

    // Data Submission state pieces

    dataSubmissions: [],
    submissionComments: [],
    submissionCommentHistoryRetrievalState: states.succeeded,
    submissionFile: null,
    submissionUploadState: null,
    dataSubmissionSelectOptions: null
}

const reducedReducer = reduceReducers(initialState, catalog, user, ui, visualization, dataSubmission);

export default reducedReducer;