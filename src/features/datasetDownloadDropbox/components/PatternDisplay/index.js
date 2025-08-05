import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { getPatternHints } from '../../utils/searchUtils';

const useStyles = makeStyles((theme) => ({
  patternContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.grey[200]}`,
  },
  patternLabel: {
    fontSize: '0.85em',
    color: theme.palette.text.secondary,
    fontWeight: 500,
    minWidth: 'fit-content',
  },
  patternHints: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
  },
  patternText: {
    fontSize: '0.85em',
    color: theme.palette.text.primary,
    fontFamily: 'monospace',
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
  },
  separatorText: {
    fontSize: '0.75em',
    color: theme.palette.text.disabled,
    fontStyle: 'italic',
  },
}));

const PatternDisplay = ({ files }) => {
  const classes = useStyles();
  
  if (!files || files.length === 0) {
    return null;
  }

  const patternHints = getPatternHints(files);
  
  if (!patternHints.first && !patternHints.last) {
    return null;
  }

  return (
    <Box className={classes.patternContainer}>
      <Typography className={classes.patternLabel}>
        Filename patterns:
      </Typography>
      <div className={classes.patternHints}>
        {patternHints.first && (
          <Typography className={classes.patternText}>
            {patternHints.first}
          </Typography>
        )}
        {patternHints.first && patternHints.last && patternHints.first !== patternHints.last && (
          <Typography className={classes.separatorText}>
            to
          </Typography>
        )}
        {patternHints.last && patternHints.first !== patternHints.last && (
          <Typography className={classes.patternText}>
            {patternHints.last}
          </Typography>
        )}
      </div>
    </Box>
  );
};

export default PatternDisplay;