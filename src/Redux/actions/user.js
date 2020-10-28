import * as userActionTypes from '../actionTypes/user';

// Login actions
export const userLoginRequestSend = (username, password) => ({
    type: userActionTypes.LOGIN_REQUEST_SEND,
    payload: {
        username,
        password
    }
});

export const userLoginRequestProcessing = () => {
    return {type: userActionTypes.LOGIN_REQUEST_PROCESSING};
};

export const userLoginRequestFailure = (error) => ({
    type: userActionTypes.LOGIN_REQUEST_FAILURE,
});

export const userLoginRequestSuccess = () => ({
    type: userActionTypes.LOGIN_REQUEST_SUCCESS
});

export const storeInfo = (user) => ({
    type: userActionTypes.STORE_INFO,
    payload: {
        user
    }
});

export const userLoginRequestClearError = () => ({
    type: userActionTypes.LOGIN_REQUEST_CLEAR_ERROR
})

// Google login actions
export const googleLoginRequestSend = (userIDToken) => ({
    type: userActionTypes.GOOGLE_LOGIN_REQUEST_SEND,
    payload: {
        userIDToken
    }
});

export const googleLoginRequestProcessing = () => ({
    type: userActionTypes.GOOGLE_LOGIN_REQUEST_SEND_PROCESSING
});

export const googleLoginRequestSuccess = () => ({
    type: userActionTypes.GOOGLE_LOGIN_REQUEST_SEND_SUCCESS
});

export const googleLoginRequestFailure = () => ({
    type: userActionTypes.GOOGLE_LOGIN_REQUEST_SEND_FAILURE
});

// Log out actions
export const logOut = () => ({
    type:userActionTypes.LOG_OUT
});

export const destroyInfo = () => ({
    type: userActionTypes.DESTROY_INFO
});

export const loginDialogWasCleared = () => ({
    type: userActionTypes.LOGIN_DIALOG_WAS_CLEARED
});

// Validation actions
export const userValidationRequestSend = (username, email) => ({
    type: userActionTypes.VALIDATION_REQUEST_SEND,
    payload: {
        username,
        email
    }
});

export const userValidationRequestProcessing = () => ({
    type: userActionTypes.VALIDATION_REQUEST_PROCESSING
});

export const userValidationRequestFailure = () => ({
    type: userActionTypes.VALIDATION_REQUEST_FAILURE
});

export const userValidationRequestSuccess = () => ({
    type: userActionTypes.VALIDATION_REQUEST_SUCCESS
});

// Registration actions
export const userRegistrationRequestSend = (payload) => ({
    type: userActionTypes.REGISTRATION_REQUEST_SEND,
    payload
});

export const userRegistrationRequestProcessing = () => ({
    type: userActionTypes.REGISTRATION_REQUEST_PROCESSING
});

export const userRegistrationRequestFailure = () => ({
    type:userActionTypes.REGISTRATION_REQUEST_FAILURE
});

export const userRegistrationRequestSuccess = () => ({
    type: userActionTypes.REGISTRATION_REQUEST_SUCCESS
});

// Api key retrieval actions
export const keyRetrievalRequestSend = () => ({
    type: userActionTypes.KEY_RETRIEVAL_REQUEST_SEND
});

export const keyRetrievalRequestSuccess = (keys) => ({
    type: userActionTypes.KEY_RETRIEVAL_REQUEST_SUCCESS,
    payload: {
        keys
    }
});

export const keyRetrievalRequestFailure = () => ({
    type: userActionTypes.KEY_RETRIEVAL_REQUEST_FAILURE
});

export const keyCreationRequestSend = (description) => ({
    type: userActionTypes.KEY_CREATION_REQUEST_SEND,
    payload: {
        description
    }
});

export const keyCreationRequestProcessing = () => ({
    type: userActionTypes.KEY_CREATION_REQUEST_PROCESSING
});

export const keyCreationRequestFailure = () => ({
    type: userActionTypes.KEY_CREATION_REQUEST_FAILURE
});

export const keyCreationRequestSuccess = () => ({
    type: userActionTypes.KEY_CREATION_REQUEST_SUCCESS
});

export const refreshLogin = () => ({
    type: userActionTypes.REFRESH_LOGIN
});

export const updateUserInfoRequestSend = (userInfo) => ({
    type: userActionTypes.UPDATE_USER_INFO_REQUEST_SEND,
    payload: {
        userInfo
    }
});

export const updateUserInfoRequestSuccess = () => ({
    type: userActionTypes.UPDATE_USER_INFO_REQUEST_SUCCESS
});

export const updateUserInfoRequestFailure = () => ({
    type: userActionTypes.UPDATE_USER_INFO_REQUEST_FAILURE
});

export const initializeGoogleAuth = () => ({
    type: userActionTypes.INITIALIZE_GOOGLE_AUTH
});

export const storeGoogleAuth = () => ({
    type: userActionTypes.STORE_GOOGLE_AUTH
});

export const recoverPasswordRequestSend = (email) => ({
    type: userActionTypes.RECOVER_PASSWORD_REQUEST_SEND,
    payload: {
        email
    }
});

export const choosePasswordRequestSend = ({password, token}) => ({
    type: userActionTypes.CHOOSE_PASSWORD_REQUEST_SEND,
    payload: {
        password,
        token
    }
});

export const choosePasswordRequestSuccess = () => ({
    type: userActionTypes.CHOOSE_PASSWORD_REQUEST_SUCCESS
});

export const choosePasswordRequestFailure = () => ({
    type: userActionTypes.CHOOSE_PASSWORD_REQUEST_FAILURE
});

export const choosePasswordRequestReset = () => ({
    type: userActionTypes.CHOOSE_PASSWORD_REQUEST_RESET
});

export const contactUsRequestSend = ({name, email, subject, message}) => ({
    type: userActionTypes.CONTACT_US_REQUEST_SEND,
    payload: {
        name,
        email,
        subject,
        message
    }
});

export const changePasswordRequestSend = (oldPassword, newPassword, username) => ({
    type: userActionTypes.CHANGE_PASSWORD_REQUEST_SEND,
    payload: {
        password: oldPassword,
        newPassword,
        username
    }
});

export const changeEmailRequestSend = (email, password, username) => ({
    type: userActionTypes.CHANGE_EMAIL_REQUEST_SEND,
    payload: {
        email,
        password,
        username
    }
});

export const cartPersistAddItem = (datasetID) => ({
    type: userActionTypes.CART_PERSIST_ADD_ITEM,
    payload: {
        datasetID
    }
});

export const cartPersistRemoveItem = (datasetID) => ({
    type: userActionTypes.CART_PERSIST_REMOVE_ITEM,
    payload: {
        datasetID
    }
});

export const cartPersistClear = () => ({
    type: userActionTypes.CART_PERSIST_CLEAR
});

export const cartGetAndStore = () => ({
    type: userActionTypes.CART_GET_AND_STORE
});