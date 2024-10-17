import * as interfaceActionTypes from '../actionTypes/ui';

export const showLoginDialog = () => ({
  type: interfaceActionTypes.INTERFACE_SHOW_LOGIN_DIALOG,
});

export const hideLoginDialog = () => ({
  type: interfaceActionTypes.INTERFACE_HIDE_LOGIN_DIALOG,
});

export const registrationNextActiveStep = () => ({
  type: interfaceActionTypes.REGISTRATION_NEXT_ACTIVE_STEP,
});

export const registrationPreviousActiveStep = () => ({
  type: interfaceActionTypes.REGISTRATION_PREVIOUS_ACTIVE_STEP,
});

export const restoreInterfaceDefaults = () => ({
  type: interfaceActionTypes.RESTORE_INTERFACE_DEFAULTS,
});

// TODO consider ability to forward a secondary/followup action
// e.g. a "click for more info" or "report this error"
export const snackbarOpen = (message, meta) => {
  return ({
    type: interfaceActionTypes.SNACKBAR_OPEN,
    payload: {
      message,
      meta,
    }
  });
};

export const snackbarClose = () => ({
  type: interfaceActionTypes.SNACKBAR_CLOSE,
});

export const setLoadingMessage = (message, meta) => {
  return ({
    type: interfaceActionTypes.SET_LOADING_MESSAGE,
    payload: {
      message,
      meta,
    }
  });
};

export const toggleShowHelp = () => ({
  type: interfaceActionTypes.TOGGLE_SHOW_HELP,
});

export const showChangePasswordDialog = () => ({
  type: interfaceActionTypes.SHOW_CHANGE_PASSWORD_DIALOG,
});

export const hideChangePasswordDialog = () => ({
  type: interfaceActionTypes.HIDE_CHANGE_PASSWORD_DIALOG,
});

export const showChangeEmailDialog = () => ({
  type: interfaceActionTypes.SHOW_CHANGE_EMAIL_DIALOG,
});

export const hideChangeEmailDialog = () => ({
  type: interfaceActionTypes.HIDE_CHANGE_EMAIL_DIALOG,
});

export const copyTextToClipboard = (text) => ({
  type: interfaceActionTypes.COPY_TEXT_TO_CLIPBOARD,
  payload: {
    text,
  },
});

export const windowResize = (height, width) => ({
  type: interfaceActionTypes.WINDOW_RESIZE,
  payload: {
    height,
    width,
  },
});

export const subscribeDatasetDialogOpen = (shortName) => ({
  type: interfaceActionTypes.SUBSCRIBE_DATASET_DIALOG_OPEN,
  payload: {
    shortName
  }
});

export const subscribeDatasetDialogClear = () => ({
  type: interfaceActionTypes.SUBSCRIBE_DATASET_DIALOG_CLEAR,
});

export const downloadDialogOpen = (shortName) => ({
  type: interfaceActionTypes.DOWNLOAD_DIALOG_OPEN,
  payload: {
    shortName,
  }
});

export const downloadDialogClear = () => ({
  type: interfaceActionTypes.DOWNLOAD_DIALOG_CLEAR,
});

export const setDownloadDialogData = (data) => ({
  type: interfaceActionTypes.SET_DOWNLOAD_DIALOG_DATA,
  payload: data
});

export const setFetchDownloadDialogDataRequestState = (status) => ({
  type: interfaceActionTypes.SET_FETCH_DOWNLAD_DIALOG_DATA_REQUEST_STATE,
  payload: status,
})

export const setSubscribeIntroState = (trueFalse) => ({
  type: interfaceActionTypes.SET_SUBSCRIBE_INTRO_STATE,
  payload: trueFalse,
})
