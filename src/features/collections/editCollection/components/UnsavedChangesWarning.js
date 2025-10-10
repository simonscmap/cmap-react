import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import UniversalButton from '../../../../shared/components/UniversalButton';

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    paddingBottom: theme.spacing(1),
  },
  dialogContent: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  dialogActions: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
  },
  keepEditingButton: {
    marginRight: theme.spacing(1),
  },
}));

/**
 * UnsavedChangesWarning
 *
 * Confirmation dialog shown when user attempts to navigate away from the edit page
 * with unsaved changes. Warns user about losing changes and allows them to continue
 * editing or discard changes.
 *
 * @param {boolean} open - Whether the warning dialog is visible
 * @param {function} onKeepEditing - Callback when user chooses to keep editing
 * @param {function} onDiscardChanges - Callback when user confirms discarding changes
 */
const UnsavedChangesWarning = ({ open, onKeepEditing, onDiscardChanges }) => {
  const classes = useStyles();

  const handleClose = () => {
    onKeepEditing();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="unsaved-changes-warning-title"
      aria-describedby="unsaved-changes-warning-description"
      aria-modal="true"
      disableScrollLock={true}
    >
      <DialogTitle
        id="unsaved-changes-warning-title"
        className={classes.dialogTitle}
      >
        Unsaved Changes
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <DialogContentText id="unsaved-changes-warning-description">
          You have unsaved changes to this collection. If you leave now, your
          changes will be lost. Do you want to keep editing or discard your
          changes?
        </DialogContentText>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <UniversalButton
          onClick={onKeepEditing}
          variant="primary"
          size="medium"
          className={classes.keepEditingButton}
          autoFocus
        >
          Keep Editing
        </UniversalButton>
        <UniversalButton
          onClick={onDiscardChanges}
          variant="secondary"
          size="medium"
        >
          Discard Changes
        </UniversalButton>
      </DialogActions>
    </Dialog>
  );
};

export default UnsavedChangesWarning;
