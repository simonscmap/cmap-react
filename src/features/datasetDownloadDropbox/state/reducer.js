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
  SET_AUTO_DOWNLOAD_ELIGIBILITY,
  TRIGGER_DIRECT_DOWNLOAD,
} from './actionTypes';

// Dropbox slice initial state - extracted from main initialState object
const initialDropboxState = {
  isLoading: false,
  success: false,
  error: null,
  downloadLink: null,
  autoDownloadEligible: false,
  directDownloadLink: null,
  availableFolders: { hasRep: false, hasNrt: false, hasRaw: false },
  mainFolder: null,
  currentTab: null,
  paginationByFolder: {},
  vaultFilesPagination: {
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
  },
};

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

export default function dropboxReducer(
  dropboxState = initialDropboxState,
  action,
) {
  switch (action.type) {
    case DOWNLOAD_DROPBOX_VAULT_FILES_REQUEST:
      return {
        ...dropboxState,
        isLoading: true,
        error: null,
        success: false,
        downloadLink: null,
      };

    case DOWNLOAD_DROPBOX_VAULT_FILES_SUCCESS:
      return {
        ...dropboxState,
        isLoading: false,
        success: true,
        downloadLink: action.payload.downloadLink,
        error: null,
      };

    case DOWNLOAD_DROPBOX_VAULT_FILES_FAILURE:
      return {
        ...dropboxState,
        isLoading: false,
        success: false,
        error: action.payload.error,
        downloadLink: null,
      };

    case DOWNLOAD_DROPBOX_VAULT_FILES_CLEAR:
      return {
        ...dropboxState,
        isLoading: false,
        success: false,
        error: null,
        downloadLink: null,
      };

    // Vault Files Pagination
    case FETCH_DROPBOX_VAULT_FILES_PAGE: {
      const folderType =
        (action.payload.paginationParams &&
          action.payload.paginationParams.folderType) ||
        dropboxState.currentTab ||
        dropboxState.mainFolder ||
        'rep';

      // Ensure folder pagination exists
      const paginationByFolder = ensureFolderPaginationExists(
        dropboxState.paginationByFolder,
        folderType,
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
        ...dropboxState,
        paginationByFolder: updatedPaginationByFolder,
        vaultFilesPagination: {
          ...dropboxState.vaultFilesPagination,
          backend: {
            ...dropboxState.vaultFilesPagination.backend,
            isLoading: true,
          },
        },
      };
    }

    case FETCH_DROPBOX_VAULT_FILES_PAGE_SUCCESS: {
      const newFiles = action.payload.files || [];
      const { availableFolders, mainFolder, folderType } = action.payload;

      // Determine which folder we're working with
      const activeFolder =
        folderType || dropboxState.currentTab || mainFolder || 'rep';

      // Ensure folder pagination exists
      const paginationByFolder = ensureFolderPaginationExists(
        dropboxState.paginationByFolder,
        activeFolder,
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
      const legacyPagination =
        activeFolder === (dropboxState.currentTab || dropboxState.mainFolder)
          ? updatedPaginationByFolder[activeFolder]
          : dropboxState.vaultFilesPagination;

      return {
        ...dropboxState,
        // Update folder metadata
        availableFolders: availableFolders || dropboxState.availableFolders,
        mainFolder: mainFolder || dropboxState.mainFolder,
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
      };
    }

    case FETCH_DROPBOX_VAULT_FILES_PAGE_FAILURE: {
      const folderType =
        action.payload.folderType ||
        dropboxState.currentTab ||
        dropboxState.mainFolder ||
        'rep';

      // Ensure folder pagination exists
      const paginationByFolder = ensureFolderPaginationExists(
        dropboxState.paginationByFolder,
        folderType,
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
        ...dropboxState,
        paginationByFolder: updatedPaginationByFolder,
        vaultFilesPagination: {
          ...dropboxState.vaultFilesPagination,
          backend: {
            ...dropboxState.vaultFilesPagination.backend,
            isLoading: false,
          },
          error: action.payload.error,
        },
      };
    }

    case RESET_DROPBOX_VAULT_FILES_PAGINATION: {
      return {
        ...dropboxState,
        // Reset folder fields to defaults
        availableFolders: { hasRep: false, hasNrt: false, hasRaw: false },
        mainFolder: null,
        currentTab: null,
        // Reset all folder-specific pagination to empty object
        paginationByFolder: {},
        // Reset legacy pagination
        vaultFilesPagination: createInitialFolderPaginationState(),
        // Clear auto-download state
        autoDownloadEligible: false,
        directDownloadLink: null,
      };
    }

    case SET_LOCAL_PAGINATION_PAGE: {
      const newPage = action.payload.page;
      const folderType =
        action.payload.folderType ||
        dropboxState.currentTab ||
        dropboxState.mainFolder ||
        'rep';

      // Ensure folder pagination exists
      const paginationByFolder = ensureFolderPaginationExists(
        dropboxState.paginationByFolder,
        folderType,
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
      const updateLegacy =
        folderType === (dropboxState.currentTab || dropboxState.mainFolder);

      return {
        ...dropboxState,
        paginationByFolder: updatedPaginationByFolder,
        vaultFilesPagination: updateLegacy
          ? {
              ...dropboxState.vaultFilesPagination,
              local: {
                ...dropboxState.vaultFilesPagination.local,
                currentPage: newPage,
              },
              currentPageFiles: newCurrentPageFiles,
            }
          : dropboxState.vaultFilesPagination,
      };
    }

    case SET_LOCAL_PAGINATION_SIZE: {
      const newPageSize = action.payload.pageSize;
      const folderType =
        action.payload.folderType ||
        dropboxState.currentTab ||
        dropboxState.mainFolder ||
        'rep';

      // Ensure folder pagination exists
      const paginationByFolder = ensureFolderPaginationExists(
        dropboxState.paginationByFolder,
        folderType,
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
      const updateLegacy =
        folderType === (dropboxState.currentTab || dropboxState.mainFolder);

      return {
        ...dropboxState,
        paginationByFolder: updatedPaginationByFolder,
        vaultFilesPagination: updateLegacy
          ? {
              ...dropboxState.vaultFilesPagination,
              local: {
                currentPage: 1,
                pageSize: newPageSize,
                totalPages: newTotalPages,
              },
              currentPageFiles: newPageFiles,
            }
          : dropboxState.vaultFilesPagination,
      };
    }

    case SET_CURRENT_FOLDER_TAB: {
      const { folderType } = action.payload;

      // Get the pagination for the new tab (if it exists)
      const folderPagination = dropboxState.paginationByFolder[folderType];

      return {
        ...dropboxState,
        currentTab: folderType,
        // Update legacy pagination to match the current tab (if folder pagination exists)
        vaultFilesPagination:
          folderPagination || dropboxState.vaultFilesPagination,
      };
    }

    case SET_AUTO_DOWNLOAD_ELIGIBILITY: {
      const { autoDownloadEligible, directDownloadLink } = action.payload;

      return {
        ...dropboxState,
        autoDownloadEligible,
        directDownloadLink,
      };
    }

    case TRIGGER_DIRECT_DOWNLOAD: {
      // This action triggers a direct download via window.location.href
      // The reducer doesn't need to modify state, but can track the action
      return {
        ...dropboxState,
        lastDirectDownloadTriggered: action.payload.downloadLink,
      };
    }

    default:
      return dropboxState;
  }
}

export { initialDropboxState };
