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
  SET_SEARCH_QUERY,
  SET_SEARCH_RESULTS,
  CLEAR_SEARCH,
  SET_SEARCH_ACTIVE,
  SET_FUZZY_SEARCH_ENABLED,
  SET_SEARCH_ENGINE,
} from './actionTypes';
import { SEARCH_ENGINES } from '../constants/searchConstants';

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
  // Search state extension - now per folder like pagination
  searchByFolder: {
    // Structure: { [folderType]: searchState } where folderType can be 'rep', 'nrt', or 'raw'
    // UI shows 2 tabs: Main Files (rep/nrt) and Raw Files (raw), each with separate search state
  },
};

// Helper function to create initial search state for a folder
const createInitialFolderSearchState = () => ({
  isActive: false, // Whether search mode is enabled
  query: '', // Current search query
  filteredFiles: [], // Files matching search query
  highlightMatches: [], // Match data for highlighting
  searchStartTime: null, // Performance tracking
  lastSearchDuration: null,
  useFuzzySearch: false, // Whether to use fuzzy search configuration (deprecated)
  searchEngine: SEARCH_ENGINES.WILDCARD, // Current search engine (wildcard by default)
});

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

// Helper to ensure folder search state exists
const ensureFolderSearchExists = (searchByFolder, folderType) => {
  if (!searchByFolder[folderType]) {
    return {
      ...searchByFolder,
      [folderType]: createInitialFolderSearchState(),
    };
  }
  return searchByFolder;
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
        // Reset all folder-specific search states
        searchByFolder: {},
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

      // Check if this is a search context or regular folder
      const isSearchContext =
        folderType === 'main-search' || folderType === 'raw-search';

      // Ensure folder pagination exists (works for both search and regular contexts)
      const paginationByFolder = isSearchContext
        ? dropboxState.paginationByFolder
        : ensureFolderPaginationExists(
            dropboxState.paginationByFolder,
            folderType,
          );

      const folderPagination = paginationByFolder[folderType];

      // If context doesn't exist, return unchanged state
      if (!folderPagination) {
        return dropboxState;
      }

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

      // Update legacy structure if this is the current tab (not for search contexts)
      const updateLegacy =
        !isSearchContext &&
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

      // Check if this is a search context or regular folder
      const isSearchContext =
        folderType === 'main-search' || folderType === 'raw-search';

      // Ensure folder pagination exists (works for both search and regular contexts)
      const paginationByFolder = isSearchContext
        ? dropboxState.paginationByFolder
        : ensureFolderPaginationExists(
            dropboxState.paginationByFolder,
            folderType,
          );

      const folderPagination = paginationByFolder[folderType];

      // If context doesn't exist, return unchanged state
      if (!folderPagination) {
        return dropboxState;
      }

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

      // Update legacy structure if this is the current tab (not for search contexts)
      const updateLegacy =
        !isSearchContext &&
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

    // Search state handlers
    case SET_SEARCH_QUERY: {
      const { query, timestamp, folderType } = action.payload;
      const activeFolder = folderType || dropboxState.currentTab || 'rep';

      // Ensure folder search exists
      const searchByFolder = ensureFolderSearchExists(
        dropboxState.searchByFolder,
        activeFolder,
      );

      return {
        ...dropboxState,
        searchByFolder: {
          ...searchByFolder,
          [activeFolder]: {
            ...searchByFolder[activeFolder],
            query,
            isActive: query.length > 0,
            searchStartTime: timestamp,
            // Clear previous results when query changes
            filteredFiles:
              query.length === 0
                ? []
                : searchByFolder[activeFolder].filteredFiles,
            highlightMatches:
              query.length === 0
                ? []
                : searchByFolder[activeFolder].highlightMatches,
          },
        },
      };
    }

    case SET_SEARCH_RESULTS: {
      const { filteredFiles, highlightMatches, searchDuration, folderType } =
        action.payload;
      const activeFolder = folderType || dropboxState.currentTab || 'rep';

      // Ensure folder search exists
      const searchByFolder = ensureFolderSearchExists(
        dropboxState.searchByFolder,
        activeFolder,
      );

      // Determine search context key based on active folder/tab
      const searchContextKey =
        activeFolder === 'raw' ? 'raw-search' : 'main-search';

      // Calculate pagination for search results
      const pageSize = 25; // Use default page size
      const totalFileCount = filteredFiles.length;
      const totalPages = Math.ceil(totalFileCount / pageSize);
      const currentPageFiles = filteredFiles.slice(0, pageSize);

      // Create search pagination context
      const searchPaginationState = {
        local: {
          currentPage: 1,
          pageSize,
          totalPages,
        },
        backend: {
          cursor: null,
          hasMore: false, // Search results are complete
          chunkSize: null,
          isLoading: false,
        },
        totalFileCount,
        allCachedFiles: filteredFiles,
        currentPageFiles,
        error: null,
      };

      return {
        ...dropboxState,
        searchByFolder: {
          ...searchByFolder,
          [activeFolder]: {
            ...searchByFolder[activeFolder],
            filteredFiles,
            highlightMatches,
            lastSearchDuration: searchDuration,
          },
        },
        // Add search pagination context
        paginationByFolder: {
          ...dropboxState.paginationByFolder,
          [searchContextKey]: searchPaginationState,
        },
      };
    }

    case CLEAR_SEARCH: {
      const { folderType } = action.payload || {};
      const activeFolder = folderType || dropboxState.currentTab || 'rep';

      // Ensure folder search exists
      const searchByFolder = ensureFolderSearchExists(
        dropboxState.searchByFolder,
        activeFolder,
      );

      // Determine search context key to clean up
      const searchContextKey =
        activeFolder === 'raw' ? 'raw-search' : 'main-search';

      // Remove the search pagination context
      const { [searchContextKey]: removed, ...remainingPagination } =
        dropboxState.paginationByFolder;

      return {
        ...dropboxState,
        searchByFolder: {
          ...searchByFolder,
          [activeFolder]: {
            ...searchByFolder[activeFolder],
            isActive: false,
            query: '',
            filteredFiles: [],
            highlightMatches: [],
            searchStartTime: null,
            lastSearchDuration: null,
            useFuzzySearch: false, // Reset fuzzy search to default
            searchEngine: SEARCH_ENGINES.WILDCARD, // Reset to default engine
          },
        },
        // Clean up search pagination context
        paginationByFolder: remainingPagination,
      };
    }

    case SET_SEARCH_ACTIVE: {
      const { isActive, folderType } = action.payload;
      const activeFolder = folderType || dropboxState.currentTab || 'rep';

      // Ensure folder search exists
      const searchByFolder = ensureFolderSearchExists(
        dropboxState.searchByFolder,
        activeFolder,
      );

      return {
        ...dropboxState,
        searchByFolder: {
          ...searchByFolder,
          [activeFolder]: {
            ...searchByFolder[activeFolder],
            isActive,
          },
        },
      };
    }

    case SET_FUZZY_SEARCH_ENABLED: {
      const { enabled, folderType } = action.payload;
      const activeFolder = folderType || dropboxState.currentTab || 'rep';

      // Ensure folder search exists
      const searchByFolder = ensureFolderSearchExists(
        dropboxState.searchByFolder,
        activeFolder,
      );

      // Convert the legacy useFuzzySearch boolean to new engine type
      const searchEngine = enabled
        ? SEARCH_ENGINES.FUZZY
        : SEARCH_ENGINES.WILDCARD;

      return {
        ...dropboxState,
        searchByFolder: {
          ...searchByFolder,
          [activeFolder]: {
            ...searchByFolder[activeFolder],
            useFuzzySearch: enabled, // Keep for backward compatibility
            searchEngine, // New engine selection
          },
        },
      };
    }

    case SET_SEARCH_ENGINE: {
      const { engine, folderType } = action.payload;
      const activeFolder = folderType || dropboxState.currentTab || 'rep';

      // Ensure folder search exists
      const searchByFolder = ensureFolderSearchExists(
        dropboxState.searchByFolder,
        activeFolder,
      );

      // Update legacy useFuzzySearch for backward compatibility
      const useFuzzySearch = engine === SEARCH_ENGINES.FUZZY;

      return {
        ...dropboxState,
        searchByFolder: {
          ...searchByFolder,
          [activeFolder]: {
            ...searchByFolder[activeFolder],
            searchEngine: engine,
            useFuzzySearch, // Keep for backward compatibility
          },
        },
      };
    }

    default:
      return dropboxState;
  }
}

export { initialDropboxState };
