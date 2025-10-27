import React from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import UniversalButton from '../../../../shared/components/UniversalButton';

const useStyles = makeStyles((theme) => ({
  actionsContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  cancelButton: {
    marginRight: theme.spacing(1),
  },
  saveButton: {
    position: 'relative',
  },
  loadingSpinner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}));

/**
 * EditCollectionActions
 *
 * Footer component containing Cancel and Save Changes action buttons for the
 * Edit Collection page. Displays loading state during save operations and
 * manages button disabled states based on form validation and unsaved changes.
 *
 * @param {function} onCancel - Callback when user clicks Cancel button
 * @param {function} onSave - Callback when user clicks Save Changes button
 * @param {boolean} hasUnsavedChanges - Whether the collection has unsaved changes
 * @param {boolean} canSave - Whether the Save button should be enabled (based on validation)
 * @param {boolean} isSaving - Whether a save operation is in progress
 */
const EditCollectionActions = ({
  onCancel,
  onSave,
  hasUnsavedChanges,
  canSave,
  isSaving,
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.actionsContainer}>
      <UniversalButton
        onClick={onCancel}
        variant="secondary"
        size="medium"
        className={classes.cancelButton}
      >
        Cancel
      </UniversalButton>
      <UniversalButton
        onClick={onSave}
        variant="containedPrimary"
        size="medium"
        className={classes.saveButton}
        disabled={!canSave || isSaving}
      >
        {isSaving ? (
          <>
            Saving...
            <CircularProgress
              size={24}
              className={classes.loadingSpinner}
              color="inherit"
            />
          </>
        ) : (
          'Save Changes'
        )}
      </UniversalButton>
    </Box>
  );
};

EditCollectionActions.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  hasUnsavedChanges: PropTypes.bool.isRequired,
  canSave: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
};

export default EditCollectionActions;
