import catalog from './catalog';
import user from './user';
import ui from './ui';
import visualization from './visualization';
import dataSubmission from './dataSubmission.js';
import reduceReducers from 'reduce-reducers';
import Cookies from 'js-cookie';

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

    // Interface state pieces
    loginDialogIsOpen: false,
    changePasswordDialogIsOpen: false,
    changeEmailDialogIsOpen: false,
    registrationActiveStep: 0,
    snackbarIsOpen: false,
    snackbarMessage: null,
    loadingMessage: '',
    showHelp: false,

    // User state pieces
    user: JSON.parse(Cookies.get('UserInfo') || null),

    apiKeys: null,
    apiKeyRetrievalState: null,
    apiKeyCreationState: null,

    clearLoginDialog: false,

    userLoginState: null,

    userValidationState: null,

    userRegistrationState: null,

    choosePasswordState: null,

    // Visualization state pieces
    maps: [],
    charts: [],
    getCruiseTrajectoryRequestState: null,
    cruiseTrajectory: null,
    sampleData: null,
    queryRequestState: null,
    storedProcedureRequestState: null,
    getTableStatsRequestState: null,
    cruiseList: [],
    getCruiseListRequestState: null,
    showChartsOnce: null,
    chartID: 0

    // Data Submission state pieces
}

const reducedReducer = reduceReducers(initialState, catalog, user, ui, visualization);

export default reducedReducer;