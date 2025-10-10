import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useEditCollection } from './hooks/useEditCollection';
import useEditCollectionStore from '../state/editCollectionStore';
import CollectionFormFields from '../components/CollectionFormFields';
import CollectionContentsTable from './components/CollectionContentsTable';
import UnsavedChangesWarning from './components/UnsavedChangesWarning';
import MultiDatasetDownloadContainer from '../../multiDatasetDownload/components/MultiDatasetDownloadContainer';
import UniversalButton from '../../../shared/components/UniversalButton';

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    width: '1400px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    backgroundColor: 'rgb(24, 69, 98)',
  },
  dialogTitle: {
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(6),
  },
  modalTitle: {
    margin: 0,
    fontWeight: 500,
    fontSize: '1.5rem',
    color: '#8bc34a',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  dialogContent: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  dialogActions: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    gap: theme.spacing(1),
  },
  splitPanelContainer: {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr',
    },
  },
  leftPanel: {
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    height: 'fit-content',
  },
  rightPanel: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    borderRadius: theme.shape.borderRadius,
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(8),
    gap: theme.spacing(2),
  },
  errorContainer: {
    padding: theme.spacing(4),
    textAlign: 'center',
  },
  errorText: {
    color: theme.palette.error.main,
    marginBottom: theme.spacing(2),
  },
  downloadDialogPaper: {
    minWidth: '900px',
    maxWidth: '1200px',
    [theme.breakpoints.down('md')]: {
      minWidth: '90vw',
      maxWidth: '90vw',
    },
  },
  downloadDialogTitle: {
    paddingBottom: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  downloadDialogContent: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  downloadCloseButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
}));

/**
 * EditCollectionModal
 *
 * Modal component for editing collections. Handles initialization,
 * two-panel layout (form left, table right), unsaved changes warning,
 * and integration with the edit collection store.
 */
