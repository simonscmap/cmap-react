import * as userActionTypes from '../actionTypes/user';

// Login actions
export const userLoginRequestSend = (username, password) => ({
  type: userActionTypes.LOGIN_REQUEST_SEND,
  payload: {
    username,
    password,
  },
});

export const userLoginRequestProcessing = () => {
  return { type: userActionTypes.LOGIN_REQUEST_PROCESSING };
};

// TODO do something with the error
export const userLoginRequestFailure = (error) => ({
  type: userActionTypes.LOGIN_REQUEST_FAILURE,
});

export const userLoginRequestSuccess = () => ({
  type: userActionTypes.LOGIN_REQUEST_SUCCESS,
});

// TODO rename this to STORE_LOGGED_IN_USER
export const storeInfo = (user) => ({
  type: userActionTypes.STORE_INFO,
  payload: {
    user,
  },
});

export const userLoginRequestClearError = () => ({
  type: userActionTypes.LOGIN_REQUEST_CLEAR_ERROR,
});

// Google login actions
export const googleLoginRequestSend = (userIDToken) => ({
  type: userActionTypes.GOOGLE_LOGIN_REQUEST_SEND,
  payload: {
    userIDToken,
  },
});

export const googleLoginRequestProcessing = () => ({
  type: userActionTypes.GOOGLE_LOGIN_REQUEST_SEND_PROCESSING,
});

export const googleLoginRequestSuccess = () => ({
  type: userActionTypes.GOOGLE_LOGIN_REQUEST_SEND_SUCCESS,
});

export const googleLoginRequestFailure = () => ({
  type: userActionTypes.GOOGLE_LOGIN_REQUEST_SEND_FAILURE,
});

// Log out actions
export const logOut = () => ({
  type: userActionTypes.LOG_OUT,
});

export const destroyInfo = () => ({
  type: userActionTypes.DESTROY_INFO,
});

export const loginDialogWasCleared = () => ({
  type: userActionTypes.LOGIN_DIALOG_WAS_CLEARED,
});

// Validation actions
export const userValidationRequestSend = (username, email) => ({
  type: userActionTypes.VALIDATION_REQUEST_SEND,
  payload: {
    username,
    email,
  },
});

export const userValidationRequestProcessing = () => ({
  type: userActionTypes.VALIDATION_REQUEST_PROCESSING,
});

export const userValidationRequestFailure = () => ({
  type: userActionTypes.VALIDATION_REQUEST_FAILURE,
});

export const userValidationRequestSuccess = () => ({
  type: userActionTypes.VALIDATION_REQUEST_SUCCESS,
});

// Registration actions
export const userRegistrationRequestSend = (payload) => ({
  type: userActionTypes.REGISTRATION_REQUEST_SEND,
  payload,
});

export const userRegistrationRequestProcessing = () => ({
  type: userActionTypes.REGISTRATION_REQUEST_PROCESSING,
});

export const userRegistrationRequestFailure = () => ({
  type: userActionTypes.REGISTRATION_REQUEST_FAILURE,
});

export const userRegistrationRequestSuccess = () => ({
  type: userActionTypes.REGISTRATION_REQUEST_SUCCESS,
});

// Api key retrieval actions
export const keyRetrievalRequestSend = () => ({
  type: userActionTypes.KEY_RETRIEVAL_REQUEST_SEND,
});

export const keyRetrievalRequestSuccess = (keys) => ({
  type: userActionTypes.KEY_RETRIEVAL_REQUEST_SUCCESS,
  payload: {
    keys,
  },
});

export const keyRetrievalRequestFailure = () => ({
  type: userActionTypes.KEY_RETRIEVAL_REQUEST_FAILURE,
});

export const keyCreationRequestSend = (description) => ({
  type: userActionTypes.KEY_CREATION_REQUEST_SEND,
  payload: {
    description,
  },
});

export const keyCreationRequestProcessing = () => ({
  type: userActionTypes.KEY_CREATION_REQUEST_PROCESSING,
});

export const keyCreationRequestFailure = () => ({
  type: userActionTypes.KEY_CREATION_REQUEST_FAILURE,
});

export const keyCreationRequestSuccess = () => ({
  type: userActionTypes.KEY_CREATION_REQUEST_SUCCESS,
});

export const refreshLogin = () => ({
  type: userActionTypes.REFRESH_LOGIN,
});

export const updateUserInfoRequestSend = (userInfo) => ({
  type: userActionTypes.UPDATE_USER_INFO_REQUEST_SEND,
  payload: {
    userInfo,
  },
});

export const updateUserInfoRequestSuccess = () => ({
  type: userActionTypes.UPDATE_USER_INFO_REQUEST_SUCCESS,
});

