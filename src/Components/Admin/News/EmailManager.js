import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import Collapse from '@material-ui/core/Collapse';
import { Button } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import dayjs from 'dayjs';

import states from '../../../enums/asyncRequestStates';
import generateKey from './generateKey';

import ConfirmationDialog from './ConfirmSendNotification';
import Confirmation from '../../Common/Confirmation';

import {
  notificationHistory,
  notificationRecipientProjections,
  notificationRecipientProjectionsRequestStatus,
} from './newsSelectors';

import {
  fetchNotificationHistory,
  fetchNotificationRecipientProjection,
  fetchNotificationPreviews,
  sendNotifications,
  reSendNotifications,
} from '../../../Redux/actions/notifications';


// Warning
const Warning = (props) => (
  <Alert severity="warning">
    {props.message || 'Warning'}
  </Alert>
);


// Button
export const CustomButton = withStyles((theme) => ({
  root: {
    color: 'white',
    backgroundColor: 'transparent',
    border: `2px solid ${theme.palette.primary.main}`,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: '#000000',
    },
    margin: 0,
    borderRadius: '25px',
    boxSizing: 'border-box',
    padding: '0 10px',
    fontSize: '16px',
    fontWeight: 500,
    fontFamily: ['Montserrat', 'sans-serif'].join(','),
    letterSpacing: '0.03em',
    '&.Mui-disabled': {
      color: 'rgba(255,255,255,0.2)',
      border: `2px solid rgba(255,255,255,0.3)`,
      '&:hover': {
        backgroundColor: 'transparent',
        color: 'rgba(255,255,255,0.3)',
      }
    }
  },
}))(Button);

const useFTableStyles = makeStyles ({
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
      borderBottom: '0px solid transparent'
    }
  },
});

