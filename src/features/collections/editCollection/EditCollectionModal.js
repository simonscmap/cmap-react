import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
} from '@material-ui/core';
import { Close, Add } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch } from 'react-redux';
import { useEditCollection } from './hooks/useEditCollection';
import useEditCollectionStore from '../state/editCollectionStore';
import CollectionFormFields from '../components/CollectionFormFields';
import CollectionStatistics from '../components/CollectionStatistics';
import CollectionDatasetsTable from '../components/CollectionDatasetsTable';
import CollectionContentActions from './components/CollectionContentActions';
import ConfirmationDialog from '../../../shared/components/ConfirmationDialog';
import UniversalButton from '../../../shared/components/UniversalButton';
import zIndex from '../../../enums/zIndex';
import AddDatasetsModal from '../addDatasets/AddDatasetsModal';

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    width: '1400px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    backgroundColor: 'rgb(24, 69, 98)',
  },
  dialogRoot: {
    zIndex: `${zIndex.MUI_DIALOG} !important`,
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
    display: 'none',
    [theme.breakpoints.down('md')]: {
      display: 'flex',
    },
  },
  inlineActions: {
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  splitPanelContainer: {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: theme.spacing(3),
    alignItems: 'stretch',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr',
    },
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
  },
  sectionTitle: {
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: theme.spacing(2),
  },
  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  rightPanel: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
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
  invalidDatasetsList: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
    paddingLeft: theme.spacing(4),
    maxHeight: '150px',
    overflow: 'auto',
    backgroundColor: 'transparent',
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
  const dispatch = useDispatch();

  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [showInvalidDatasetsDialog, setShowInvalidDatasetsDialog] =
    useState(false);
  const [invalidDatasetsData, setInvalidDatasetsData] = useState(null);
  const [isAddDatasetsOpen, setIsAddDatasetsOpen] = useState(false);

  // Store state selectors
  const datasetsToRemove = useEditCollectionStore(
    (state) => state.datasetsToRemove,
  );
  const selectedDatasets = useEditCollectionStore(
    (state) => state.selectedDatasets,
  );
  const originalCollection = useEditCollectionStore(
    (state) => state.originalCollection,
  );
  const markDatasetForRemoval = useEditCollectionStore(
    (state) => state.markDatasetForRemoval,
  );
  const cancelDatasetRemoval = useEditCollectionStore(
    (state) => state.cancelDatasetRemoval,
  );
  const removeDatasetImmediate = useEditCollectionStore(
    (state) => state.removeDatasetImmediate,
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

  // Handle close invalid datasets dialog
  const handleCloseInvalidDatasetsDialog = () => {
    setShowInvalidDatasetsDialog(false);
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
        // Check if dataset is newly added
        const collectionDataset = collection.datasets.find(
          (d) => d.datasetShortName === datasetShortName,
        );

        if (collectionDataset?.isNewlyAdded === true) {
          // Immediate removal for newly added datasets
          removeDatasetImmediate(datasetShortName);
        } else {
          // Mark for removal for existing datasets
          markDatasetForRemoval(datasetShortName);
        }
      });
    }
  };

  // Handle add datasets from AddDatasetsModal
  const handleAddDatasets = (newDatasets) => {
    // Transform datasets from preview format (shortName) to collection format (datasetShortName)
    // and add isNewlyAdded flag for green highlighting
    const datasetsWithFlags = newDatasets.map((dataset) => ({
      ...dataset,
      datasetShortName: dataset.shortName, // Transform property name for collection format
      isNewlyAdded: true,
    }));

    // Call editCollectionStore action to merge datasets into collection
    useEditCollectionStore.getState().addDatasets(datasetsWithFlags);

    // Close Add Datasets modal
    setIsAddDatasetsOpen(false);
  };

  // Pre-calculate row states for table rendering
  // This transforms dataset short names with row state information for styling
  const datasetShortNamesWithStates = useMemo(() => {
    if (!collection?.datasets) return [];

    // Get list of short names, filtering out invalid entries
    const shortNames = collection.datasets
      .map((d) => d.datasetShortName)
      .filter((name) => name !== undefined && name !== null && name !== '');

    // Transform each short name into an object with row state
    return shortNames.map((shortName) => {
      let rowState = 'normal';

      // Priority: markedForRemoval > newlyAdded > invalid > normal
      if (datasetsToRemove.includes(shortName)) {
        rowState = 'markedForRemoval';
      } else {
        // Check if dataset is newly added
        const collectionDataset = collection.datasets.find(
          (d) => d.datasetShortName === shortName,
        );
        if (collectionDataset?.isNewlyAdded === true) {
          rowState = 'newlyAdded';
        } else if (collectionDataset?.isInvalid === true) {
          rowState = 'invalid';
        }
      }

      return {
        shortName,
        rowState,
      };
    });
  }, [collection?.datasets, datasetsToRemove]);

  // Handle checkbox toggle - need to disable for marked-for-removal
  const handleToggleSelection = (shortName) => {
    if (!datasetsToRemove.includes(shortName)) {
      toggleDatasetSelection(shortName);
    }
  };

  // Calculate new dataset count (accounting for removals and additions)
  const newDatasetCount = useMemo(() => {
    if (!collection?.datasets) return 0;
    // Filter out datasets marked for removal
    return collection.datasets.filter(
      (d) => !datasetsToRemove.includes(d.datasetShortName),
    ).length;
  }, [collection?.datasets, datasetsToRemove]);

  // Get original dataset count
  const originalDatasetCount = originalCollection?.datasets?.length || 0;

  // Reset warning state when modal closes
  useEffect(() => {
    if (!open) {
      setShowUnsavedWarning(false);
      setShowInvalidDatasetsDialog(false);
      setInvalidDatasetsData(null);
    }
  }, [open]);

  // Check for invalid datasets when collection loads
  useEffect(() => {
    if (collection && !isLoading) {
      const invalidDatasets =
        collection.datasets?.filter((d) => d.isInvalid === true) || [];

      if (invalidDatasets.length > 0) {
        setInvalidDatasetsData({
          invalidCount: invalidDatasets.length,
          invalidDatasets: invalidDatasets,
        });
        setShowInvalidDatasetsDialog(true);
      }
    }
  }, [collection, isLoading]);

  if (!open) {
    return null;
  }
  // Loading state
  if (isLoading) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        classes={{ paper: classes.dialogPaper, root: classes.dialogRoot }}
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
        classes={{ paper: classes.dialogPaper, root: classes.dialogRoot }}
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
        classes={{ paper: classes.dialogPaper, root: classes.dialogRoot }}
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
        classes={{ paper: classes.dialogPaper, root: classes.dialogRoot }}
        aria-labelledby="edit-collection-dialog-title"
        disableScrollLock={true}
        maxWidth={false}
      >
        <DialogTitle
          id="edit-collection-dialog-title"
          className={classes.dialogTitle}
        >
          <Typography
            variant="h4"
            component="div"
            className={classes.modalTitle}
          >
            Edit Collection: {originalCollection?.name || collection.name}
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
            <Box className={classes.leftPanel}>
              <Typography variant="h6" className={classes.sectionTitle}>
                Collection Settings
              </Typography>
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
                isEdit={true}
                followsCount={collection.follows || 0}
              />
              <CollectionStatistics
                stats={[
                  {
                    currentValue: newDatasetCount,
                    originalValue: originalDatasetCount,
                    label: 'Datasets',
                  },
                  {
                    value: collection.modifiedDate
                      ? new Date(collection.modifiedDate).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                          },
                        )
                      : 'N/A',
                    label: 'Last Modified',
                  },
                ]}
                itemsPerRow={2}
              />
            </Box>

            <Box className={classes.rightPanel}>
              <Box className={classes.sectionTitleRow}>
                <Typography
                  variant="h6"
                  className={classes.sectionTitle}
                  style={{ marginBottom: 0 }}
                >
                  Collection Contents
                </Typography>
                <UniversalButton
                  variant="containedPrimary"
                  size="large"
                  startIcon={<Add />}
                  onClick={() => setIsAddDatasetsOpen(true)}
                >
                  ADD DATASETS
                </UniversalButton>
              </Box>
              <CollectionDatasetsTable
                datasetShortNamesWithStates={datasetShortNamesWithStates}
                selectedDatasets={selectedDatasets}
                onToggleSelection={handleToggleSelection}
                onSelectAll={selectAllDatasets}
                onClearAll={clearAllSelections}
                areAllSelected={allDatasetsSelected}
                areIndeterminate={isIndeterminate}
                columns={['name', 'status', 'type', 'dateRange']}
                actions={[
                  {
                    label: 'Remove',
                    onClick: (dataset) => {
                      // Check if dataset is newly added
                      const collectionDataset = collection.datasets.find(
                        (d) => d.datasetShortName === dataset.shortName,
                      );

                      if (collectionDataset?.isNewlyAdded === true) {
                        // Immediate removal for newly added datasets
                        removeDatasetImmediate(dataset.shortName);
                      } else {
                        // Mark for removal for existing datasets
                        markDatasetForRemoval(dataset.shortName);
                      }
                    },
                    variant: 'secondary',
                    condition: (dataset) =>
                      !datasetsToRemove.includes(dataset.shortName),
                  },
                  {
                    label: 'Cancel',
                    onClick: (dataset) =>
                      cancelDatasetRemoval(dataset.shortName),
                    variant: 'secondary',
                    condition: (dataset) =>
                      datasetsToRemove.includes(dataset.shortName),
                  },
                ]}
                maxHeight={500}
              />
              <Box className={classes.inlineActions}>
                <CollectionContentActions
                  selectedDatasets={selectedDatasets}
                  canSave={canSave}
                  isSaving={isSaving}
                  onRemoveSelected={handleRemoveSelected}
                  onCancel={handleClose}
                  onSave={handleSaveClick}
                />
              </Box>
            </Box>
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

      <ConfirmationDialog
        open={showUnsavedWarning}
        onClose={handleKeepEditing}
        title="Unsaved Changes"
        message="You have unsaved changes to this collection. If you leave now, your changes will be lost. Do you want to keep editing or discard your changes?"
        actions={[
          {
            label: 'Keep Editing',
            onClick: handleKeepEditing,
            variant: 'primary',
            autoFocus: true,
          },
          {
            label: 'Discard Changes',
            onClick: handleDiscardChanges,
            variant: 'secondary',
          },
        ]}
        ariaLabelId="unsaved-changes-warning-title"
        ariaDescriptionId="unsaved-changes-warning-description"
      />

      <ConfirmationDialog
        open={showInvalidDatasetsDialog}
        onClose={handleCloseInvalidDatasetsDialog}
        title="Invalid Datasets"
        message={
          <>
            <DialogContentText>
              The following {invalidDatasetsData?.invalidCount || 0} dataset
              {(invalidDatasetsData?.invalidCount || 0) === 1
                ? ' is'
                : 's are'}{' '}
              no longer available:
            </DialogContentText>
            <DialogContentText
              className={classes.invalidDatasetsList}
              component="ul"
            >
              {invalidDatasetsData?.invalidDatasets?.map((dataset, idx) => (
                <li key={idx}>
                  <code>{dataset.datasetShortName}</code>
                </li>
              ))}
            </DialogContentText>
          </>
        }
        actions={[
          {
            label: 'OK',
            onClick: handleCloseInvalidDatasetsDialog,
            variant: 'primary',
            autoFocus: true,
          },
        ]}
        ariaLabelId="invalid-datasets-title"
        ariaDescriptionId="invalid-datasets-description"
      />

      <AddDatasetsModal
        open={isAddDatasetsOpen}
        onClose={() => setIsAddDatasetsOpen(false)}
        onAddDatasets={handleAddDatasets}
        currentCollectionDatasets={collection?.datasets || []}
        targetCollectionName={collection?.name}
      />
    </>
  );
};

export default EditCollectionModal;
