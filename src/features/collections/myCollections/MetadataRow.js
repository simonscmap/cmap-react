import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  metadataRow: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(0.5),
    fontSize: '0.85em',
  },
  metadataLabel: {
    whiteSpace: 'nowrap',
    fontSize: '1em',
    width: '120px',
    minWidth: '120px',
    paddingRight: theme.spacing(1),
  },
  metadataValue: {
    fontSize: '1em',
    color: 'white',
    flex: 1,
  },
  datasetCount: {
    fontSize: '1em',
    color: 'white',
  },
}));

const MetadataRow = ({
  label,
  value,
  isCount = false,
  labelColor = 'rgb(135, 255, 244)',
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.metadataRow}>
      <Typography
        className={classes.metadataLabel}
        style={{ color: labelColor }}
      >
        {label}
      </Typography>
      <Typography className={classes.metadataValue}>
        {isCount ? (
          <span className={classes.datasetCount}>{value}</span>
        ) : (
          value
        )}
      </Typography>
    </Box>
  );
};

export default MetadataRow;
