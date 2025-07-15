import {
  DOWNLOAD_DROPBOX_VAULT_FILES_REQUEST,
  DOWNLOAD_DROPBOX_VAULT_FILES_SUCCESS,
  DOWNLOAD_DROPBOX_VAULT_FILES_FAILURE,
  DOWNLOAD_DROPBOX_VAULT_FILES_CLEAR,
  FETCH_DROPBOX_VAULT_FILES_PAGE,
  FETCH_DROPBOX_VAULT_FILES_PAGE_SUCCESS,
  FETCH_DROPBOX_VAULT_FILES_PAGE_FAILURE,
  RESET_DROPBOX_VAULT_FILES_PAGINATION,
  SET_LOCAL_PAGINATION_PAGE,
  SET_LOCAL_PAGINATION_SIZE,
} from './actionTypes';

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
            backend: {
              ...state.dropbox.vaultFilesPagination.backend,
              isLoading: true,
            },
          },
        },
      };

    case FETCH_DROPBOX_VAULT_FILES_PAGE_SUCCESS: {
      const newFiles = action.payload.files || [];
      const isInitialRequest =
        !state.dropbox.vaultFilesPagination.backend.cursor;
      // Accumulate files from all requests
      const allFiles = isInitialRequest
        ? newFiles
        : [...state.dropbox.vaultFilesPagination.allCachedFiles, ...newFiles];

      // Sort all accumulated files
      const sortedAllFiles = allFiles.sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      // Preserve total count from initial request only
      const totalCount = isInitialRequest
        ? action.payload.pagination.totalCount
        : state.dropbox.vaultFilesPagination.totalFileCount;

      // Calculate local pagination
      const pageSize = state.dropbox.vaultFilesPagination.local.pageSize;
      const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : null;

      // If this was a cursor request (not initial), advance to next page
      let currentPage = state.dropbox.vaultFilesPagination.local.currentPage;
      if (!isInitialRequest && newFiles.length > 0) {
        currentPage = currentPage + 1;
      }

      // Slice current page files
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const currentPageFiles = sortedAllFiles.slice(startIndex, endIndex);

      return {
        ...state,
        dropbox: {
          ...state.dropbox,
          vaultFilesPagination: {
            backend: {
              cursor: action.payload.pagination.cursor,
              hasMore: action.payload.pagination.hasMore,
              chunkSize: action.payload.pagination.pageSize || 200,
              isLoading: false,
            },
            local: {
              currentPage,
              pageSize,
              totalPages,
            },
            totalFileCount: totalCount,
            allCachedFiles: sortedAllFiles,
            currentPageFiles,
            error: null,
          },
        },
      };
    }

    case FETCH_DROPBOX_VAULT_FILES_PAGE_FAILURE:
      return {
        ...state,
        dropbox: {
          ...state.dropbox,
          vaultFilesPagination: {
            ...state.dropbox.vaultFilesPagination,
            backend: {
              ...state.dropbox.vaultFilesPagination.backend,
              isLoading: false,
            },
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
            backend: {
              cursor: null,
              hasMore: false,
              chunkSize: 200,
              isLoading: false,
            },
            local: {
              currentPage: 1,
              pageSize: 25,
              totalPages: null,
            },
            totalFileCount: null,
            allCachedFiles: [],
            currentPageFiles: [],
            error: null,
          },
        },
      };

    case SET_LOCAL_PAGINATION_PAGE: {
      const newPage = action.payload.page;
      const currentPageSize = state.dropbox.vaultFilesPagination.local.pageSize;
      const cachedFiles = state.dropbox.vaultFilesPagination.allCachedFiles;

      // Calculate slice for new page
      const pageStartIndex = (newPage - 1) * currentPageSize;
      const pageEndIndex = pageStartIndex + currentPageSize;
      const newCurrentPageFiles = cachedFiles.slice(
        pageStartIndex,
        pageEndIndex,
      );

      return {
        ...state,
        dropbox: {
          ...state.dropbox,
          vaultFilesPagination: {
            ...state.dropbox.vaultFilesPagination,
            local: {
              ...state.dropbox.vaultFilesPagination.local,
              currentPage: newPage,
            },
            currentPageFiles: newCurrentPageFiles,
          },
        },
      };
    }

    case SET_LOCAL_PAGINATION_SIZE: {
      const newPageSize = action.payload.pageSize;
      const totalFileCount = state.dropbox.vaultFilesPagination.totalFileCount;
      const newTotalPages = totalFileCount
        ? Math.ceil(totalFileCount / newPageSize)
        : null;
      const allCachedFiles = state.dropbox.vaultFilesPagination.allCachedFiles;

      // Reset to page 1 with new page size
      const newStartIndex = 0;
      const newEndIndex = newPageSize;
      const newPageFiles = allCachedFiles.slice(newStartIndex, newEndIndex);

      return {
        ...state,
        dropbox: {
          ...state.dropbox,
          vaultFilesPagination: {
            ...state.dropbox.vaultFilesPagination,
            local: {
              currentPage: 1,
              pageSize: newPageSize,
              totalPages: newTotalPages,
            },
            currentPageFiles: newPageFiles,
          },
        },
      };
    }

    default:
      return state;
  }
}