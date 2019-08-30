import * as interfaceActionTypes from '../actionTypes/ui';

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
  apiKeyCreationState: null
}

export default function(state, action) {
  switch (action.type) {
    case interfaceActionTypes.INTERFACE_SHOW_LOGIN_DIALOG: return {...state, loginDialogIsOpen: true};
    case interfaceActionTypes.INTERFACE_HIDE_LOGIN_DIALOG: return {...state, loginDialogIsOpen: false, userLoginError: null};
    case interfaceActionTypes.REGISTRATION_NEXT_ACTIVE_STEP: return {...state, registrationActiveStep: state.registrationActiveStep + 1}
    case interfaceActionTypes.REGISTRATION_PREVIOUS_ACTIVE_STEP: return {...state, registrationActiveStep: state.registrationActiveStep - 1}
    case interfaceActionTypes.RESTORE_INTERFACE_DEFAULTS: return {
      ...state,
      ...uiResetState
    }
    case interfaceActionTypes.SNACKBAR_OPEN: return {
      ...state,
      snackbarIsOpen: true,
      snackbarMessage: action.payload.message
    }
    case interfaceActionTypes.SNACKBAR_CLOSE: return {...state, snackbarIsOpen: false}
    default: return state;
  }
}