export const updateUserInfoRequestFailure = () => ({
  type: userActionTypes.UPDATE_USER_INFO_REQUEST_FAILURE,
});

export const initializeGoogleAuth = () => ({
  type: userActionTypes.INITIALIZE_GOOGLE_AUTH,
});

export const storeGoogleAuth = () => ({
  type: userActionTypes.STORE_GOOGLE_AUTH,
});

export const recoverPasswordRequestSend = (email) => ({
  type: userActionTypes.RECOVER_PASSWORD_REQUEST_SEND,
  payload: {
    email,
  },
});

export const choosePasswordRequestSend = ({ password, token }) => ({
  type: userActionTypes.CHOOSE_PASSWORD_REQUEST_SEND,
  payload: {
    password,
    token,
  },
});

export const choosePasswordRequestSuccess = () => ({
  type: userActionTypes.CHOOSE_PASSWORD_REQUEST_SUCCESS,
});

export const choosePasswordRequestFailure = () => ({
  type: userActionTypes.CHOOSE_PASSWORD_REQUEST_FAILURE,
});

export const choosePasswordRequestReset = () => ({
  type: userActionTypes.CHOOSE_PASSWORD_REQUEST_RESET,
});

export const contactUsRequestSend = ({ name, email, message }) => ({
  type: userActionTypes.CONTACT_US_REQUEST_SEND,
  payload: {
    name,
    email,
    message,
  },
});

export const contactUsRequestSuccess = () => ({
  type: userActionTypes.CONTACT_US_REQUEST_SUCCESS,
});

export const contactUsRequestFailure = ({ message }) => ({
  type: userActionTypes.CONTACT_US_REQUEST_FAILURE,
  payload: {
    message,
  },
});

export const nominateNewDataRequestSend = ({ name, email, message }) => ({
  type: userActionTypes.NOMINATE_NEW_DATA_REQUEST_SEND,
  payload: {
    name,
    email,
    message,
  },
});

export const nominateNewDataRequestSuccess = () => ({
  type: userActionTypes.NOMINATE_NEW_DATA_REQUEST_SUCCESS,
});

export const nominateNewDataRequestFailure = ({ message }) => ({
  type: userActionTypes.NOMINATE_NEW_DATA_REQUEST_FAILURE,
  payload: {
    message,
  }
});

export const changePasswordRequestSend = (
  oldPassword,
  newPassword,
  username,
) => ({
  type: userActionTypes.CHANGE_PASSWORD_REQUEST_SEND,
  payload: {
    password: oldPassword,
    newPassword,
    username,
  },
});

export const changeEmailRequestSend = (email, password, username) => ({
  type: userActionTypes.CHANGE_EMAIL_REQUEST_SEND,
  payload: {
    email,
    password,
    username,
  },
});

export const cartPersistAddItem = (datasetID) => ({
  type: userActionTypes.CART_PERSIST_ADD_ITEM,
  payload: {
    datasetID,
  },
});

export const cartPersistRemoveItem = (datasetID) => ({
  type: userActionTypes.CART_PERSIST_REMOVE_ITEM,
  payload: {
    datasetID,
  },
});

export const cartPersistClear = () => ({
  type: userActionTypes.CART_PERSIST_CLEAR,
});

export const cartGetAndStore = () => ({
  type: userActionTypes.CART_GET_AND_STORE,
});

export const guestTokenRequestSend = () => ({
  type: userActionTypes.GUEST_TOKEN_REQUEST_SEND,
});

export const userIsGuestSet = (userIsGuest) => ({
  type: userActionTypes.USER_IS_GUEST_SET,
  payload: {
    userIsGuest,
  },
});

export const ingestCookies = () => ({ type: userActionTypes.INGEST_COOKIES });

export const updateStateFromCookies = (state) => ({
  type: userActionTypes.UPDATE_STATE_FROM_COOKIES,
  payload: {
    state,
  },
});

export const requestUserApiCallsSend = (userId) => ({
  type: userActionTypes.REQUEST_USER_API_CALLS_SEND,
  payload: userId,
});

export const requestUserApiCallsStatus = (userId, status) => ({
  type: userActionTypes.REQUEST_USER_API_CALLS_STATUS,
  payload: {
    userId,
    status,
  },
});

export const setLastDatasetTouch = ({ userId, dateObj }) => ({
  type: userActionTypes.SET_LAST_DATASET_TOUCH,
  payload: {
    userId,
    date: dateObj,
  },
});

export const clearLastDatasetTouch = ( userId ) => ({
  type: userActionTypes.CLEAR_LAST_DATASET_TOUCH,
  payload: userId,
});
