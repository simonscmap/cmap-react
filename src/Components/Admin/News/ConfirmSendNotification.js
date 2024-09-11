import React, { useState, useEffect } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Alert from '@material-ui/lab/Alert';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import { safePathOr } from '../../../Utility/objectUtils';

const useStyles = makeStyles ((theme) => ({
  dialogTitle: {
    background: 'rgba(0,0,0,0.2)',
    '& h2': {
      color: 'white',
    }
  },
  contentText: {
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

const ConfirmationDialog = (props) => {
  const {
    open,
    handleClose,
    handleConfirm,
    projection,
    history,
    headline,
    previews,
  } = props;

  const safePath = safePathOr ([]) (Array.isArray);

  const subscribers = safePath (['projection', 'subscribed']) (projection);
  const newsSubscribers = safePath (['projection', 'newsSubscribers']) (projection);

  const recipientIds = [...newsSubscribers, ...subscribers].map (s => s.User_ID);
  const totalRecipients = Array.from (new Set (recipientIds));

  const cl = useStyles ();
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
          <DialogContentText className={cl.contentText}>
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
                    <TableRow>
                      <TableCell>Overlap</TableCell>
                      <TableCell>{recipientIds.length - totalRecipients.length}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>

            {(history && history.length > 0) &&
             <Typography className={cl.p}>
               {history.length} email notifications have already been sent for this news item.
             </Typography>}
          </DialogContentText>
          <div>
            <Typography>Preview</Typography>
            <div className={cl.previewContainer}>
              { previews && previews.map ((p, ix) =>
                <iframe key={ix} srcdoc={p.content} width="555" height="625"/>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button disabled={true} onClick={handleConfirm} color="primary">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ConfirmationDialog;
