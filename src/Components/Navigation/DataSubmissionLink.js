import React from 'react';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import states from '../../enums/asyncRequestStates';

const useStyles = makeStyles ((theme) => ({
  dialog: {
    '& .MuiBackdrop-root': {
      background: 'rgba(0,0,0,0.3)'
    }
  },
  paper: {
    background: 'rgba(0,0,0,.9)',
    maxWidth: '500px',
  }
}));


const PaperComponent = (props) => {
  const cl = useStyles();
  return <Paper {...props} className={cl.paper}/>
};

const Confirmation = (props) => {
  const cl = useStyles();
  const { onClose, open } = props;

  const handleDiscard = () => {
    onClose(true);
  };

  const handleCancel = () => {
    onClose(false);
  };

  const p1 = 'To start over with your data submission, click continue. This will discard any changes you have made. Otherwise, use the "Back" and "Next" buttons to navigate the steps of the Data Submission tool.';

  return (
    <Dialog open={open} className={cl.dialog} PaperComponent={PaperComponent}>
      <DialogTitle id="confirm-navigate">Please Confirm</DialogTitle>
      <DialogContent>
    <Typography>{p1}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleDiscard} color="primary">Discard and Continue</Button>
      <Button onClick={handleCancel} color="secondary">Cancel</Button>
    </DialogActions>
    </Dialog>
  );
}

export default function DataSubmissionLink() {
  const [open, setOpen] = React.useState(false);
  const history = useHistory();

  const submissionFile = useSelector ((state) => state.submissionFile);
  const submissionUploadState = useSelector ((state) => state.submissionUploadState);

  const handleClick = () => {
    if (submissionFile) {
      // add a hash to trigger menu close
      history.push ('/datasubmission/validationtool#confirm');
      setOpen (true);
    } else if (submissionUploadState === states.succeeded) {
      window.location.href = '/datasubmission/validationtool';
    } else {
      history.push ('/datasubmission/validationtool');
    }
  }

  const onClose = (val) => {
    if (val) {
      window.location.href = '/datasubmission/validationtool';
    } else {
      setOpen(false);
      // restore location
      history.push ('/datasubmission/validationtool');
    }
  };

  return (
    <React.Fragment>
      <a onClick={handleClick}>Submit Data</a>
      <Confirmation open={open} onClose={onClose}/>
    </React.Fragment>
  );
}
