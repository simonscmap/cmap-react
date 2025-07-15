// Pagination utility functions
export const calculatePaginationInfo = (totalCount, pageSize, currentPage) => {
  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : null;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    totalPages,
    startIndex,
    endIndex,
  };
};

export const shouldFetchMoreFiles = (
  currentPage,
  pageSize,
  cachedFileCount,
  totalFileCount,
  hasMore
) => {
  const requiredFiles = currentPage * pageSize;
  const hasEnoughCached = cachedFileCount >= requiredFiles || 
                         cachedFileCount >= totalFileCount;
  
  return !hasEnoughCached && hasMore;
};