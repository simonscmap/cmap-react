import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
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
import UnsavedChangesWarning from './components/UnsavedChangesWarning';
import UniversalButton from '../../../shared/components/UniversalButton';
import { DOWNLOAD_LIMITS } from '../../../shared/constants/downloadConstants';
import zIndex from '../../../enums/zIndex';

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
  normalRow: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  },
  markedForRemovalRow: {
    opacity: 0.8,
    backgroundColor: 'rgba(211, 47, 47, 0.15)',
    borderLeft: '3px solid rgba(211, 47, 47, 0.6)',
    '& .MuiTableCell-root:not(:first-child):not(:last-child)': {
      textDecoration: 'line-through',
    },
    '&:hover': {
      backgroundColor: 'rgba(211, 47, 47, 0.2)',
    },
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
  const [tableData, setTableData] = useState([]);

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
  const downloadSelected = useEditCollectionStore(
    (state) => state.downloadSelected,
  );

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

  // Handle download selected datasets - triggers direct download
  const handleDownloadSelected = async () => {
    await downloadSelected(dispatch);
  };

  // Get row class for marked-for-removal styling
  const getRowClass = (dataset) => {
    if (datasetsToRemove.includes(dataset.shortName)) {
      return classes.markedForRemovalRow;
    }
    return classes.normalRow;
  };

  // Handle checkbox toggle - need to disable for marked-for-removal
  const handleToggleSelection = (shortName) => {
    if (!datasetsToRemove.includes(shortName)) {
      toggleDatasetSelection(shortName);
    }
  };

  // Callback when table data is loaded
  const handleDataLoaded = (previewData) => {
    setTableData(previewData);
  };

  // Calculate total selected rows
  const totalSelectedRows = useMemo(() => {
    return selectedDatasets.reduce((sum, shortName) => {
      const dataset = tableData.find((d) => d.shortName === shortName);
      return sum + (dataset?.rowCount || 0);
    }, 0);
  }, [selectedDatasets, tableData]);

  // Check if over download limit
  const isOverDownloadLimit =
    totalSelectedRows > DOWNLOAD_LIMITS.MAX_ROW_THRESHOLD;

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
              />
              <CollectionStatistics
                stats={[
                  {
                    value: collection.datasets?.length || 0,
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
                  onClick={() => {}}
                >
                  ADD DATASETS
                </UniversalButton>
              </Box>
              <CollectionDatasetsTable
                datasetShortNames={
                  collection.datasets?.map((d) => d.datasetShortName) || []
                }
                selectedDatasets={selectedDatasets}
                onToggleSelection={handleToggleSelection}
                onSelectAll={selectAllDatasets}
                onClearAll={clearAllSelections}
                areAllSelected={allDatasetsSelected}
                areIndeterminate={isIndeterminate}
                rowClassGetter={getRowClass}
                columns={['name', 'status', 'type', 'dateRange', 'rows']}
                onDataLoaded={handleDataLoaded}
                actions={[
                  {
                    label: 'Remove',
                    onClick: (dataset) =>
                      markDatasetForRemoval(dataset.shortName),
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
                  totalSelectedRows={totalSelectedRows}
                  isOverDownloadLimit={isOverDownloadLimit}
                  canSave={canSave}
                  isSaving={isSaving}
                  onRemoveSelected={handleRemoveSelected}
                  onDownloadSelected={handleDownloadSelected}
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
          <UniversalButton
            onClick={handleDownloadSelected}
            variant="primary"
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
    </>
  );
};

export default EditCollectionModal;