const EditCollectionModal = ({ open, onClose, collectionId }) => {
  const classes = useStyles();

  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  // Store state selectors
  const datasetsToRemove = useEditCollectionStore(
    (state) => state.datasetsToRemove,
  );
  const selectedDatasets = useEditCollectionStore(
    (state) => state.selectedDatasets,
  );
  const markDatasetForRemoval = useEditCollectionStore(
    (state) => state.markDatasetForRemoval,
  );
  const cancelDatasetRemoval = useEditCollectionStore(
    (state) => state.cancelDatasetRemoval,
  );
  const toggleDatasetSelection = useEditCollectionStore(
    (state) => state.toggleDatasetSelection,
  );
  const selectAllDatasets = useEditCollectionStore(
    (state) => state.selectAllDatasets,
  );
  const clearAllSelections = useEditCollectionStore(
    (state) => state.clearAllSelections,
  );
  const allDatasetsSelected = useEditCollectionStore((state) =>
    state.allDatasetsSelected(),
  );
  const isIndeterminate = useEditCollectionStore((state) =>
    state.isIndeterminate(),
  );
  const resetChanges = useEditCollectionStore((state) => state.resetChanges);

  // Use the main edit collection hook
  const {
    isLoading,
    isSaving,
    error,
    collection,
    hasUnsavedChanges,
    canSave,
    nameValidationState,
    nameErrorMessage,
    descriptionError,
    isNameOverLimit,
    isDescriptionOverLimit,
    handleNameChange,
    handleDescriptionChange,
    handleVisibilityChange,
    handleSave,
    handleCancel,
  } = useEditCollection(collectionId);

  // Handle modal close
  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
    } else {
      handleCancel();
      onClose();
    }
  };

  // Handle keep editing from warning dialog
  const handleKeepEditing = () => {
    setShowUnsavedWarning(false);
  };

  // Handle discard changes from warning dialog
  const handleDiscardChanges = () => {
    resetChanges();
    setShowUnsavedWarning(false);
    onClose();
  };

  // Handle save button click
  const handleSaveClick = async () => {
    const success = await handleSave();
    if (success) {
      onClose();
    }
  };

  // Wrapper handlers to convert events to values for CollectionFormFields
  const handleNameChangeEvent = (event) => {
    handleNameChange(event.target.value);
  };

  const handleDescriptionChangeEvent = (event) => {
    handleDescriptionChange(event.target.value);
  };

  const handleVisibilityChangeEvent = (event) => {
    const newIsPublic = event.target.value === 'public';
    handleVisibilityChange(newIsPublic);
  };

  const handleSetIsPublic = (isPublic) => {
    handleVisibilityChange(isPublic);
  };

  // Handle remove selected datasets
  const handleRemoveSelected = () => {
    if (selectedDatasets && selectedDatasets.length > 0) {
      selectedDatasets.forEach((datasetShortName) => {
        markDatasetForRemoval(datasetShortName);
      });
    }
  };

  // Handle download selected datasets
  const handleDownloadSelected = () => {
    setDownloadModalOpen(true);
  };

  const handleCloseDownloadModal = () => {
    setDownloadModalOpen(false);
  };

  const handleDownloadComplete = ({ success, error }) => {
    if (success) {
      // Close modal on successful download
      handleCloseDownloadModal();
    }
    // On error, leave modal open so user can see what happened
    // Error handling is already done in DownloadButton (snackbar, console.error)
  };

  // Reset warning state when modal closes
  useEffect(() => {
    if (!open) {
      setShowUnsavedWarning(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        classes={{ paper: classes.dialogPaper }}
        aria-labelledby="edit-collection-dialog-title"
        disableScrollLock={true}
      >
        <DialogContent>
          <Box className={classes.loadingContainer}>
            <CircularProgress size={48} />
            <Typography variant="body1">Loading collection...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state
  if (error) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        classes={{ paper: classes.dialogPaper }}
        aria-labelledby="edit-collection-dialog-title"
        disableScrollLock={true}
      >
        <DialogContent>
          <Box className={classes.errorContainer}>
            <Typography variant="h6" className={classes.errorText}>
              {error}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <UniversalButton onClick={onClose} variant="default" size="large">
            CLOSE
          </UniversalButton>
        </DialogActions>
      </Dialog>
    );
  }

  // No collection loaded
  if (!collection) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        classes={{ paper: classes.dialogPaper }}
        aria-labelledby="edit-collection-dialog-title"
        disableScrollLock={true}
      >
        <DialogContent>
          <Box className={classes.errorContainer}>
            <Typography variant="h6" className={classes.errorText}>
              Collection not found
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <UniversalButton onClick={onClose} variant="default" size="large">
            CLOSE
          </UniversalButton>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        classes={{ paper: classes.dialogPaper }}
        aria-labelledby="edit-collection-dialog-title"
        disableScrollLock={true}
        maxWidth={false}
      >
        <DialogTitle
          id="edit-collection-dialog-title"
          className={classes.dialogTitle}
        >
          <Typography variant="h4" className={classes.modalTitle}>
            Edit Collection: {collection.name}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            className={classes.closeButton}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className={classes.dialogContent}>
          <Box className={classes.splitPanelContainer}>
            <Paper className={classes.leftPanel}>
              <CollectionFormFields
                name={collection.name}
                description={collection.description || ''}
                isPublic={collection.isPublic}
                onNameChange={handleNameChangeEvent}
                onDescriptionChange={handleDescriptionChangeEvent}
                onVisibilityChange={handleVisibilityChangeEvent}
                onSetIsPublic={handleSetIsPublic}
                nameValidationState={nameValidationState}
                nameErrorMessage={nameErrorMessage}
                descriptionError={descriptionError}
                isNameOverLimit={isNameOverLimit}
                isDescriptionOverLimit={isDescriptionOverLimit}
              />
            </Paper>

            <Paper className={classes.rightPanel}>
              <CollectionContentsTable
                datasets={collection.datasets || []}
                datasetsToRemove={datasetsToRemove}
                selectedDatasets={selectedDatasets}
                onMarkForRemoval={markDatasetForRemoval}
                onCancelRemoval={cancelDatasetRemoval}
                onToggleSelection={toggleDatasetSelection}
                onSelectAll={selectAllDatasets}
                onClearAll={clearAllSelections}
                areAllSelected={allDatasetsSelected}
                areIndeterminate={isIndeterminate}
              />
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions className={classes.dialogActions}>
          <UniversalButton
            onClick={handleRemoveSelected}
            variant="secondary"
            size="large"
            disabled={selectedDatasets.length === 0}
          >
            REMOVE SELECTED
          </UniversalButton>
          <UniversalButton
            onClick={handleDownloadSelected}
            variant="containedPrimary"
            size="large"
            disabled={selectedDatasets.length === 0}
          >
            DOWNLOAD SELECTED
          </UniversalButton>
          <Box style={{ flex: 1 }} />
          <UniversalButton onClick={handleClose} variant="default" size="large">
            CANCEL
          </UniversalButton>
          <UniversalButton
            onClick={handleSaveClick}
            variant="primary"
            size="large"
            disabled={!canSave || isSaving}
          >
            {isSaving ? (
              <CircularProgress
                size={14}
                style={{ color: 'rgba(105, 255, 242, 0.2)' }}
              />
            ) : (
              'SAVE CHANGES'
            )}
          </UniversalButton>
        </DialogActions>
      </Dialog>

      <UnsavedChangesWarning
        open={showUnsavedWarning}
        onKeepEditing={handleKeepEditing}
        onDiscardChanges={handleDiscardChanges}
      />

      <Dialog
        open={downloadModalOpen}
        onClose={handleCloseDownloadModal}
        classes={{ paper: classes.downloadDialogPaper }}
        aria-labelledby="download-selected-dialog-title"
        disableScrollLock={true}
        maxWidth={false}
      >
        <DialogTitle
          id="download-selected-dialog-title"
          className={classes.downloadDialogTitle}
        >
          Download Selected Datasets
          <IconButton
            aria-label="close"
            onClick={handleCloseDownloadModal}
            className={classes.downloadCloseButton}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className={classes.downloadDialogContent}>
          {collection && selectedDatasets.length > 0 && (
            <MultiDatasetDownloadContainer
              datasetShortNames={selectedDatasets}
              downloadContext={{ collectionId: collection.id }}
              onDownloadComplete={handleDownloadComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditCollectionModal;
