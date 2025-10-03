import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CollectionButton from '../../../shared/components/UniversalButton';

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
  keepPrivateButton: {
    marginRight: theme.spacing(1),
  },
}));

/**
 * PublicVisibilityWarning
 *
 * Confirmation dialog shown when user attempts to make a collection public.
 * Warns user about public visibility and allows them to keep the collection private.
 *
 * @param {boolean} open - Whether the warning dialog is visible
 * @param {function} onKeepPrivate - Callback when user chooses to keep collection private
 * @param {function} onMakePublic - Callback when user confirms public visibility
 */
const PublicVisibilityWarning = ({ open, onKeepPrivate, onMakePublic }) => {
  const classes = useStyles();

  const handleClose = () => {
    onKeepPrivate();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="public-visibility-warning-title"
      aria-describedby="public-visibility-warning-description"
      aria-modal="true"
      disableScrollLock={true}
    >
      <DialogTitle
        id="public-visibility-warning-title"
        className={classes.dialogTitle}
      >
        Public Collection Notice
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <DialogContentText id="public-visibility-warning-description">
          This collection will be public and visible to all CMAP users. Other
          users will be able to discover and view this collection in the public
          collection browser.
        </DialogContentText>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <CollectionButton
          onClick={onMakePublic}
          variant="primary"
          size="medium"
          autoFocus
        >
          OK
        </CollectionButton>
      </DialogActions>
    </Dialog>
  );
};

export default PublicVisibilityWarning;
