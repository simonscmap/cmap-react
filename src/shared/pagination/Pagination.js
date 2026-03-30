import React from 'react';
import { Box, FormControl, Select, MenuItem, Typography } from '@material-ui/core';
import { Pagination as MuiPagination } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import colors from '../../enums/colors';
import zIndex from '../../enums/zIndex';

let useStyles = makeStyles((theme) => ({
  paginationContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    position: 'relative',
  },
  paginationContainerSimple: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  perPageControl: {
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(1),
  },
  paginationCenter: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  perPageLabel: {
    fontSize: '0.8rem',
    color: 'rgba(255, 255, 255, 0.7)',
    whiteSpace: 'nowrap',
  },
  perPageSelect: {
    color: colors.primary,
    fontSize: '0.8rem',
    '& .MuiSelect-icon': {
      color: colors.primary,
      top: 'unset',
      bottom: 0,
    },
    '&.MuiInput-underline:before': {
      borderBottomColor: colors.primary,
    },
    '&.MuiInput-underline:hover:not(.Mui-disabled):before': {
      borderBottomColor: colors.primary,
    },
    '&.MuiInput-underline:after': {
      borderBottomColor: colors.primary,
    },
  },
}));

let Pagination = ({
  count,
  page,
  onChange,
  rowsPerPageOptions,
  rowsPerPage,
  onRowsPerPageChange,
}) => {
  let classes = useStyles();

  let hasPerPage = Boolean(rowsPerPageOptions);

  return (
    <Box className={hasPerPage ? classes.paginationContainer : classes.paginationContainerSimple}>
      {hasPerPage && (
        <Box className={classes.perPageControl}>
          <Typography className={classes.perPageLabel}>Rows per page:</Typography>
          <FormControl size="small">
            <Select
              value={rowsPerPage}
              onChange={onRowsPerPageChange}
              className={classes.perPageSelect}
              MenuProps={{
                disableScrollLock: true,
                getContentAnchorEl: null,
                anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                transformOrigin: { vertical: 'top', horizontal: 'left' },
                style: { zIndex: zIndex.MODAL_LAYER_3_POPPER },
              }}
            >
              {rowsPerPageOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      <Box className={hasPerPage ? classes.paginationCenter : undefined}>
        <MuiPagination
          count={count}
          page={page}
          onChange={onChange}
          color="primary"
          variant="outlined"
          size="medium"
        />
      </Box>
    </Box>
  );
};

export default Pagination;