const FailureTable = (props) => {
  const { failures } = props;
  const cl = useFTableStyles ();

  if (!failures || failures.length === 0) {
    return <Typography>Failed to deliver: 0</Typography>;
  }

  const renderDate = (dateString) => {
    const d = new Date (dateString);
    return `${d.toDateString()} at ${d.toLocaleTimeString()}`;
  };

  return (
    <div>
      <Typography>Failed to deliver: {failures.length}</Typography>
      <TableContainer className={cl.tableContainer}>
        <Table size="small" className={cl.table} aria-label="spanning table">
          <TableHead>
            <TableRow>
              <TableCell>User Email</TableCell>
              <TableCell>Attempts</TableCell>
              <TableCell>Last Attempt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {failures.map ((f, fix) => (<TableRow key={`failureRow${fix}`}>
                                          <TableCell>{f.userEmail}</TableCell>
                                          <TableCell>{f.attempt === 0 ? '0' : f.attempt ? f.attempt : 'NA'}</TableCell>
                                          <TableCell>{f.lastAttempt ? renderDate (f.lastAttempt) : f.lastAttempt}</TableCell>
                                        </TableRow>))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}


// History Table Row
const useRowStyles = makeStyles((theme) => ({
  root: {
    '& td': {
      borderBottom: 0,
    }
  },
  expandedContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2em',
    padding: '2em',
  },
  subHeader: {
    color: '#69FFF2',
    fontSize: '16px',
    textTransform: 'uppercase',
    marginBottom: '1em',
  },
  datasetIcon: {
    width: '200px',
    objectFit: 'cover',
  },
  refreshButton: {
    color: theme.palette.primary.main,
    '&:hover': {
      color: '#69FFF2',
    },
    border: `1px solid ${theme.palette.primary.main}`
  },
}));

const getRecipientInfo = (recipients) => {
  if (!Array.isArray (recipients)) {
    return {};
  }
  const totalRecipients = recipients.length || 0;
  const successes = recipients.filter (r => r.success).length;
  const failures = recipients.filter (r => !r.success);
  const successRate = Math.floor (successes / totalRecipients * 100);
  const lastAttemptOverall = recipients.reduce ((mostRecent, curr) => {
    const currLastAttempt = new Date (curr.lastAttempt);
    if (currLastAttempt > mostRecent) {
      return currLastAttempt;
    }
    return mostRecent;
  }, (new Date ('1900')));

  return {
    successes,
    failures,
    successRate,
    lastAttemptOverall,
    totalRecipients,
  }
}

function Row(props) {
  const { row, reSend } = props;
  const { recipients = [] } = row;
  const cl = useRowStyles();

  const [expand, setExpand] = useState (false);
  const [openConfirm, setOpenConfirm] = useState (false);
  const [now, setNow] = useState (new Date());

  const updateNow = () => {
    const newNow = new Date();
    setNow (newNow);
  }

  useEffect (() => {
    // every 10 seconds update the time
    const id = setInterval (updateNow, 1000 * 10);
    return () => {
      clearInterval (id);
    }
  },[])

  const {
    successes,
    failures,
    successRate,
    totalRecipients,
    lastAttemptOverall,
  } = getRecipientInfo (recipients);

  const resendConfirmationProps = {
    open: openConfirm,
    openClose: setOpenConfirm,
    loading: false,
    error: false,
    name: `Confirm Re-Send Email ${row.Subject}`,
    text: `Click "Send" to re-send this email to the ${failures ? failures.length : '0'} recipients for whom previous notification attempts failed.`,
    onConfirm: () => {
      reSend (row.Email_ID);
      setOpenConfirm (false);
    },
  };

  const date = new Date (row.Date_Time);
  const displayDate = `${date.toDateString()} at ${date.toLocaleTimeString()}`;


  // if latest attempt to send notifications is within 5 minutes, flag cooldown
  const cooldown = dayjs (lastAttemptOverall).isAfter (dayjs(now).subtract (5, 'm'));

  return (
    <React.Fragment>
      <Confirmation {...resendConfirmationProps} />
      <TableRow className={cl.root}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setExpand(!expand)}>
            {expand ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.Email_ID}</TableCell>
        <TableCell>{displayDate}</TableCell>
        <TableCell>{row.Subject}</TableCell>
        <TableCell>{totalRecipients}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={expand} timeout="auto" unmountOnExit>
            <div className={cl.expandedContent}>
              <div>
                <Typography className={cl.subHeader}>Recipients</Typography>
                <Typography>Delivery success rate: {successRate ? `${successRate}%`: 'NA'}</Typography>
                <Typography>Number delivered: {successes ? `${successes}` : 'NA'}</Typography>
                <FailureTable failures={failures} />
                {(failures && failures.length > 0) &&
                 <Button disabled={cooldown} onClick={() => setOpenConfirm (true)} className={cl.refreshButton}>
                  <RefreshIcon /> {'Re-send to undelivered addresses'}
                </Button>}
              </div>

              <div className={cl.previewContainer}>
                <Typography className={cl.subHeader}>Preview</Typography>
                <iframe srcDoc={row.Body} width="555" height="625"/>
              </div>
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// Email Manager Main Render
const useStyles = makeStyles ((theme) => ({
  container: {
    // gridColumn: '2 / span 2',
    // gridRow: '4 / span 1',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  subSection: {
    flex: 1,
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '5px',
    padding: '1em',
    marginTop: '1em',
    boxSizing: 'border-box',
    height: '100%',
  },
  topLine: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '1em'
  },
  refreshButton: {
    color: theme.palette.primary.main,
    '&:hover': {
      color: '#69FFF2',
    },
  },
  subTitle: {
    color: '#69FFF2',
    fontSize: '16px',
    textTransform: 'uppercase',
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
      borderBottom: '0px solid transparent'
    }
  },

}));

