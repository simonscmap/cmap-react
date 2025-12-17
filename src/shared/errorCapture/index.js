import React, { useState, useEffect, useCallback } from 'react';
import * as Sentry from '@sentry/react';
import * as dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import CheckIcon from '@material-ui/icons/Check';
import zIndex from '../../enums/zIndex';

dayjs.extend(utc);
dayjs.extend(tz);

var setError = null;

function captureError(error) {
  Sentry.captureException(error);
  if (setError) {
    setError({
      error: error,
      timestamp: dayjs().tz('America/Los_Angeles').format('MM/DD/YYYY, hh:mm:ss A') + ' PST',
    });
  }
}

var useStyles = makeStyles(function (theme) {
  return {
    dialogRoot: {
      zIndex: zIndex.SNACKBAR + ' !important',
    },
    dialogPaper: {
      backgroundColor: 'rgb(24, 69, 98)',
      minWidth: 500,
      maxWidth: 700,
    },
    header: {
      display: 'flex',
      justifyContent: 'flex-end',
      padding: theme.spacing(0.5),
    },
    closeButton: {
      color: '#fff',
      padding: theme.spacing(0.5),
    },
    contentContainer: {
      padding: theme.spacing(2),
      paddingTop: 0,
      maxHeight: 400,
      overflow: 'auto',
    },
    instructionText: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '0.85rem',
      marginBottom: theme.spacing(2),
      fontStyle: 'italic',
    },
    errorText: {
      fontFamily: 'monospace',
      fontSize: 12,
      color: '#fff',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      padding: theme.spacing(1),
      borderRadius: 4,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      userSelect: 'text',
    },
    actionsContainer: {
      padding: theme.spacing(2),
      justifyContent: 'flex-end',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    },
    copyButton: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
      backgroundColor: '#1976d2',
      color: '#fff',
      padding: theme.spacing(1, 2),
      borderRadius: 4,
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      '&:hover': {
        backgroundColor: '#1565c0',
      },
    },
    copySuccessButton: {
      backgroundColor: '#4caf50',
      '&:hover': {
        backgroundColor: '#43a047',
      },
    },
    copyIcon: {
      fontSize: 18,
    },
  };
});

function ErrorDisplayOverlay() {
  var classes = useStyles();
  var [data, setData] = useState(null);
  var [copySuccess, setCopySuccess] = useState(false);

  useEffect(function () {
    setError = setData;
    return function () {
      setError = null;
    };
  }, []);

  var handleCloseButtonClick = useCallback(function () {
    setData(null);
    setCopySuccess(false);
  }, []);

  var getDisplayText = function () {
    if (!data) return '';
    return data.timestamp + '\n' + data.error.stack;
  };

  var handleCopy = useCallback(function () {
    if (data) {
      navigator.clipboard.writeText(getDisplayText()).then(function () {
        setCopySuccess(true);
        setTimeout(function () {
          setCopySuccess(false);
        }, 2000);
      });
    }
  }, [data]);

  if (!data) {
    return null;
  }

  return (
    <Dialog
      open={true}
      onClose={function (event, reason) {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
          setData(null);
        }
      }}
      classes={{ paper: classes.dialogPaper, root: classes.dialogRoot }}
      disableScrollLock={true}
      disableEscapeKeyDown={true}
    >
      <div className={classes.header}>
        <IconButton
          className={classes.closeButton}
          onClick={handleCloseButtonClick}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </div>
      <DialogContent className={classes.contentContainer}>
        <div className={classes.instructionText}>
          Please copy the error details below and share them with the development team.
        </div>
        <div className={classes.errorText}>{getDisplayText()}</div>
      </DialogContent>
      <DialogActions className={classes.actionsContainer}>
        <button
          className={
            copySuccess
              ? classes.copyButton + ' ' + classes.copySuccessButton
              : classes.copyButton
          }
          onClick={handleCopy}
        >
          {copySuccess ? (
            <CheckIcon className={classes.copyIcon} />
          ) : (
            <FileCopyIcon className={classes.copyIcon} />
          )}
          {copySuccess ? 'Copied!' : 'Copy Error Details'}
        </button>
      </DialogActions>
    </Dialog>
  );
}

export { captureError, ErrorDisplayOverlay };
