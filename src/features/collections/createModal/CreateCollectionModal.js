import React, { useState, useEffect, useRef } from 'react';
import { Add } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import useCollectionsStore from '../state/collectionsStore';
import CollectionDialog from '../components/CollectionDialog';
import CollectionFormFields from '../components/CollectionFormFields';
import { useCollectionForm } from './hooks/useCollectionForm';
import { useCollectionFormValidation } from './hooks/useCollectionFormValidation';
import { useCreateCollectionModalStyles } from './styles/createCollectionModalStyles';
import UniversalButton from '../../../shared/components/UniversalButton';
import { snackbarOpen } from '../../../Redux/actions/ui';

const CreateCollectionModal = () => {
  const classes = useCreateCollectionModalStyles();
  const dispatch = useDispatch();
  const verifyCollectionName = useCollectionsStore(
    (state) => state.verifyCollectionName,
  );
  const createCollection = useCollectionsStore(
    (state) => state.createCollection,
  );

  const [open, setOpen] = useState(false);

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
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    handleClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    await submitCollection();
  };

  const submitCollection = async () => {
    setIsSubmitting(true);
    setSubmissionError('');

    try {
      const requestData = {
        collectionName: name.trim(),
        description: description || undefined,
        private: !isPublic,
        datasets: [],
      };

      await createCollection(requestData);

      dispatch(
        snackbarOpen('Collection created successfully', {
          position: 'top',
          severity: 'success',
        }),
      );
      handleClose();
    } catch (error) {
      console.error('Error creating collection:', error);

      let errorMessage = 'Failed to create collection. Please try again.';

      if (error.message.includes('logged in')) {
        errorMessage = 'You must be logged in to create collections';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      }

      dispatch(
        snackbarOpen(errorMessage, {
          position: 'top',
          severity: 'error',
        }),
      );
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
      <UniversalButton
        ref={triggerButtonRef}
        variant="primary"
        size="large"
        onClick={handleOpen}
        startIcon={<Add />}
        disableRipple
      >
        CREATE NEW COLLECTION
      </UniversalButton>

      <CollectionDialog
        open={open}
        onClose={handleClose}
        title="Create New Collection"
        showCloseButton={true}
        dialogClasses={classes.dialogPaper}
        dialogRootClass={classes.dialogRoot}
        maxWidth={false}
        disableScrollLock={true}
        ariaLabelledBy="create-collection-dialog-title"
        actions={
          <>
            <UniversalButton
              onClick={handleCancel}
              variant="default"
              size="large"
            >
              CANCEL
            </UniversalButton>
            <UniversalButton
              onClick={handleSubmit}
              variant="primary"
              size="large"
              disabled={!canSubmit}
            >
              {isSubmitting ? 'CREATING...' : 'CREATE COLLECTION'}
            </UniversalButton>
          </>
        }
      >
        <CollectionFormFields
          name={name}
          description={description}
          isPublic={isPublic}
          onNameChange={handleNameChange}
          onDescriptionChange={handleDescriptionChange}
          onVisibilityChange={handleVisibilityChange}
          onSetIsPublic={setIsPublic}
          nameValidationState={nameValidationState}
          nameErrorMessage={nameErrorMessage}
          descriptionError={descriptionError}
          isNameOverLimit={isNameOverLimit}
          isDescriptionOverLimit={isDescriptionOverLimit}
        />
      </CollectionDialog>
    </>
  );
};

export default CreateCollectionModal;
