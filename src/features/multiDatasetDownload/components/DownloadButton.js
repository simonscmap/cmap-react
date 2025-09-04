import React from 'react';
import { Button, CircularProgress, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import GetAppIcon from '@material-ui/icons/GetApp';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';
import useRowCountStore from '../stores/useRowCountStore';
import { transformSubsetFiltersForAPI } from '../../../shared/filtering/utils/filterTransformUtils';
import { showLoginDialog } from '../../../Redux/actions/ui';

const useStyles = makeStyles((theme) => ({
  downloadButton: {
    marginTop: theme.spacing(2),
    minWidth: 200,
    height: 48,
    '&.Mui-disabled': {
      color: '#ccc',
    },
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  spinner: {
    size: 20,
  },
}));

const DownloadButton = ({ subsetFiltering }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { selectedDatasets, isDownloading, downloadDatasets } =
    useMultiDatasetDownloadStore();
  const { isAnyRowCountLoading, isOverThreshold, getThresholdConfig } =
    useRowCountStore();

  const user = useSelector((state) => state.user);

  const isRowCountsLoading = isAnyRowCountLoading();
  const isOverRowThreshold = isOverThreshold(selectedDatasets);
  const isDisabled =
    selectedDatasets.size === 0 ||
    isDownloading ||
    isRowCountsLoading ||
    isOverRowThreshold;
  const selectedCount = selectedDatasets.size;

  const handleDownload = async () => {
    if (!user) {
      dispatch(showLoginDialog());
      return;
    }

    if (isDisabled) return;

    try {
      await downloadDatasets(subsetFiltering);
    } catch (error) {
      // TODO: Add proper error handling UI in future story
    }
  };

  const getButtonText = () => {
    if (isDownloading) {
      return 'Downloading...';
    }
    if (!user) {
      return 'Login Now to Download';
    }
    if (isRowCountsLoading) {
      return 'Calculating...';
    }
    if (isOverRowThreshold) {
      const { maxRowThreshold } = getThresholdConfig();
      const formattedThreshold = (maxRowThreshold / 1000000).toFixed(0);
      return `Selection exceeds ${formattedThreshold}M row limit`;
    }
    if (selectedCount === 0) {
      return 'Select Datasets to Download';
    }
    return `Download ${selectedCount} Dataset${selectedCount === 1 ? '' : 's'}`;
  };

  return (
    <Box display="flex" justifyContent="center" mt={2}>
      <Button
        variant="contained"
        color="primary"
        className={classes.downloadButton}
        disabled={isDisabled && user}
        onClick={handleDownload}
        startIcon={
          isDownloading ? (
            <CircularProgress
              className={classes.spinner}
              size={20}
              color="inherit"
            />
          ) : !user ? (
            <AccountCircleIcon />
          ) : (
            <GetAppIcon />
          )
        }
      >
        <span className={classes.buttonContent}>{getButtonText()}</span>
      </Button>
    </Box>
  );
};

export default DownloadButton;
