import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core';
import { Close, Add } from '@material-ui/icons';
import { useCreateWithDatasets } from './hooks/useCreateWithDatasets';
import { useCreateWithDatasetsStyles } from './styles/createWithDatasetsStyles';
import CollectionFormFields from '../components/CollectionFormFields';
import CollectionDatasetsTable from '../components/CollectionDatasetsTable';
import AddDatasetsModal from '../addDatasets/AddDatasetsModal';
import ConfirmationDialog from '../../../shared/components/ConfirmationDialog';
import UniversalButton from '../../../shared/components/UniversalButton';

const CreateCollectionWithDatasetsModal = ({ open, onClose }) => {
  const classes = useCreateWithDatasetsStyles();
  const {
    // Form state
    name,
    description,
    isPublic,
    handleNameChange,
    handleDescriptionChange,
    handleVisibilityChange,
    setIsPublic,
    // Validation
    nameValidationState,
    nameErrorMessage,
    descriptionError,
    isNameOverLimit,
    isDescriptionOverLimit,
    canSubmit,
    // Dataset state
    addedDatasets,
    selectedDatasets,
    showAddDatasetsModal,
    setShowAddDatasetsModal,
    showUnsavedWarning,
    setShowUnsavedWarning,
    isSubmitting,
    // Handlers
    handleAddDatasets,
    handleRemoveDataset,
    handleRemoveSelected,
    handleToggleSelection,
    handleSelectAll,
    handleClearAll,
    areAllSelected,
    areIndeterminate,
    handleSubmit,
    resetAllState,
  } = useCreateWithDatasets();

  // Transform datasets for table
  const datasetShortNamesWithStates = useMemo(() => {
    return addedDatasets.map((dataset) => ({
      shortName: dataset.shortName,
      rowState: 'newlyAdded',
    }));
  }, [addedDatasets]);

  // Handle close with unsaved check
  const handleClose = () => {
    const hasContent = name.trim() || addedDatasets.length > 0;

    if (hasContent) {
      setShowUnsavedWarning(true);
    } else {
      resetAllState();
      onClose();
    }
  };

  const handleKeepEditing = () => {
    setShowUnsavedWarning(false);
  };

  const handleDiscardChanges = () => {
    setShowUnsavedWarning(false);
    resetAllState();
    onClose();
  };

  const handleSaveClick = async () => {
    const success = await handleSubmit();
    if (success) {
      onClose();
    }
  };

  // Event wrapper handlers for CollectionFormFields
  const handleNameChangeEvent = (event) => {
    handleNameChange(event);
  };

  const handleDescriptionChangeEvent = (event) => {
    handleDescriptionChange(event);
  };

  const handleVisibilityChangeEvent = (event) => {
    handleVisibilityChange(event);
  };

  if (!open) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        classes={{ paper: classes.dialogPaper, root: classes.dialogRoot }}
        maxWidth={false}
        disableScrollLock={true}
      >
        <DialogTitle className={classes.dialogTitle}>
          <Typography
            variant="h4"
            component="div"
            className={classes.modalTitle}
          >
            Create New Collection
          </Typography>
          <IconButton onClick={handleClose} className={classes.closeButton}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className={classes.dialogContent}>
          <Box className={classes.splitPanelContainer}>
            {/* LEFT PANEL */}
            <Box className={classes.leftPanel}>
              <CollectionFormFields
                name={name}
                description={description}
                isPublic={isPublic}
                onNameChange={handleNameChangeEvent}
                onDescriptionChange={handleDescriptionChangeEvent}
                onVisibilityChange={handleVisibilityChangeEvent}
                onSetIsPublic={setIsPublic}
                nameValidationState={nameValidationState}
                nameErrorMessage={nameErrorMessage}
                descriptionError={descriptionError}
                isNameOverLimit={isNameOverLimit}
                isDescriptionOverLimit={isDescriptionOverLimit}
              />
            </Box>

            {/* RIGHT PANEL */}
            <Box className={classes.rightPanel}>
              <Box className={classes.sectionTitleRow}>
                <Typography
                  variant="subtitle1"
                  style={{ color: '#ffffff', alignSelf: 'center' }}
                >
                  Adding {addedDatasets.length} dataset
                  {addedDatasets.length === 1 ? '' : 's'}
                </Typography>
                <UniversalButton
                  variant="containedPrimary"
                  size="large"
                  startIcon={<Add />}
                  onClick={() => setShowAddDatasetsModal(true)}
                >
                  ADD DATASETS
                </UniversalButton>
              </Box>

              <CollectionDatasetsTable
                datasetShortNamesWithStates={datasetShortNamesWithStates}
                selectedDatasets={selectedDatasets}
                onToggleSelection={handleToggleSelection}
                onSelectAll={handleSelectAll}
                onClearAll={handleClearAll}
                areAllSelected={areAllSelected}
                areIndeterminate={areIndeterminate}
                emptyMessage='No datasets have been added to this collection. Click + Add Datasets to add datasets.'
                // 'rows' column definition commented out in CollectionDatasetsTable
                columns={['name', 'status', 'type', 'dateRange', 'rows']}
                actions={[
                  {
                    label: 'Remove',
                    onClick: (dataset) =>
                      handleRemoveDataset(dataset.shortName),
                    variant: 'secondary',
                  },
                ]}
                maxHeight={500}
              />

              {/* Desktop Actions */}
              <Box className={classes.inlineActions}>
                <UniversalButton
                  onClick={handleRemoveSelected}
                  variant="secondary"
                  size="large"
                  disabled={selectedDatasets.length === 0}
                >
                  REMOVE SELECTED
                </UniversalButton>
                <Box style={{ flex: 1 }} />
                <UniversalButton
                  onClick={handleClose}
                  variant="default"
                  size="large"
                >
                  CANCEL
                </UniversalButton>
                <UniversalButton
                  onClick={handleSaveClick}
                  variant="primary"
                  size="large"
                  disabled={!canSubmit}
                >
                  {isSubmitting ? 'CREATING...' : 'CREATE COLLECTION'}
                </UniversalButton>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        {/* Mobile Actions */}
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
            disabled={!canSubmit}
          >
            {isSubmitting ? 'CREATING...' : 'CREATE COLLECTION'}
          </UniversalButton>
        </DialogActions>
      </Dialog>

      <AddDatasetsModal
        open={showAddDatasetsModal}
        onClose={() => setShowAddDatasetsModal(false)}
        onAddDatasets={handleAddDatasets}
        currentCollectionDatasets={addedDatasets}
        targetCollectionName={name || 'New Collection'}
      />

      <ConfirmationDialog
        open={showUnsavedWarning}
        onClose={handleKeepEditing}
        title="Unsaved Changes"
        message="You have unsaved changes. If you leave now, your changes will be lost. Do you want to keep editing or discard your changes?"
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
      />
    </>
  );
};

export default CreateCollectionWithDatasetsModal;
