// Default configuration values for dropbox feature
export const DEFAULT_PAGE_SIZE = 25;
export const DEFAULT_CURRENT_PAGE = 1;

export const PAGE_SIZE_OPTIONS = [25, 50, 100, 250];

// File selection limits
export const MAX_FILES_LIMIT = 400;
export const MAX_SIZE_LIMIT_BYTES = 2 * 1024 * 1024 * 1024; // 2GB in bytes

export const INITIAL_PAGINATION_STATE = {
  backend: {
    cursor: null,
    hasMore: false,
    chunkSize: null,
    isLoading: false,
  },
  local: {
    currentPage: DEFAULT_CURRENT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: null,
  },
  totalFileCount: null,
  allCachedFiles: [],
  currentPageFiles: [],
  error: null,
};