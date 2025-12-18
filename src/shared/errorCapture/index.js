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
import { getBreadcrumbs } from './breadcrumbs';

dayjs.extend(utc);
dayjs.extend(tz);

let setError = null;

// Expected HTTP statuses - filtered out (not bugs, we handle these)
const EXPECTED_HTTP_STATUSES = [400, 401, 403, 404, 409];

function captureError(error, additionalContext) {
  const context = additionalContext || {};
  const status = error.status || context.status;

  if (status && EXPECTED_HTTP_STATUSES.includes(status) && !context.force) {
    return;
  }

  const sentryEventId = Sentry.captureException(error);
  if (setError) {
    setError({
      error: error,
      stack: error.stack || 'No stack trace available',
      sentryEventId: sentryEventId,
      context: {
        url: window.location.href,
        route: window.location.pathname,
        status: status,
        ...context,
      },
      breadcrumbs: getBreadcrumbs(),
      timestamp:
        dayjs().tz('America/Los_Angeles').format('MM/DD/YYYY, hh:mm:ss A') +
        ' PST',
    });
  }
}

const useStyles = makeStyles((theme) => {
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
  const classes = useStyles();
  const [data, setData] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setError = setData;
    return () => {
      setError = null;
    };
  }, []);

  const handleCloseButtonClick = useCallback(() => {
    setData(null);
    setCopySuccess(false);
  }, []);

  const getDisplayText = () => {
    if (!data) return '';

    const context = data.context || {};
    const breadcrumbs = data.breadcrumbs || [];
    const lines = [];

    lines.push('=== ERROR REPORT ===');
    lines.push('Timestamp: ' + (data.timestamp || 'unknown'));
    lines.push('URL: ' + (context.url || 'unknown'));
    if (data.sentryEventId) {
      lines.push('Sentry ID: ' + data.sentryEventId);
    }
    lines.push('');

    lines.push('=== ERROR ===');
    lines.push(data.stack || 'No stack trace available');
    lines.push('');

    lines.push('=== RECENT ACTIVITY ===');
    const recentBreadcrumbs = breadcrumbs.slice(-20);
    recentBreadcrumbs.forEach((bc) => {
      const time = bc.localTimestamp
        ? bc.localTimestamp.split('T')[1].split('.')[0]
        : '';
      const category = bc.category || 'unknown';
      const detail =
        bc.message ||
        (bc.data && bc.data.url) ||
        (bc.data ? JSON.stringify(bc.data) : 'no details');
      lines.push(time + ' [' + category + '] ' + detail);
    });

    return lines.join('\n');
  };

  const handleCopy = useCallback(() => {
    if (data) {
      navigator.clipboard.writeText(getDisplayText()).then(() => {
        setCopySuccess(true);
        setTimeout(() => {
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
      onClose={(_, reason) => {
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
          Please copy the error details below and share them with the
          development team.
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
export { addBreadcrumb, getBreadcrumbs } from './breadcrumbs';
