/**
 * usePagination Hook
 *
 * A reusable pagination hook that manages pagination state and provides
 * paginated data slices. Eliminates the need for store-based pagination
 * boilerplate by encapsulating all pagination logic.
 *
 * USAGE:
 * ```jsx
 * const { paginatedData, paginationProps } = usePagination({
 *   data: filteredUserCollections,
 *   itemsPerPage: 9
 * });
 *
 * // Render paginated data
 * {paginatedData.map(item => <Component key={item.id} item={item} />)}
 *
 * // Render pagination controls
 * {paginationProps.shouldShow && <Pagination {...paginationProps} />}
 * ```
 *
 * FEATURES:
 * - Auto-resets to page 1 when data changes
 * - Handles edge cases (empty data, invalid pages)
 * - Isolated state per hook instance
 * - Smart page correction when data shrinks
 * - Minimal prop interface for UI components
 */

import { useState, useEffect, useMemo } from 'react';

/**
 * @param {Object} options
 * @param {Array} options.data - Array of data to paginate
 * @param {number} [options.itemsPerPage=10] - Items per page
 * @returns {Object} { paginatedData, paginationProps }
 */
const usePagination = ({ data, itemsPerPage = 10 }) => {
  // Validate and normalize itemsPerPage
  const validItemsPerPage = itemsPerPage > 0 ? itemsPerPage : 10;

  // Internal pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.ceil(data.length / validItemsPerPage);
  }, [data, validItemsPerPage]);

  // Auto-reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Smart page correction when current page exceeds available pages
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Calculate paginated data slice
  const paginatedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const startIndex = (currentPage - 1) * validItemsPerPage;
    const endIndex = startIndex + validItemsPerPage;

    return data.slice(startIndex, endIndex);
  }, [data, currentPage, validItemsPerPage]);

  // Page change handler
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // Pagination props for UI component
  const paginationProps = useMemo(
    () => ({
      count: totalPages,
      page: currentPage,
      onChange: handlePageChange,
      shouldShow: totalPages > 1,
    }),
    [totalPages, currentPage],
  );

  return {
    paginatedData,
    paginationProps,
  };
};

export default usePagination;
