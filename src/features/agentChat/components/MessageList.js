// The scrolling conversation area.

import React, { useEffect, useRef } from 'react';
import { Typography, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ChatMessage from './ChatMessage';

const useStyles = makeStyles(() => ({
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
  },
  empty: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: '10px',
    color: 'var(--cmap-text-secondary)',
    padding: '16px',
  },
  emptyHeading: {
    color: 'var(--cmap-text-primary)',
  },
  suggestions: {
    marginTop: '6px',
    textAlign: 'left',
    maxWidth: '320px',
  },
  suggestion: {
    color: 'var(--cmap-text-secondary)',
    fontSize: '0.82rem',
    marginBottom: '4px',
  },
  thinking: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--cmap-text-secondary)',
    fontSize: '0.82rem',
    padding: '4px 2px 10px 2px',
  },
}));

const EXAMPLES = [
  'Which datasets include chlorophyll measurements in the North Pacific?',
  'Summarize the variables available in the BATS program.',
  'How do I colocalize a cruise track with satellite SST?',
];

const MessageList = (props) => {
  const { messages, status } = props;
  const classes = useStyles();
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current && endRef.current.scrollIntoView) {
      endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length, status]);

  if (messages.length === 0 && status !== 'restoring' && status !== 'uploading') {
    return (
      <div className={classes.list}>
        <div className={classes.empty}>
          <Typography variant="h6" className={classes.emptyHeading}>
            Ask the CMAP Agent
          </Typography>
          <Typography variant="body2">
            Questions about the catalog, variables, cruises, and how to work
            with CMAP data.
          </Typography>
          <div className={classes.suggestions}>
            {EXAMPLES.map((example) => (
              <div key={example} className={classes.suggestion}>
                {`- ${example}`}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.list}>
      {status === 'restoring' ? (
        <div className={classes.thinking}>
          <CircularProgress size={14} />
          Restoring the conversation
        </div>
      ) : null}

      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {status === 'uploading' ? (
        <div className={classes.thinking}>
          <CircularProgress size={14} />
          Uploading the attached file
        </div>
      ) : null}

      {status === 'sending' ? (
        <div className={classes.thinking}>
          <CircularProgress size={14} />
          The agent is working. Answers that require querying data can take a
          while.
        </div>
      ) : null}

      <div ref={endRef} />
    </div>
  );
};

export default MessageList;
