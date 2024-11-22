import {
  INTERFACE_SHOW_LOGIN_DIALOG,
  INTERFACE_HIDE_LOGIN_DIALOG,
  REGISTRATION_NEXT_ACTIVE_STEP,
  REGISTRATION_PREVIOUS_ACTIVE_STEP,
  RESTORE_INTERFACE_DEFAULTS,
  SNACKBAR_OPEN,
  SNACKBAR_CLOSE,
  SET_LOADING_MESSAGE,
  TOGGLE_SHOW_HELP,
  SHOW_CHANGE_EMAIL_DIALOG,
  HIDE_CHANGE_EMAIL_DIALOG,
  SHOW_CHANGE_PASSWORD_DIALOG,
  HIDE_CHANGE_PASSWORD_DIALOG,
  WINDOW_RESIZE,
  SUBSCRIBE_DATASET_DIALOG_OPEN,
  SUBSCRIBE_DATASET_DIALOG_CLEAR,
  DOWNLOAD_DIALOG_OPEN,
  DOWNLOAD_DIALOG_CLEAR,
  SET_DOWNLOAD_DIALOG_DATA,
  SET_FETCH_DOWNLAD_DIALOG_DATA_REQUEST_STATE,
  SET_SUBSCRIBE_INTRO_STATE,
} from '../actionTypes/ui';
import states from '../../enums/asyncRequestStates';

const uiResetState = {
  catalogRequestState: null,
  loginDialogIsOpen: false,
  registrationActiveStep: 0,
  userLoginState: null,
  userLoginError: null,
  userValidationState: null,
  userValidationError: null,
  userRegistrationState: null,
  apiKeyRetrievalState: null,
  apiKeyCreationState: null,
  subscribeDatasetDialog: { open: false },
  downloadDialog: { open: false },
};

export default function (state, action) {
  switch (action.type) {
    case INTERFACE_SHOW_LOGIN_DIALOG:
      return {
        ...state,
        loginDialogIsOpen: true,
        userLoginState: states.notTried,
      };
    case INTERFACE_HIDE_LOGIN_DIALOG:
      return {
        ...state,
        loginDialogIsOpen: false,
        userLoginError: null,
      };
    case REGISTRATION_NEXT_ACTIVE_STEP:
      return {
        ...state,
        registrationActiveStep: state.registrationActiveStep + 1,
      };
    case REGISTRATION_PREVIOUS_ACTIVE_STEP:
      return {
        ...state,
        registrationActiveStep: state.registrationActiveStep - 1,
      };
    case RESTORE_INTERFACE_DEFAULTS:
      return {
        ...state,
        ...uiResetState,
      };
    case SNACKBAR_OPEN:
      return {
        ...state,
        snackbarIsOpen: true,
        snackbarMessage: action.payload.message,
      };
    case SNACKBAR_CLOSE:
      return {
        ...state,
        snackbarIsOpen: false,
      };
    case SET_LOADING_MESSAGE:
      return {
        ...state,
        loadingMessage: action.payload.message,
      };
    case TOGGLE_SHOW_HELP:
      return {
        ...state,
        showHelp: !state.showHelp,
      };
    case SHOW_CHANGE_EMAIL_DIALOG:
      return {
        ...state,
        changeEmailDialogIsOpen: true,
      };
    case HIDE_CHANGE_EMAIL_DIALOG:
      return {
        ...state,
        changeEmailDialogIsOpen: false,
      };
    case SHOW_CHANGE_PASSWORD_DIALOG:
      return {
        ...state,
        changePasswordDialogIsOpen: true,
      };
    case HIDE_CHANGE_PASSWORD_DIALOG:
      return {
        ...state,
        changePasswordDialogIsOpen: false,
      };
    case WINDOW_RESIZE:
      return {
        ...state,
        windowHeight: action.payload.height,
        windowWidth: action.payload.width,
      };
    case SUBSCRIBE_DATASET_DIALOG_OPEN:
      return {
        ...state,
        subscribeDatasetDialog: {
          open: true,
          shortName: action.payload.shortName,
        }
      };
    case SUBSCRIBE_DATASET_DIALOG_CLEAR:
      return {
        ...state,
        subscribeDatasetDialog: {
          open: false,
        }
      };
     case DOWNLOAD_DIALOG_OPEN:
      return {
        ...state,
        downloadDialog: {
          open: true,
          shortName: action.payload.shortName,
        }
      };
    case DOWNLOAD_DIALOG_CLEAR:
      return {
        ...state,
        downloadDialog: {
          open: false,
        }
      };
    case SET_DOWNLOAD_DIALOG_DATA:
      return {
        ...state,
        downloadDialog: {
          // set fullPageData in dialog
          ...state.downloadDialog,
          data: action.payload,
        }
      };
    case SET_FETCH_DOWNLAD_DIALOG_DATA_REQUEST_STATE:
      return {
        ...state,
        downloadDialog: {
          // set fullPageData in dialog
          ...state.downloadDialog,
          requestStatus: action.payload,
        }
      };

    case SET_SUBSCRIBE_INTRO_STATE:
      return {
        ...state,
        subscribeIntroActive: action.payload,
      };
    default:
      return state;
  }
}