const EmailManagerPure = (props) => {
  const {
    newsId,
    history,
    projection,
    headline,
    previews,
    getPreviews,
    send,
    reSend,
    refresh,
    enabled,
    sentNotifications,
    statuses,
  } = props;
  const cl = useStyles ();

  // confirmation dialog controls
  const [open, setOpen] = useState (false);

  useEffect (() => {
    if (open && !previews) {
      getPreviews ();
    }
  }, [open, previews]);

  const handleClose = () => {
    setOpen (false);
  }
  const handleConfirm = (tempId) => {
    send (tempId);
  }

  return (
    <div className={cl.container}>
      <ConfirmationDialog
        open={open}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
        projection={projection}
        history={history}
        headline={headline}
        previews={previews}
        enabled={enabled}
        newsId={newsId}
        statuses={statuses}
        sentNotifications={sentNotifications}
      />
      <Typography className={cl.title}>Notifications</Typography>
      <div className={cl.subSection}>
        <div className={cl.topLine}>
          <Typography className={cl.subTitle}>History</Typography>
          <div className={cl.actions}>
            <Tooltip title={'Refresh Notification History, Preview, and Recipient Information'}>
              <Button variant="outlined" onClick={refresh} className={cl.refreshButton}>
                <RefreshIcon />
              </Button>
            </Tooltip>
            <CustomButton
              className={cl.sendButton}
              onClick={() => setOpen (true)}
              disabled={history && history.length > 1}
            >
              {`Preview & Send Email Notification`}
            </CustomButton>
          </div>
        </div>

        {(history && history.length > 1) &&
         <Warning message="Detected more than one email notification for this news item!" />
        }
        <TableContainer className={cl.tableContainer}>
          <Table size="small" className={cl.table} aria-label="spanning table">
            <TableHead>
              <TableRow>
                <TableCell className={cl.colHead}>{/* no header for expand control */}</TableCell>
                <TableCell className={cl.colHead}>Email ID</TableCell>
                <TableCell className={cl.colHead}>Date Sent</TableCell>
                <TableCell className={cl.colHead}>Subject</TableCell>
                <TableCell className={cl.colHead}>Recipients</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray (history) && history.map((g, i) => (<Row key={`${i}`} row={g} reSend={reSend} />))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}


const shouldDispatch = (status) => {
  return !status || ![states.inProgress, states.failed].includes (status);
}

// Email Manager State
const EmailManager = (props) => {
  const { newsId, tags, headline, enabled, modDate } = props;

  const dispatch = useDispatch ();
  const history = useSelector (notificationHistory);
  const projections = useSelector (notificationRecipientProjections);
  const previews = useSelector ((state) => state.notificationPreviews);
  const projectionRequestStatus = useSelector (notificationRecipientProjectionsRequestStatus);
  const notificationStatuses = useSelector ((state) => state.sendNotificationsStatus
                                            .filter (item => item.newsId === newsId));
   const sentNotifications = useSelector ((state) => state.sentNotifications
                                            .filter (item => item.newsId === newsId));

  const [storyHistory, setStoryHistory] = useState (null);
  const [projection, setProjection] = useState(null);

  useEffect (() => {
    if (newsId) {
      dispatch (fetchNotificationHistory ({ newsId }));
    } else {
      console.log ('cannot fetch notification history: missing newsId')
    }
  },[]);

  useEffect (() => {
    if (history && newsId) {
      if (history[newsId]) {
        setStoryHistory (history[newsId]);
      } else {
        console.log ('no history found for newsId', { newsId, history })
      }
    }
  }, [history]);

  useEffect (() => { // when to dispatch?
    const key = generateKey (tags);
    const status = projectionRequestStatus
          && projectionRequestStatus[key]
          && projectionRequestStatus[key].status;
    const p = projections && projections[key];

    if (!p && shouldDispatch (status)) { // 1. if there are no projections or projection requests in progress/failed
      dispatch (fetchNotificationRecipientProjection ({ tags }));
    } else if (p) {
      setProjection (p);
    }
  }, [projections, projectionRequestStatus, tags]);

  const getPreviews = () => {
    if (!newsId) {
      console.log ('no news id; cannot fetch preview');
    } else {
      dispatch (fetchNotificationPreviews ({ newsId }));
    }
  }

  const refresh = () => {
    dispatch (fetchNotificationRecipientProjection ({ tags }));
    dispatch (fetchNotificationPreviews ({ newsId }));
    dispatch (fetchNotificationHistory ({ newsId }));
  }

  const send = (tempId) => {
    dispatch (sendNotifications ({ newsId, tempId, modDate }));
  }

  const reSend = (emailId) => {
    dispatch (reSendNotifications ({ newsId, emailId }));
  }

  return <EmailManagerPure
           history={storyHistory || []}
           projection={projection}
           headline={headline}
           getPreviews={getPreviews}
           previews={previews}
           newsId={newsId}
           send={send}
           reSend={reSend}
           refresh={refresh}
           enabled={enabled}
           statuses={notificationStatuses}
           sentNotifications={sentNotifications}
         />
}

export default EmailManager;
