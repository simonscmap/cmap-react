/**
 * Pagination Component
 *
 * A reusable pagination component that wraps Material-UI's Pagination component
 * with project-specific defaults and simplified API for state management.
 *
 * USAGE EXAMPLES:
 *
 * Basic usage:
 * ```jsx
 * <Pagination
 *   totalItems={247}
 *   itemsPerPage={9}
 *   onPageChange={(page, startIndex, endIndex) => {
 *     // Update your state/store with the new page
 *     console.log(`Page ${page}: items ${startIndex}-${endIndex}`);
 *   }}
 * />
 * ```
 *
 * With external page control:
 * ```jsx
 * <Pagination
 *   totalItems={collections.length}
 *   itemsPerPage={12}
 *   currentPage={pagination.page}
 *   onPageChange={(page, startIndex, endIndex) => {
 *     setPagination({ ...pagination, page });
 *   }}
 * />
 * ```
 *
 * With reset trigger (resets to page 1 when search changes):
 * ```jsx
 * <Pagination
 *   totalItems={filteredResults.length}
 *   itemsPerPage={9}
 *   resetTrigger={searchQuery}
 *   onPageChange={handlePageChange}
 * />
 * ```
 *
 * COMPONENT BEHAVIOR:
 * - Automatically hides when totalItems <= itemsPerPage (only 1 page)
 * - Resets to page 1 when resetTrigger value changes
 * - Uses 1-based page numbers (like Material-UI Pagination)
 * - Provides both page number and array indices in callback
 *
 * - Uses consistent styling (primary color, outlined variant, medium size)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Box } from '@material-ui/core';
import { Pagination as MuiPagination } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
}));

/**
 * @param {Object} props
 * @param {number} props.totalItems - Total number of items to paginate
 * @param {number} props.itemsPerPage - Number of items per page
 * @param {function} props.onPageChange - Callback: (page, startIndex, endIndex) => void
 * @param {number} [props.currentPage] - Controlled page number (1-based)
 * @param {any} [props.resetTrigger] - When this changes, reset to page 1
 */
const Pagination = ({
  totalItems,
  itemsPerPage,
  onPageChange,
  currentPage,
  resetTrigger,
}) => {
  const classes = useStyles();

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage);
  }, [totalItems, itemsPerPage]);

  // Internal page state (when not controlled)
  const [internalPage, setInternalPage] = useState(1);

  // Determine current page (controlled vs uncontrolled)
  const currentPageNumber =
    currentPage !== undefined ? currentPage : internalPage;

  // Reset to page 1 when resetTrigger changes
  useEffect(() => {
    if (resetTrigger !== undefined) {
      if (currentPage === undefined) {
        setInternalPage(1);
      }
      // If controlled, parent should handle reset
      if (onPageChange && currentPageNumber !== 1) {
        const startIndex = 0;
        const endIndex = Math.min(itemsPerPage - 1, totalItems - 1);
        onPageChange(1, startIndex, endIndex);
      }
    }
  }, [
    resetTrigger,
    currentPage,
    onPageChange,
    itemsPerPage,
    totalItems,
    currentPageNumber,
  ]);

  // Hide pagination if only 1 page or no items
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (event, page) => {
    // Update internal state if uncontrolled
    if (currentPage === undefined) {
      setInternalPage(page);
    }

    // Calculate array indices for the selected page
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1);

    // Call parent callback with page and indices
    if (onPageChange) {
      onPageChange(page, startIndex, endIndex);
    }
  };

  return (
    <Box className={classes.paginationContainer}>
      <MuiPagination
        count={totalPages}
        page={currentPageNumber}
        onChange={handlePageChange}
        color="primary"
        variant="outlined"
        size="medium"
      />
    </Box>
  );
};

export default Pagination;
