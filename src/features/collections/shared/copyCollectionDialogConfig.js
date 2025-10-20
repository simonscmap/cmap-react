import React from 'react';
import { DialogContentText, makeStyles } from '@material-ui/core';
import ConfirmationDialog from '../../../shared/components/ConfirmationDialog';

const useInvalidDatasetsStyles = makeStyles((theme) => ({
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
 * Helper function to separate valid and invalid datasets from a collection.
 *
 * @param {Object} collection - Collection object with datasets array
 * @returns {Object} Object with invalidDatasets and validDatasets arrays
 */
export const checkInvalidDatasets = (collection) => {
  const invalidDatasets =
    collection?.datasets?.filter((d) => d.isInvalid === true) || [];
  const validDatasets = collection?.datasets?.filter((d) => !d.isInvalid) || [];

  return {
    invalidDatasets,
    validDatasets,
    hasInvalidDatasets: invalidDatasets.length > 0,
  };
};

/**
 * Generates the confirmation dialog configuration for copying a collection with invalid datasets.
 * This shared configuration ensures consistent messaging across the app.
 *
 * @param {Object} params - Configuration parameters
 * @param {string} params.collectionName - Name of the collection being copied
 * @param {number} params.invalidCount - Number of invalid datasets
 * @param {number} params.validCount - Number of valid datasets
 * @param {Array} params.invalidDatasets - Array of invalid dataset objects with datasetShortName property
 * @param {Function} params.onConfirm - Callback when user confirms the copy action
 * @param {Function} params.onCancel - Callback when user cancels the copy action
 * @returns {Object} Configuration object for ConfirmationDialog component
 */
export const getCopyCollectionDialogConfig = ({
  collectionName,
  invalidCount,
  validCount,
  invalidDatasets,
  onConfirm,
  onCancel,
}) => {
  const InvalidDatasetsMessage = () => {
    const classes = useInvalidDatasetsStyles();

    return (
      <>
        <DialogContentText>
          The following {invalidCount} dataset
          {invalidCount === 1 ? ' is' : 's are'} no longer available:
        </DialogContentText>
        <DialogContentText
          className={classes.invalidDatasetsList}
          component="ul"
        >
          {invalidDatasets.map((dataset, idx) => (
            <li key={idx}>
              <code>{dataset.datasetShortName}</code>
            </li>
          ))}
        </DialogContentText>
        <DialogContentText>
          Copy "{collectionName}" with {validCount} of{' '}
          {validCount + invalidCount} datasets?
        </DialogContentText>
      </>
    );
  };

  return {
    title: 'Invalid Datasets Warning',
    message: <InvalidDatasetsMessage />,
    actions: [
      {
        label: 'Cancel',
        onClick: onCancel,
        variant: 'secondary',
      },
      {
        label: 'Continue',
        onClick: onConfirm,
        variant: 'primary',
        autoFocus: true,
      },
    ],
    ariaLabelId: 'invalid-datasets-warning-title',
    ariaDescriptionId: 'invalid-datasets-warning-description',
  };
};

/**
 * Reusable confirmation dialog component for copying collections with invalid datasets.
 * Encapsulates the dialog rendering logic to eliminate code duplication.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Object|null} props.warningDialogData - Data for the warning dialog (collectionName, invalidCount, validCount, invalidDatasets)
 * @param {Function} props.onConfirm - Callback when user confirms
 * @param {Function} props.onCancel - Callback when user cancels
 */
export const InvalidDatasetConfirmationDialog = ({
  open,
  warningDialogData,
  onConfirm,
  onCancel,
}) => {
  if (!warningDialogData) return null;

  const dialogConfig = getCopyCollectionDialogConfig({
    collectionName: warningDialogData.collectionName,
    invalidCount: warningDialogData.invalidCount,
    validCount: warningDialogData.validCount,
    invalidDatasets: warningDialogData.invalidDatasets,
    onConfirm,
    onCancel,
  });

  return (
    <ConfirmationDialog
      open={open}
      onClose={dialogConfig.actions[0].onClick}
      title={dialogConfig.title}
      message={dialogConfig.message}
      actions={dialogConfig.actions}
      ariaLabelId={dialogConfig.ariaLabelId}
      ariaDescriptionId={dialogConfig.ariaDescriptionId}
    />
  );
};
