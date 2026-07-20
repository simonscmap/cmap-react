// Shown in place of the conversation when the visitor cannot yet use the agent.
//
// Three cases are covered: not signed in, signed in with the key list still
// loading, and signed in without any API key. The last case is the one the
// feature request called out specifically: the user is told a key is required
// and is sent to the existing API Key page to create one.

import React from 'react';
import { Typography, Button, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { showLoginDialog } from '../../../Redux/actions/ui';
import { keyRetrievalRequestSend } from '../../../Redux/actions/user';
import { ACCESS } from '../hooks/useAgentApiKey';
import { apiKeyManagementPath } from '../config';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: '16px',
    padding: '24px',
    height: '100%',
  },
  message: {
    color: 'var(--cmap-text-secondary)',
    maxWidth: '320px',
  },
  heading: {
    color: 'var(--cmap-text-primary)',
  },
}));

const AccessGate = (props) => {
  const { access } = props;
  const classes = useStyles();
  const dispatch = useDispatch();

  if (access === ACCESS.loadingKeys) {
    return (
      <div className={classes.container}>
        <CircularProgress size={28} />
        <Typography variant="body2" className={classes.message}>
          Checking API key access
        </Typography>
      </div>
    );
  }

  if (access === ACCESS.retrievalFailed) {
    return (
      <div className={classes.container}>
        <Typography variant="h6" className={classes.heading}>
          API keys could not be retrieved
        </Typography>
        <Typography variant="body2" className={classes.message}>
          The agent needs a CMAP API key, and the list of keys for this account
          could not be loaded. This is usually temporary.
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => dispatch(keyRetrievalRequestSend())}
        >
          Try again
        </Button>
      </div>
    );
  }

  if (access === ACCESS.loggedOut) {
    return (
      <div className={classes.container}>
        <Typography variant="h6" className={classes.heading}>
          Sign in to use the CMAP Agent
        </Typography>
        <Typography variant="body2" className={classes.message}>
          The agent answers questions about the CMAP catalog and data using a
          CMAP API key, which is available to registered users.
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => dispatch(showLoginDialog())}
        >
          Log in or register
        </Button>
      </div>
    );
  }

  // ACCESS.noKey
  return (
    <div className={classes.container}>
      <Typography variant="h6" className={classes.heading}>
        An API key is required
      </Typography>
      <Typography variant="body2" className={classes.message}>
        The CMAP Agent authenticates with a CMAP API key. No key is associated
        with this account yet. Creating one takes a moment and the agent will
        then be available on every page.
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        component={Link}
        to={apiKeyManagementPath}
      >
        Create an API key
      </Button>
    </div>
  );
};

export default AccessGate;
