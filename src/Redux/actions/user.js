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
})

export const userLoginRequestClearError = () => ({
    type: userActionTypes.LOGIN_REQUEST_CLEAR_ERROR
})

// Log out actions
export const logOut = () => ({
    type:userActionTypes.LOG_OUT
});

export const destroyInfo = () => ({
    type: userActionTypes.DESTROY_INFO
})

export const loginDialogWasCleared = () => ({
    type: userActionTypes.LOGIN_DIALOG_WAS_CLEARED
})

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
})

export const userValidationRequestFailure = () => ({
    type: userActionTypes.VALIDATION_REQUEST_FAILURE
})

export const userValidationRequestSuccess = () => ({
    type: userActionTypes.VALIDATION_REQUEST_SUCCESS
})

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
})

export const keyRetrievalRequestSuccess = (keys) => ({
    type: userActionTypes.KEY_RETRIEVAL_REQUEST_SUCCESS,
    payload: {
        keys
    }
})

export const keyRetrievalRequestFailure = () => ({
    type: userActionTypes.KEY_RETRIEVAL_REQUEST_FAILURE
})

export const keyCreationRequestSend = (description) => ({
    type: userActionTypes.KEY_CREATION_REQUEST_SEND,
    payload: {
        description
    }
})

export const keyCreationRequestProcessing = () => ({
    type: userActionTypes.KEY_CREATION_REQUEST_PROCESSING
})

export const keyCreationRequestFailure = () => ({
    type: userActionTypes.KEY_CREATION_REQUEST_FAILURE
})

export const keyCreationRequestSuccess = () => ({
    type: userActionTypes.KEY_CREATION_REQUEST_SUCCESS
})

export const refreshLogin = () => ({
    type: userActionTypes.REFRESH_LOGIN
})