import React from 'react';
import { Button, CircularProgress, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import GetAppIcon from '@material-ui/icons/GetApp';
import { useMultiDatasetDownloadStore } from '../stores/multiDatasetDownloadStore';

const useStyles = makeStyles((theme) => ({
  downloadButton: {
    marginTop: theme.spacing(2),
    minWidth: 200,
    height: 48,
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

const DownloadButton = () => {
  const classes = useStyles();
  const {
    selectedDatasets,
    isDownloading,
    setIsDownloading,
    filters,
    datasets,
  } = useMultiDatasetDownloadStore();

  const isDisabled = selectedDatasets.size === 0 || isDownloading;
  const selectedCount = selectedDatasets.size;

  const handleDownload = async () => {
    if (isDisabled) return;

    try {
      setIsDownloading(true);

      // Get selected dataset objects
      const selectedDatasetObjects = datasets.filter((dataset) =>
        selectedDatasets.has(dataset.Dataset_Name),
      );

      // Import bulk download API
      const { bulkDownload } = await import('../../../api/bulkDownload');

      // Call enhanced bulk download API with filters
      await bulkDownload(selectedDatasetObjects, filters);
    } catch (error) {
      console.error('Download failed:', error);
      // TODO: Add proper error handling UI in future story
    } finally {
      setIsDownloading(false);
    }
  };

  const getButtonText = () => {
    if (isDownloading) {
      return 'Downloading...';
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
        disabled={isDisabled}
        onClick={handleDownload}
        startIcon={
          isDownloading ? (
            <CircularProgress
              className={classes.spinner}
              size={20}
              color="inherit"
            />
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
