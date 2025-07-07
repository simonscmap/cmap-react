import {
  DROPBOX_FILES_DOWNLOAD_REQUEST,
  DROPBOX_FILES_DOWNLOAD_SUCCESS,
  DROPBOX_FILES_DOWNLOAD_FAILURE,
} from '../actionTypes/dropbox';

const initialState = {
  isLoading: false,
  success: false,
  error: null,
  downloadLink: null,
};

export default function dropboxReducer(state, action) {
  switch (action.type) {
    case DROPBOX_FILES_DOWNLOAD_REQUEST:
      console.log('🐛🐛🐛 dropbox.js:17 action:', action);
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
      console.log('🐛🐛🐛 dropbox.js:27 SUCCESS action:', action);
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

    default:
      return state;
  }
}
