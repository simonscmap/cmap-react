/**
 * Pagination Component
 *
 * A simplified, reusable pagination component that wraps Material-UI's Pagination
 * component with consistent project styling. Designed to work with the usePagination hook.
 *
 * USAGE:
 * ```jsx
 * const { paginatedData, paginationProps } = usePagination({
 *   data: myData,
 *   itemsPerPage: 10
 * });
 *
 * return (
 *   <div>
 *     {paginatedData.map(item => <Item key={item.id} {...item} />)}
 *     {paginationProps.shouldShow && <Pagination {...paginationProps} />}
 *   </div>
 * );
 * ```
 *
 * FEATURES:
 * - Consistent Material-UI v4 styling (primary, outlined, medium)
 * - Centered layout with consistent spacing
 * - No internal state management (controlled by hook)
 * - Simple prop interface
 */

import React from 'react';
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
 * @param {number} props.count - Total number of pages
 * @param {number} props.page - Current page (1-indexed)
 * @param {function} props.onChange - Page change handler: (event, page) => void
 */
const Pagination = ({ count, page, onChange }) => {
  const classes = useStyles();

  return (
    <Box className={classes.paginationContainer}>
      <MuiPagination
        count={count}
        page={page}
        onChange={onChange}
        color="primary"
        variant="outlined"
        size="medium"
      />
    </Box>
  );
};

export default Pagination;
