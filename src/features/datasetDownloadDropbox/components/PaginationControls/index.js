import React from 'react';
import {
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { paginationControlsStyles } from './styles';

const useStyles = makeStyles(paginationControlsStyles);

const PaginationControls = ({
  currentPage = 1,
  totalPages = null,
  pageSize = 25,
  pageSizeOptions = [25, 50, 100, 250],
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.paginationControls}>
      <div className={classes.paginationInfo}>
        <FormControl variant="outlined" size="small" className={classes.pageSizeSelect}>
          <InputLabel>Page Size</InputLabel>
          <Select
            value={pageSize}
            onChange={onPageSizeChange}
            label="Page Size"
            MenuProps={{
              style: { zIndex: 9900 },
              PaperProps: { style: { zIndex: 9900 } }
            }}
          >
            {pageSizeOptions.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="body2">
          Page {currentPage}
          {totalPages && ` of ${totalPages}`}
        </Typography>
      </div>

      <div>
        <Button
          onClick={() => onPageChange('prev')}
          disabled={currentPage <= 1 || isLoading}
        >
          Previous
        </Button>
        <Button
          onClick={() => onPageChange('next')}
          disabled={(totalPages && currentPage >= totalPages) || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;
