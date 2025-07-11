import {
  DROPBOX_FILES_DOWNLOAD_REQUEST,
  DROPBOX_FILES_DOWNLOAD_SUCCESS,
  DROPBOX_FILES_DOWNLOAD_FAILURE,
  DROPBOX_FILES_DOWNLOAD_CLEAR,
} from '../actionTypes/dropbox';

export default function dropboxReducer(state, action) {
  switch (action.type) {
    case DROPBOX_FILES_DOWNLOAD_REQUEST:
      return {
        ...state,
        dropbox: {
          ...state.dropbox,
          isLoading: true,
          error: null,
          success: false,
          downloadLink: null,
        },
      };

    case DROPBOX_FILES_DOWNLOAD_SUCCESS:
      return {
        ...state,
        dropbox: {
          ...state.dropbox,
          isLoading: false,
          success: true,
          downloadLink: action.payload.downloadLink,
          error: null,
        },
      };

    case DROPBOX_FILES_DOWNLOAD_FAILURE:
      return {
        ...state,
        dropbox: {
          ...state.dropbox,
          isLoading: false,
          success: false,
          error: action.payload.error,
          downloadLink: null,
        },
      };

    case DROPBOX_FILES_DOWNLOAD_CLEAR:
      return {
        ...state,
        dropbox: {
          isLoading: false,
          success: false,
          error: null,
          downloadLink: null,
        },
      };

    default:
      return state;
  }
}
