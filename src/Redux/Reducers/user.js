import * as actions from '../actionTypes/user';
import states from '../../enums/asyncRequestStates';

export default function (state, action) {
  switch (action.type) {
  case actions.LOGIN_REQUEST_PROCESSING:
    return {
      ...state,
      userLoginState: states.inProgress
    };

  case actions.LOGIN_REQUEST_SUCCESS:
    return {
      ...state,
      userLoginState: states.succeeded,
      userLoginError: null,
    };

  case actions.LOGIN_REQUEST_FAILURE:
    return {
      ...state,
      userLoginState: states.failed
    };

  case actions.LOGIN_REQUEST_CLEAR_ERROR:
    return {
      ...state,
      userLoginError: null
    };

  case actions.STORE_INFO:
    return {
      ...state,
      user: { ...action.payload.user }
    };
  case actions.DESTROY_INFO:
    return {
      ...state,
      user: null,
      apiKeys: null,
      clearLoginDialog: true,
      userApiCallsRequestStatus: states.notTried,
    };

  case actions.REQUEST_USER_API_CALLS_STATUS:
    return {
      ...state,
      userApiCallsRequestStatus: action.payload.status,
    };

  case actions.SET_LAST_DATASET_TOUCH:
    return {
      ...state,
      user: {
        ...(state.user || {}),
        lastDatasetTouch: action.payload.date,
      }
    };
  case actions.CLEAR_LAST_DATASET_TOUCH:
    return {
      ...state,
      user: {
        ...(state.user || {}),
        lastDatasetTouch: undefined,
      },
      userApiCallsRequestStatus: states.notTried,
    };

  case actions.LOGIN_DIALOG_WAS_CLEARED:
    return { ...state, clearLoginDialog: false };

  case actions.VALIDATION_REQUEST_PROCESSING:
    return { ...state, userValidationState: states.inProgress };
  case actions.VALIDATION_REQUEST_FAILURE:
    return { ...state, userValidationState: states.failed };
  case actions.VALIDATION_REQUEST_SUCCESS:
    return { ...state, userValidationState: null };

  case actions.REGISTRATION_REQUEST_PROCESSING:
    return { ...state, userRegistrationState: states.inProgress };
  case actions.REGISTRATION_REQUEST_FAILURE:
    return { ...state, userRegistrationState: states.failed };
  case actions.REGISTRATION_REQUEST_SUCCESS:
    return { ...state, userRegistrationState: states.succeeded };

  case actions.REGISTER_WITH_GOOGLE_CONTEXT:
    return {
      ...state,
      userRegisterWithGoogleContext: true,
    }
  case actions.REGISTER_WITH_GOOGLE_CONTEXT_CLEAR:
    return {
      ...state,
      userRegisterWithGoogleContext: false,
    }
  case actions.GSI_INITIALIZED:
    return {
      ...state,
      gsiInitialized: true,
    };

  case actions.KEY_RETRIEVAL_REQUEST_SUCCESS:
    return { ...state, apiKeys: action.payload.keys };
  case actions.KEY_RETRIEVAL_REQUEST_FAILURE:
    return { ...state, apiKeyRetrievalState: states.failed };

  case actions.KEY_CREATION_REQUEST_PROCESSING:
    return { ...state, apiKeyCreationState: states.inProgress };
  case actions.KEY_CREATION_REQUEST_FAILURE:
    return { ...state, apiKeyCreationState: states.failed };
  case actions.KEY_CREATION_REQUEST_SUCCESS:
    return { ...state, apiKeyCreationState: states.succeeded };

  case actions.CHOOSE_PASSWORD_REQUEST_SUCCESS:
    return { ...state, choosePasswordState: states.succeeded };
  case actions.CHOOSE_PASSWORD_REQUEST_FAILURE:
    return { ...state, choosePasswordState: states.failed };
  case actions.CHOOSE_PASSWORD_REQUEST_RESET:
    return { ...state, choosePasswordState: null };

  case actions.USER_IS_GUEST_SET:
    return { ...state, userIsGuest: action.payload.userIsGuest };

  case actions.UPDATE_STATE_FROM_COOKIES:
    return { ...state, ...action.payload.state };

  case actions.CONTACT_US_REQUEST_SEND:
    return {
      ...state,
      contactUs: {
        requestState: states.inProgress,
        data: action.payload,
      },
    };
  case actions.CONTACT_US_REQUEST_SUCCESS:
    return {
      ...state,
      contactUs: {
        requestState: states.succeeded,
      },
    };
  case actions.CONTACT_US_REQUEST_FAILURE:
    return {
      ...state,
      contactUs: {
        requestState: states.failed,
        data: action.payload,
      },
    };

  case actions.NOMINATE_NEW_DATA_REQUEST_SEND:
    return {
      ...state,
      nominateNewData: {
        requestState: states.inProgress,
        data: action.payload,
      },
    };
  case actions.NOMINATE_NEW_DATA_REQUEST_SUCCESS:
    return {
      ...state,
      nominateNewData: {
        requestState: states.succeeded,
      },
    };
  case actions.NOMINATE_NEW_DATA_REQUEST_FAILURE:
    return {
      ...state,
      nominateNewData: {
        requestState: states.failed,
        data: action.payload,
      },
    };

  case actions.SET_FETCH_SUBSCRIPTIONS_REQUEST_STATUS:
    return {
      ...state,
      userSubscriptionsRequestStatus: action.payload,
    };

  case actions.FETCH_SUBSCRIPTIONS_SUCCESS:
    return {
      ...state,
      userSubscriptionsRequestStatus: states.succeeded,
      userSubscriptions: action.payload.subscriptions,
    };


  case actions.SET_CREATE_SUBSCRIPTION_REQUEST_STATUS:
    return {
      ...state,
      userCreateSubscriptionRequestStatus: action.payload,
    };


  case actions.SET_DELETE_SUBSCRIPTIONS_REQUEST_STATUS:
    return {
      ...state,
      userDeleteSubscriptionRequestStatus: action.payload,
    };

  default:
    return state;
  }
}
