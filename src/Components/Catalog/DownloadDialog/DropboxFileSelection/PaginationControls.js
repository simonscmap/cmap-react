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
import { dropboxFileSelectionStyles } from './styles';

const useStyles = makeStyles(dropboxFileSelectionStyles);

const PaginationControls = ({
  vaultFilesPagination,
  onPageChange,
  onPageSizeChange,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.paginationControls}>
      <div className={classes.paginationInfo}>
        <FormControl variant="outlined" size="small">
          <InputLabel>Page Size</InputLabel>
          <Select
            value={vaultFilesPagination.local?.pageSize || 25}
            onChange={onPageSizeChange}
            label="Page Size"
          >
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
            <MenuItem value={250}>250</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="body2">
          Page {vaultFilesPagination.local?.currentPage || 1}
          {vaultFilesPagination.local?.totalPages &&
            ` of ${vaultFilesPagination.local.totalPages}`}
        </Typography>
      </div>

      <div>
        <Button
          onClick={() => onPageChange('prev')}
          disabled={
            vaultFilesPagination.local?.currentPage <= 1 || 
            vaultFilesPagination.backend?.isLoading
          }
        >
          Previous
        </Button>
        <Button
          onClick={() => onPageChange('next')}
          disabled={
            vaultFilesPagination.local?.currentPage >= vaultFilesPagination.local?.totalPages ||
            vaultFilesPagination.backend?.isLoading
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;