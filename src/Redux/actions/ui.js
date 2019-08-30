import * as interfaceActionTypes from '../actionTypes/ui';

export const showLoginDialog = () => ({
    type: interfaceActionTypes.INTERFACE_SHOW_LOGIN_DIALOG
})

export const hideLoginDialog = () => ({
    type: interfaceActionTypes.INTERFACE_HIDE_LOGIN_DIALOG
})

export const registrationNextActiveStep = () => ({
    type: interfaceActionTypes.REGISTRATION_NEXT_ACTIVE_STEP
})

export const registrationPreviousActiveStep = () => ({
    type: interfaceActionTypes.REGISTRATION_PREVIOUS_ACTIVE_STEP
})

export const restoreInterfaceDefaults = () => ({
    type: interfaceActionTypes.RESTORE_INTERFACE_DEFAULTS
})

export const snackbarOpen = (message) => ({
    type: interfaceActionTypes.SNACKBAR_OPEN,
    payload:
    {
        message
    }
})

export const snackbarClose = () => ({
    type: interfaceActionTypes.SNACKBAR_CLOSE
})