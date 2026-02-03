import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const LINE_HEIGHT = 18;
const MAX_MESSAGES = 3;
const CONTAINER_HEIGHT = LINE_HEIGHT * MAX_MESSAGES;

const useStyles = makeStyles(() => ({
  container: {
    minHeight: CONTAINER_HEIGHT,
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  message: {
    fontSize: '0.75rem',
    lineHeight: `${LINE_HEIGHT}px`,
  },
  error: {
    color: '#f44336',
  },
  info: {
    color: '#fdd835',
  },
  warning: {
    color: '#ff9800',
  },
}));

const ValidationMessages = ({ messages = [] }) => {
  const classes = useStyles();

  const displayMessages = messages.slice(0, MAX_MESSAGES);

  return (
    <Box className={classes.container}>
      {displayMessages.map((msg, index) => (
        <Typography
          key={index}
          variant="caption"
          className={`${classes.message} ${classes[msg.type] || classes.error}`}
        >
          {msg.text}
        </Typography>
      ))}
    </Box>
  );
};

export default ValidationMessages;
