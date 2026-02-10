import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import MultiDatasetDownloadContainer from '../../multiDatasetDownload/components/MultiDatasetDownloadContainer';
import { useCollectionDownloadModalStyles } from './styles/collectionDownloadModalStyles';
import { GeographicBoundaries } from '../../../shared/enum/geographicBoundariesCollections';

const CollectionDownloadModal = ({ open, onClose, collection }) => {
  const classes = useCollectionDownloadModalStyles();

  if (!collection) {
    return null;
  }

  // Extract dataset short names from collection, filtering out invalid datasets
  const datasetShortNames = collection.datasets
    ? collection.datasets
        .filter((dataset) => dataset.isInvalid !== true)
        .map((dataset) => dataset.datasetShortName)
    : [];

  const handleDownloadComplete = ({ success, error }) => {
    if (success) {
      // Close modal on successful download
      onClose();
    }
    // On error, leave modal open so user can see what happened
    // Error handling is already done in DownloadButton (snackbar, console.error)
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      classes={{ paper: classes.dialogPaper, root: classes.dialogRoot }}
      aria-labelledby="collection-download-dialog-title"
      disableScrollLock={true}
      maxWidth={false}
    >
      <DialogTitle
        id="collection-download-dialog-title"
        className={classes.dialogTitle}
      >
        <Typography variant="h6" component="div" className={classes.modalTitle}>
          Download Collection: {collection.name}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={classes.closeButton}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        <MultiDatasetDownloadContainer
          datasetShortNames={datasetShortNames}
          downloadContext={{ collectionId: collection.id }}
          onDownloadComplete={handleDownloadComplete}
          geographicPresets={GeographicBoundaries}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CollectionDownloadModal;
