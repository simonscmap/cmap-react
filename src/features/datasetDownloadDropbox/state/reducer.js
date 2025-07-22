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
  SET_CURRENT_FOLDER_TAB,
} from './actionTypes';

// Helper function to create initial pagination state for a folder
const createInitialFolderPaginationState = () => ({
  backend: {
    cursor: null,
    hasMore: false,
    chunkSize: null,
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
});

// Helper to ensure folder pagination exists
const ensureFolderPaginationExists = (paginationByFolder, folderType) => {
  if (!paginationByFolder[folderType]) {
    return {
      ...paginationByFolder,
      [folderType]: createInitialFolderPaginationState(),
    };
  }
  return paginationByFolder;
};

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
    case FETCH_DROPBOX_VAULT_FILES_PAGE: {
      const folderType = (action.payload.paginationParams && action.payload.paginationParams.folderType) || state.dropbox.currentTab || state.dropbox.mainFolder || 'rep';
      
      // Ensure folder pagination exists
      const paginationByFolder = ensureFolderPaginationExists(
        state.dropbox.paginationByFolder,
        folderType
      );
      
      // Update folder-specific state
      const updatedPaginationByFolder = {
        ...paginationByFolder,
        [folderType]: {
          ...paginationByFolder[folderType],
          backend: {
            ...paginationByFolder[folderType].backend,
            isLoading: true,
          },
        },
      };
      
      // Also update legacy structure for backward compatibility
      return {
        ...state,
        dropbox: {
          ...state.dropbox,
          paginationByFolder: updatedPaginationByFolder,
          vaultFilesPagination: {
            ...state.dropbox.vaultFilesPagination,
            backend: {
              ...state.dropbox.vaultFilesPagination.backend,
              isLoading: true,
            },
          },
        },
      };
    }

    case FETCH_DROPBOX_VAULT_FILES_PAGE_SUCCESS: {
      const newFiles = action.payload.files || [];
      const { availableFolders, mainFolder, folderType } = action.payload;
      
      // Determine which folder we're working with
      const activeFolder = folderType || state.dropbox.currentTab || mainFolder || 'rep';
      
      // Ensure folder pagination exists
      const paginationByFolder = ensureFolderPaginationExists(
        state.dropbox.paginationByFolder,
        activeFolder
      );
      const folderPagination = paginationByFolder[activeFolder];
      
      const isInitialRequest = !folderPagination.backend.cursor;
      
      // Accumulate files from all requests for this folder
      const allFiles = isInitialRequest
        ? newFiles
        : [...folderPagination.allCachedFiles, ...newFiles];

      // Sort all accumulated files
      const sortedAllFiles = allFiles.sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      // Preserve total count from initial request only
      const totalCount = isInitialRequest
        ? action.payload.pagination.totalCount
        : folderPagination.totalFileCount;

      // Calculate local pagination
      const pageSize = folderPagination.local.pageSize;
      const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : null;

      // If this was a cursor request (not initial), advance to next page
      let currentPage = folderPagination.local.currentPage;
      if (!isInitialRequest && newFiles.length > 0) {
        currentPage = currentPage + 1;
      }

      // Slice current page files
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const currentPageFiles = sortedAllFiles.slice(startIndex, endIndex);

      // Update folder-specific pagination
      const updatedPaginationByFolder = {
        ...paginationByFolder,
        [activeFolder]: {
          backend: {
            cursor: action.payload.pagination.cursor,
            hasMore: action.payload.pagination.hasMore,
            chunkSize: action.payload.pagination.chunkSize,
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
      };

      // Also update legacy structure for current tab
      const legacyPagination = activeFolder === (state.dropbox.currentTab || state.dropbox.mainFolder)
        ? updatedPaginationByFolder[activeFolder]
        : state.dropbox.vaultFilesPagination;

      return {
        ...state,
        dropbox: {
          ...state.dropbox,
          // Update folder metadata
          availableFolders: availableFolders || state.dropbox.availableFolders,
          mainFolder: mainFolder || state.dropbox.mainFolder,
          currentTab: activeFolder,
          // Update folder-specific pagination
          paginationByFolder: updatedPaginationByFolder,
          // Update legacy structure for backward compatibility
          vaultFilesPagination: {
            backend: legacyPagination.backend,
            local: legacyPagination.local,
            totalFileCount: legacyPagination.totalFileCount,
            allCachedFiles: legacyPagination.allCachedFiles,
            currentPageFiles: legacyPagination.currentPageFiles,
            error: null,
          },
        },
      };
    }

    case FETCH_DROPBOX_VAULT_FILES_PAGE_FAILURE: {
      const folderType = action.payload.folderType || state.dropbox.currentTab || state.dropbox.mainFolder || 'rep';
      
      // Ensure folder pagination exists
      const paginationByFolder = ensureFolderPaginationExists(
        state.dropbox.paginationByFolder,
        folderType
      );
      
      // Update folder-specific state
      const updatedPaginationByFolder = {
        ...paginationByFolder,
        [folderType]: {
          ...paginationByFolder[folderType],
          backend: {
            ...paginationByFolder[folderType].backend,
            isLoading: false,
          },
          error: action.payload.error,
        },
      };
      
      return {
        ...state,
        dropbox: {
          ...state.dropbox,
          paginationByFolder: updatedPaginationByFolder,
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
    }

    case RESET_DROPBOX_VAULT_FILES_PAGINATION: {
      return {
        ...state,
        dropbox: {
          ...state.dropbox,
          // Reset folder fields to defaults
          availableFolders: { hasRep: false, hasNrt: false, hasRaw: false },
          mainFolder: null,
          currentTab: null,
          // Reset all folder-specific pagination to empty object
          paginationByFolder: {},
          // Reset legacy pagination
          vaultFilesPagination: createInitialFolderPaginationState(),
        },
      };
    }

    case SET_LOCAL_PAGINATION_PAGE: {
      const newPage = action.payload.page;
      const folderType = action.payload.folderType || state.dropbox.currentTab || state.dropbox.mainFolder || 'rep';
      
      // Ensure folder pagination exists
      const paginationByFolder = ensureFolderPaginationExists(
        state.dropbox.paginationByFolder,
        folderType
      );
      const folderPagination = paginationByFolder[folderType];
      
      const currentPageSize = folderPagination.local.pageSize;
      const cachedFiles = folderPagination.allCachedFiles;

      // Calculate slice for new page
      const pageStartIndex = (newPage - 1) * currentPageSize;
      const pageEndIndex = pageStartIndex + currentPageSize;
      const newCurrentPageFiles = cachedFiles.slice(
        pageStartIndex,
        pageEndIndex,
      );

      // Update folder-specific pagination
      const updatedPaginationByFolder = {
        ...paginationByFolder,
        [folderType]: {
          ...folderPagination,
          local: {
            ...folderPagination.local,
            currentPage: newPage,
          },
          currentPageFiles: newCurrentPageFiles,
        },
      };

      // Update legacy structure if this is the current tab
      const updateLegacy = folderType === (state.dropbox.currentTab || state.dropbox.mainFolder);

      return {
        ...state,
        dropbox: {
          ...state.dropbox,
          paginationByFolder: updatedPaginationByFolder,
          vaultFilesPagination: updateLegacy ? {
            ...state.dropbox.vaultFilesPagination,
            local: {
              ...state.dropbox.vaultFilesPagination.local,
              currentPage: newPage,
            },
            currentPageFiles: newCurrentPageFiles,
          } : state.dropbox.vaultFilesPagination,
        },
      };
    }

    case SET_LOCAL_PAGINATION_SIZE: {
      const newPageSize = action.payload.pageSize;
      const folderType = action.payload.folderType || state.dropbox.currentTab || state.dropbox.mainFolder || 'rep';
      
      // Ensure folder pagination exists
      const paginationByFolder = ensureFolderPaginationExists(
        state.dropbox.paginationByFolder,
        folderType
      );
      const folderPagination = paginationByFolder[folderType];
      
      const totalFileCount = folderPagination.totalFileCount;
      const newTotalPages = totalFileCount
        ? Math.ceil(totalFileCount / newPageSize)
        : null;
      const allCachedFiles = folderPagination.allCachedFiles;

      // Reset to page 1 with new page size
      const newStartIndex = 0;
      const newEndIndex = newPageSize;
      const newPageFiles = allCachedFiles.slice(newStartIndex, newEndIndex);

      // Update folder-specific pagination
      const updatedPaginationByFolder = {
        ...paginationByFolder,
        [folderType]: {
          ...folderPagination,
          local: {
            currentPage: 1,
            pageSize: newPageSize,
            totalPages: newTotalPages,
          },
          currentPageFiles: newPageFiles,
        },
      };

      // Update legacy structure if this is the current tab
      const updateLegacy = folderType === (state.dropbox.currentTab || state.dropbox.mainFolder);

      return {
        ...state,
        dropbox: {
          ...state.dropbox,
          paginationByFolder: updatedPaginationByFolder,
          vaultFilesPagination: updateLegacy ? {
            ...state.dropbox.vaultFilesPagination,
            local: {
              currentPage: 1,
              pageSize: newPageSize,
              totalPages: newTotalPages,
            },
            currentPageFiles: newPageFiles,
          } : state.dropbox.vaultFilesPagination,
        },
      };
    }

    case SET_CURRENT_FOLDER_TAB: {
      const { folderType } = action.payload;
      
      // Get the pagination for the new tab (if it exists)
      const folderPagination = state.dropbox.paginationByFolder[folderType];
      
      return {
        ...state,
        dropbox: {
          ...state.dropbox,
          currentTab: folderType,
          // Update legacy pagination to match the current tab (if folder pagination exists)
          vaultFilesPagination: folderPagination || state.dropbox.vaultFilesPagination,
        },
      };
    }

    default:
      return state;
  }
}