import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';

import { showLoginDialog } from '../../Redux/actions/ui';
import { SpinnerWrapper } from '../UI/Spinner';
import { homeTheme } from '../Home/theme';

// Make a common experience for confirmation dialogs;

const Alert = (props) => {
  const { open, errorMessage, openClose } = props;
  const handleClose = () => {
    openClose (false);
  }
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={Paper}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle>
          {'Error'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

const DialogComponent = (props) => {
  const {
    open,
    openClose,
    name = "Confirm Action",
    text = "",
    actionButtonText = "Confirm",
    actionButtonDisabled = false,
    onConfirm,
    cancelButtonText = "Cancel",
    onCancel,
  } = props;

  const handleCancel = onCancel || (() => {
    openClose (false);
  });
  const handleConfirm = onConfirm || (() => {
    onConfirm ();
  });

  return (
    <div>
      <ThemeProvider theme={homeTheme}>
        <Dialog
          open={open}
          PaperComponent={Paper}
          aria-labelledby="draggable-dialog-title"
        >
          <DialogTitle>{name}</DialogTitle>
          <DialogContent>
            <DialogContentText>{text}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={handleCancel} color="primary">
              {cancelButtonText}
            </Button>
            <Button
              disabled={actionButtonDisabled}
              onClick={handleConfirm} color="primary">
              {actionButtonText}
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>

    </div>
  );
}

// Generic Confirmation Dialog
// - when open, checks if user is logged in
// - all actions are provided by props
const GenericConfirmationDialog = (props) => {
  const dispatch = useDispatch ();
  const user = useSelector ((state) => state.user);
  const loginIsActive = useSelector ((state) => state.loginDialogIsOpen);

  const {
    open,
    openClose,
    loading,
    loadingMsg,
    error,
    errorMsg,
    name
    // text
    // actionButtonText
    // actionButtonDisabled
    // onConfirm
    // cancelButtonText
    // onCancel
  } = props;

  const [openState, setOpenState] = useState(open);

  useEffect(() => {
    if (openState !== open) {
      setOpenState (open);
    }
  }, [open]);

  useEffect (() => {
    if (openState && !user) {
      dispatch (showLoginDialog ());
    }
  }, [openState, user])

  if (!openState) {
    return <React.Fragment />
  }

  if (openState) {
    if (loading) {
      const msg = loadingMsg || 'Loading...'
      return <SpinnerWrapper message={msg} />
    }

    if (error) {
      return <Alert {...props} />
    }

    return <DialogComponent {...props} />;
  }
}

export default GenericConfirmationDialog;
