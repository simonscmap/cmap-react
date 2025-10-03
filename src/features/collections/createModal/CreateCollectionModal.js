import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
  Typography,
  IconButton,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Add, Close } from '@material-ui/icons';
import useCollectionsStore from '../state/collectionsStore';
import PublicVisibilityWarning from './PublicVisibilityWarning';
import { useCollectionForm } from './hooks/useCollectionForm';
import { useCollectionFormValidation } from './hooks/useCollectionFormValidation';
import { useCreateCollectionModalStyles } from './styles/createCollectionModalStyles';
import CollectionButton from '../components/UniversalButton';

const CreateCollectionModal = () => {
  const classes = useCreateCollectionModalStyles();
  const verifyCollectionName = useCollectionsStore(
    (state) => state.verifyCollectionName,
  );
  const createCollection = useCollectionsStore(
    (state) => state.createCollection,
  );

  const [open, setOpen] = useState(false);
  const [showPublicWarning, setShowPublicWarning] = useState(false);

  const {
    name,
    description,
    isPublic,
    handleNameChange,
    handleDescriptionChange,
    handleVisibilityChange,
    setIsPublic,
    resetForm,
  } = useCollectionForm();

  const {
    nameValidationState,
    nameErrorMessage,
    descriptionError,
    isValid,
    resetValidation,
  } = useCollectionFormValidation(name, description, verifyCollectionName);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const triggerButtonRef = useRef(null);

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        clearFormState();
        if (triggerButtonRef.current) {
          triggerButtonRef.current.focus();
        }
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
  };

  const clearFormState = () => {
    resetForm();
    resetValidation();
    setSubmissionError('');
    setShowPublicWarning(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    handleClose();
  };

  const handleKeepPrivate = () => {
    setIsPublic(false);
    setShowPublicWarning(false);
  };

  const handleMakePublic = async () => {
    setShowPublicWarning(false);
    await submitCollection();
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    if (isPublic) {
      setShowPublicWarning(true);
      return;
    }

    await submitCollection();
  };

  const submitCollection = async () => {
    setIsSubmitting(true);
    setSubmissionError('');

    try {
      const requestData = {
        collection_name: name,
        description: description || undefined,
        private: !isPublic,
        datasets: [],
      };

      await createCollection(requestData);

      handleClose();

      showSnackbar('Collection created successfully', 'success');
    } catch (error) {
      console.error('Error creating collection:', error);

      let errorMessage = 'Failed to create collection. Please try again.';

      if (error.message.includes('logged in')) {
        errorMessage = 'You must be logged in to create collections';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      }

      setSubmissionError(errorMessage);

      showSnackbar(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNameOverLimit = name.length > 200;
  const isDescriptionOverLimit = description.length > 500;
  const canSubmit =
    isValid && !isSubmitting && !isNameOverLimit && !isDescriptionOverLimit;

  return (
    <>
      <CollectionButton
        ref={triggerButtonRef}
        variant="primary"
        size="large"
        onClick={handleOpen}
        startIcon={<Add />}
      >
        CREATE NEW COLLECTION
      </CollectionButton>

      <Dialog
        open={open}
        onClose={handleClose}
        classes={{ paper: classes.dialogPaper }}
        aria-labelledby="create-collection-dialog-title"
        disableScrollLock={true}
      >
        <DialogTitle
          id="create-collection-dialog-title"
          className={classes.dialogTitle}
        >
          Create New Collection
          <IconButton
            aria-label="close"
            onClick={handleClose}
            className={classes.closeButton}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className={classes.dialogContent}>
          <TextField
            fullWidth
            label="Collection Name"
            value={name}
            onChange={handleNameChange}
            placeholder="Enter a descriptive collection name..."
            className={classes.formField}
            variant="outlined"
            size="small"
            multiline
            InputLabelProps={{
              shrink: true,
              className: classes.fieldLabel,
            }}
            helperText={
              <div className={classes.helperTextContainer}>
                <span>
                  {isNameOverLimit ? (
                    <span className={classes.helperTextUnavailable}>
                      Collection name cannot exceed 200 characters
                    </span>
                  ) : nameValidationState === 'checking' ? (
                    <span className={classes.helperTextChecking}>
                      Checking availability...
                    </span>
                  ) : nameValidationState === 'available' ? (
                    <span className={classes.helperTextAvailable}>
                      Name is available
                    </span>
                  ) : nameValidationState === 'warning' ? (
                    <span className={classes.helperTextWarning}>
                      {nameErrorMessage}
                    </span>
                  ) : nameValidationState === 'unavailable' ? (
                    <span className={classes.helperTextUnavailable}>
                      {nameErrorMessage}
                    </span>
                  ) : null}
                </span>
                <span
                  className={
                    isNameOverLimit
                      ? classes.characterCountOverLimit
                      : classes.characterCount
                  }
                >
                  {name.length}/200 characters
                </span>
              </div>
            }
          />

          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Describe your collection's purpose, scope, or contents..."
            className={`${classes.formField} ${classes.descriptionField}`}
            variant="outlined"
            size="small"
            multiline
            minRows={8}
            InputLabelProps={{
              shrink: true,
              className: classes.fieldLabel,
            }}
            helperText={
              <div className={classes.helperTextContainer}>
                <span>
                  {isDescriptionOverLimit && (
                    <span className={classes.helperTextUnavailable}>
                      Description cannot exceed 500 characters
                    </span>
                  )}
                </span>
                <span
                  className={
                    isDescriptionOverLimit
                      ? classes.characterCountOverLimit
                      : classes.characterCount
                  }
                >
                  {description.length}/500 characters
                </span>
              </div>
            }
          />

          <FormControl
            component="fieldset"
            className={classes.visibilitySection}
          >
            <FormLabel component="legend" className={classes.visibilityLabel}>
              Visibility
            </FormLabel>
            <RadioGroup
              value={isPublic ? 'public' : 'private'}
              onChange={handleVisibilityChange}
            >
              <FormControlLabel
                value="private"
                control={<Radio color="primary" />}
                label={
                  <div>
                    <div>🔒 Private</div>
                    <Typography className={classes.radioDescription}>
                      Only you can see and access this collection
                    </Typography>
                  </div>
                }
                className={`${classes.radioLabel} ${!isPublic ? classes.radioLabelSelected : ''}`}
              />
              <FormControlLabel
                value="public"
                control={<Radio color="primary" />}
                label={
                  <div>
                    <div>🌐 Public</div>
                    <Typography className={classes.radioDescription}>
                      Visible to all CMAP users and discoverable in the public
                      collection browser
                    </Typography>
                  </div>
                }
                className={`${classes.radioLabel} ${isPublic ? classes.radioLabelSelected : ''}`}
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>

        <DialogActions className={classes.dialogActions}>
          <CollectionButton
            onClick={handleCancel}
            variant="default"
            size="medium"
          >
            Cancel
          </CollectionButton>
          <CollectionButton
            onClick={handleSubmit}
            variant="primary"
            size="medium"
            disabled={!canSubmit}
          >
            {isSubmitting ? 'Creating...' : 'Create Empty Collection'}
          </CollectionButton>
          <CollectionButton
            onClick={handleSubmit}
            variant="primary"
            size="medium"
            disabled
          >
            Create & Add Datasets
          </CollectionButton>
        </DialogActions>
      </Dialog>

      <PublicVisibilityWarning
        open={showPublicWarning}
        onKeepPrivate={handleKeepPrivate}
        onMakePublic={handleMakePublic}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateCollectionModal;
