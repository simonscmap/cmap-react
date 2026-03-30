import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import colors from '../../enums/colors';

const LINE_HEIGHT = 18;
const DEFAULT_MAX_MESSAGES = 3;

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  message: {
    fontSize: '0.75rem',
    lineHeight: `${LINE_HEIGHT}px`,
  },
  error: {
    color: colors.blockingError,
  },
  info: {
    color: colors.nonBlockingInfo,
  },
  warning: {
    color: colors.nonBlockingInfo,
  },
}));

const ValidationMessages = ({ messages = [], maxMessages = DEFAULT_MAX_MESSAGES }) => {
  const classes = useStyles();
  let containerHeight = LINE_HEIGHT * maxMessages;

  let displayMessages = messages.slice(0, maxMessages);

  return (
    <Box className={classes.container} style={{ minHeight: containerHeight }}>
      {displayMessages.map((msg, index) => (
        <Typography
          key={index}
          variant="caption"
          className={`${classes.message} ${classes[msg.type] || classes.error}`}
        >
          {msg.text}
          {msg.suffix || null}
        </Typography>
      ))}
    </Box>
  );
};

export default ValidationMessages;
