import React from 'react';
import { CircularProgress, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import GetAppIcon from '@material-ui/icons/GetApp';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import UniversalButton from '../../../shared/components/UniversalButton';
import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';
import useRowCountStore from '../stores/useRowCountStore';
import { showLoginDialog, snackbarOpen } from '../../../Redux/actions/ui';

const useStyles = makeStyles((theme) => ({
  downloadButton: {
    marginTop: theme.spacing(2),
    minWidth: 200,
  },
}));

const DownloadButton = ({ subsetFiltering, onDownloadComplete }) => {
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
      // Call callback on successful download
      if (onDownloadComplete) {
        onDownloadComplete({ success: true });
      }
    } catch (error) {
      if (error.status === 413) {
        dispatch(snackbarOpen(error.message));
      } else {
        console.error('Download failed:', error);
      }
      // Call callback on failed download
      if (onDownloadComplete) {
        onDownloadComplete({ success: false, error });
      }
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
      <UniversalButton
        variant="containedPrimary"
        size="xlarge"
        className={classes.downloadButton}
        disabled={isDisabled && Boolean(user)}
        onClick={handleDownload}
        startIcon={
          isDownloading ? (
            <CircularProgress size={20} color="inherit" />
          ) : !user ? (
            <AccountCircleIcon />
          ) : (
            <GetAppIcon />
          )
        }
      >
        {getButtonText()}
      </UniversalButton>
    </Box>
  );
};

export default DownloadButton;
