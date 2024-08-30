import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import { SpinnerWrapper } from '../../../Components/UI/Spinner';
import states from '../../../enums/asyncRequestStates';
import { safePathOr } from '../../../Utility/objectUtils';
import generateTempId from '../../../Utility/generateTempId';

const useStyles = makeStyles ((theme) => ({
  dialogTitle: {
    background: 'rgba(0,0,0,0.2)',
    '& h2': {
      color: 'white',
    }
  },
  tableWrapper: {
    display: 'inline-block',
  },
  tableContainer: {
    margin: '1em 0',
  },
  table: {
    color: 'white',
    '& th': {
      color: 'white',
    },
    '& td': {
      color: 'white',
    }
  },
  p: {
    margin: '1em 0'
  },
  previewContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  }
}));

const Info = (props) => {
  const cl = useStyles();
  const {
    headline,
    newsSubscribers,
    subscribers,
    totalRecipients,
    history,
    previews,
  } = props;
  return (
    <div>
      <Typography className={cl.p}>
        Are you sure you want to send out email notifications for "{headline}"?
      </Typography>
      <Typography className={cl.p}>
        This action will send email notifications to {totalRecipients.length} recipents.
      </Typography>
      <div className={cl.tableWrapper}>
        <TableContainer className={cl.tableContainer}>
          <Table size="small" className={cl.table} aria-label="spanning table">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>News Subscribers</TableCell>
                <TableCell>{newsSubscribers.length}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Dataset Subscribers</TableCell>
                <TableCell>{subscribers.length}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {(history && history.length > 0) &&
       <Typography className={cl.p}>
         {history.length} email notifications have already been sent for this news item.
       </Typography>}
      <div>
        <Typography>Preview</Typography>
        <div className={cl.previewContainer}>
          { previews && previews.map ((p, ix) =>
            <iframe key={ix} srcDoc={p.content} width="555" height="625"/>
          )}
        </div>
      </div>
    </div>
  );
}


const FailedSend = () => {
  const cl = useStyles();

  return (
    <div>
      <div className={cl.errorWrapper}>
        <Typography>There was a problem sending notifications.</Typography>
      </div>
    </div>
  );
};

const SucceededSend = (props) => {
  const cl = useStyles();
  const { sentNotifications = [] } = props;

  const results = sentNotifications.map (item => item.data).flat ();
  const resultsByEmailId = results.reduce ((acc, curr) => {
    if (Array.isArray(acc[curr.emailId])) {
      acc[curr.emailId].push (curr.success);
    } else {
      acc[curr.emailId] = [curr.success];
    }
    return acc;
  }, {})

  return (
    <div>
      <div className={cl.successWrapper}>
        <Typography>The notification was sent.</Typography>
      </div>
      <Typography>Results</Typography>
      <div className={cl.tableWrapper}>
        <TableContainer className={cl.tableContainer}>
          <Table size="small" className={cl.table} aria-label="spanning table">
            <TableHead>
              <TableRow>
                <TableCell>Notification ID</TableCell>
                <TableCell>Sent</TableCell>
                <TableCell>Failed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(resultsByEmailId).map((key) => (
                <TableRow>
                  <TableCell>{key}</TableCell>
                  <TableCell>{resultsByEmailId[key].filter (x => x).length}</TableCell>
                  <TableCell>{resultsByEmailId[key].filter (x => !x).length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};


const sortByTimestamp = ({ timestamp: timeA }, {timestamp: timeB}) => {
  return timeA < timeB ? 1 : -1;
}

const safeHead = (acc, curr) => { // reduce
  if (acc) {
    return acc;
  } else if (curr) {
    return curr;
  } else {
    return null;
  }
}

const getStatus = (statuses, tempId) => {
  if (!Array.isArray (statuses) || statuses.length === 0) {
    return states.notTried;
  }

  const relevantStatuses = statuses.filter (item => item.tempId === tempId);
  const newestStatus = relevantStatuses.sort (sortByTimestamp).reduce (safeHead, null);

  if (!newestStatus) {
    return states.notTried;
  }

  if ([states.failed, states.inProgress, states.succeeded].includes (newestStatus.status)) {
    return newestStatus.status;
  }
  // else unknown, undefined
}

const ConfirmationDialog = (props) => {
  const {
    open,
    newsId,
    handleClose,
    handleConfirm,
    projection,
    history,
    headline,
    previews,
    enabled,
    statuses,
    sentNotifications,
  } = props;

  const cl = useStyles ();

  const [tempId, setTempId] = useState ();

  useEffect (() => {
    setTempId (generateTempId (newsId))
  }, [open]);

  const status = getStatus (statuses, tempId);


  const sent = sentNotifications.filter (item => item.tempId === tempId);

  const send = () => {
    handleConfirm (tempId);
  }

  const safePath = safePathOr ([]) (Array.isArray);

  const subscribers = safePath (['projection', 'subscribed']) (projection);
  const newsSubscribers = safePath (['projection', 'newsSubscribers']) (projection);

  const recipientIds = [...newsSubscribers, ...subscribers].map (s => s.userId);
  const totalRecipients = Array.from (new Set (recipientIds));

  const isEnabled = !enabled.isDirty && enabled.viewStatus === 3;

  return (
    <div>
      <Dialog
        fullWidth={true}
        maxWidth={'lg'}
        open={open}
        onClose={handleClose}
        PaperComponent={Paper}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle className={cl.dialogTitle}>
          Confirm Send Email Notification
        </DialogTitle>
        <DialogContent>
            {status === states.notTried && <Info
                                             headline={headline}
                                             history={history}
                                             subscribers={subscribers}
                                             newsSubscribers={newsSubscribers}
                                             totalRecipients={totalRecipients}
                                             previews={previews}
                                           />}
            {status === states.inProgress && <SpinnerWrapper message={'Sending...'} />}
            {status === states.failed && <FailedSend sentNotifications={sent} />}
            {status === states.succeeded && <SucceededSend sentNotifications={sent} />}
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            {status === !states.succeeded ? 'Cancel' : 'Close'}
          </Button>
          {status === states.notTried &&
           <Button disabled={!isEnabled} onClick={send} color="primary">
             Send
           </Button>
          }

        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ConfirmationDialog;
