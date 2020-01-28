import * as userActionTypes from '../actionTypes/user';
import states from '../../Enums/asyncRequestStates';

export default function(state, action) {
  switch (action.type) {    

    case userActionTypes.LOGIN_REQUEST_PROCESSING: return {...state, userLoginState: states.inProgress}
    case userActionTypes.LOGIN_REQUEST_SUCCESS: return {...state, userLoginState: states.succeeded, userLoginError: null}
    case userActionTypes.LOGIN_REQUEST_FAILURE: return {...state, userLoginState: states.failed}
    case userActionTypes.LOGIN_REQUEST_CLEAR_ERROR: return {...state, userLoginError: null}

    case userActionTypes.STORE_INFO: return {...state, user: action.payload.user}
    case userActionTypes.DESTROY_INFO: return {...state, user: null, apiKeys: null, clearLoginDialog: true}
    case userActionTypes.LOGIN_DIALOG_WAS_CLEARED: return {...state, clearLoginDialog: false}

    case userActionTypes.VALIDATION_REQUEST_PROCESSING: return {...state, userValidationState: states.inProgress}
    case userActionTypes.VALIDATION_REQUEST_FAILURE: return {...state, userValidationState: states.failed}
    case userActionTypes.VALIDATION_REQUEST_SUCCESS: return {...state, userValidationState: null}

    case userActionTypes.REGISTRATION_REQUEST_PROCESSING: return {...state, userRegistrationState: states.inProgress}
    case userActionTypes.REGISTRATION_REQUEST_FAILURE: return {...state, userRegistrationState: states.failed}
    case userActionTypes.REGISTRATION_REQUEST_SUCCESS: return {...state, userRegistrationState: states.succeeded}

    case userActionTypes.KEY_RETRIEVAL_REQUEST_SUCCESS: return {...state, apiKeys: action.payload.keys}
    case userActionTypes.KEY_RETRIEVAL_REQUEST_FAILURE: return {...state, apiKeyRetrievalState: states.failed}

    case userActionTypes.KEY_CREATION_REQUEST_PROCESSING: return {...state, apiKeyCreationState: states.inProgress}
    case userActionTypes.KEY_CREATION_REQUEST_FAILURE: return {...state, apiKeyCreationState: states.failed}
    case userActionTypes.KEY_CREATION_REQUEST_SUCCESS: return {...state, apiKeyCreationState: states.succeeded}

    case userActionTypes.CHOOSE_PASSWORD_REQUEST_SUCCESS: return {...state, choosePasswordState: states.succeeded}
    case userActionTypes.CHOOSE_PASSWORD_REQUEST_FAILURE: return {...state, choosePasswordState: states.failed}
    case userActionTypes.CHOOSE_PASSWORD_REQUEST_RESET: return {...state, choosePasswordState: null}

    default: return state;
    }
}