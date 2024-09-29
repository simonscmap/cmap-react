import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import { useSelector, useDispatch } from 'react-redux';
import Spacer from '../../Common/Spacer';
import Spinner from '../../UI/Spinner';
import states from '../../../enums/asyncRequestStates';
import { showLoginDialog } from '../../../Redux/actions/ui';

const subscribe = true;
const unsubscribe = false;

const ConfirmationDialog = (props) => {
  const { setOpen, open, name, onSub } = props;
  const user = useSelector ((state) => state.user)
  const subs = useSelector ((state) => state.userSubscriptions);

  const handleClose = () => {
    setOpen (false);
  }

  const handleSubscribe = () => {
    onSub (name, true);
    setOpen (false);
  }

  const handleUnsubscribe = () => {
    onSub (name, false);
    setOpen (false);
  }

  let action = subscribe;
  if (subs && subs.find ((s) => s.Dataset_Name === name)) {
    // there is already a subscription
    action = unsubscribe;
  }

  if (!user) {
    return (
      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          PaperComponent={Paper}
          aria-labelledby="draggable-dialog-title"
        >
          <DialogTitle>
            Confirm Subscribe
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please login to update your subscriptions.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button disabled={true} onClick={handleSubscribe} color="primary">
              Subscribe
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  } if (action === subscribe) {
    return (
      <div>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={Paper}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle>
          Confirm Subscribe
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Click Subscribe to receive email notifications when <code>{name}</code> is updated, or in the event it is retired.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button disabled={!user} onClick={handleSubscribe} color="primary">
            Subscribe
          </Button>
        </DialogActions>
      </Dialog>
      </div>
    );
  } else if (action === unsubscribe) {
    return (
      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          PaperComponent={Paper}
          aria-labelledby="draggable-dialog-title"
        >
          <DialogTitle>
            Confirm Unsubscribe
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Click Unsubscribe to stop receiving email notifications for <code>{name}</code>.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button disabled={!user} onClick={handleUnsubscribe} color="primary">
              Unsubscribe
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  } else {
    return '';
  }
}

const AlertFailed = (props) => {
  const { open } = props;
  const [ isOpen, setOpen ] = useState (open);
  const handleClose = () => setOpen (false);
  return (
    <div>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        PaperComponent={Paper}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle>
          Failed to fetch subscriptions
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            There was a problem fetching your dataset subscriptions. Please refresh the page.
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

export default function ConfirmSubscriptionDialog (props) {
  const dispatch = useDispatch ();
  const user = useSelector ((state) => state.user)
  const subsReqState = useSelector ((state) => state.userSubscriptionsRequestState);

  if (props.open) {
    if (!user) {
      dispatch (showLoginDialog ());
    } if (user & subsReqState !== states.succeeded) {
      if (subsReqState === states.failed) {
        return <AlertFailed open={true} />
      } else {
        return <Spacer><Spinner message="Loading Subscriptions" /></Spacer>;
      }
    } else {
      return <ConfirmationDialog {...props} />
    }
  } else {
    return <React.Fragment />
  }

}
