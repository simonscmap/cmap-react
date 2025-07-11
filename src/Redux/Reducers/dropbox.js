import {
  DOWNLOAD_DROPBOX_VAULT_FILES_REQUEST,
  DOWNLOAD_DROPBOX_VAULT_FILES_SUCCESS,
  DOWNLOAD_DROPBOX_VAULT_FILES_FAILURE,
  DOWNLOAD_DROPBOX_VAULT_FILES_CLEAR,
  FETCH_DROPBOX_VAULT_FILES_PAGE,
  FETCH_DROPBOX_VAULT_FILES_PAGE_SUCCESS,
  FETCH_DROPBOX_VAULT_FILES_PAGE_FAILURE,
  RESET_DROPBOX_VAULT_FILES_PAGINATION,
} from '../actionTypes/dropbox';

export default function dropboxReducer(state, action) {
  switch (action.type) {
    case DOWNLOAD_DROPBOX_VAULT_FILES_REQUEST:
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

    case DOWNLOAD_DROPBOX_VAULT_FILES_SUCCESS:
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

    case DOWNLOAD_DROPBOX_VAULT_FILES_FAILURE:
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

    case DOWNLOAD_DROPBOX_VAULT_FILES_CLEAR:
      return {
        ...state,
        dropbox: {
          ...state.dropbox,
          isLoading: false,
          success: false,
          error: null,
          downloadLink: null,
        },
      };

    // Vault Files Pagination
    case FETCH_DROPBOX_VAULT_FILES_PAGE:
      return {
        ...state,
        dropbox: {
          ...state.dropbox,
          vaultFilesPagination: {
            ...state.dropbox.vaultFilesPagination,
            isLoading: true,
          },
        },
      };

    case FETCH_DROPBOX_VAULT_FILES_PAGE_SUCCESS:
      return {
        ...state,
        download: {
          ...state.download,
          vaultLink: {
            ...state.download.vaultLink,
            files: action.payload.files,
          },
        },
        dropbox: {
          ...state.dropbox,
          vaultFilesPagination: {
            isLoading: false,
            page: action.payload.pagination.page,
            pageSize: action.payload.pagination.pageSize,
            hasMore: action.payload.pagination.hasMore,
            cursor: action.payload.pagination.cursor,
            totalCount: action.payload.pagination.totalCount,
            totalPages: action.payload.pagination.totalPages,
            error: null,
          },
        },
      };

    case FETCH_DROPBOX_VAULT_FILES_PAGE_FAILURE:
      return {
        ...state,
        dropbox: {
          ...state.dropbox,
          vaultFilesPagination: {
            ...state.dropbox.vaultFilesPagination,
            isLoading: false,
            error: action.payload.error,
          },
        },
      };

    case RESET_DROPBOX_VAULT_FILES_PAGINATION:
      return {
        ...state,
        dropbox: {
          ...state.dropbox,
          vaultFilesPagination: {
            isLoading: false,
            page: 1,
            pageSize: 25,
            hasMore: false,
            cursor: null,
            totalCount: null,
            totalPages: null,
            error: null,
          },
        },
      };

    default:
      return state;
  }
}
