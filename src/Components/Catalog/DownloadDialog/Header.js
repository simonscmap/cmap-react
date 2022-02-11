import { DialogTitle, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import styles from './downloadDialogStyles';

const Title = (props) => {
  let { longName, classes } = props;
  return (
    <DialogTitle className={classes.dialogTitle}>
      <Typography variant="h3">Download Dataset</Typography>
      <Typography variant="body1">{longName}</Typography>
    </DialogTitle>
  );
};

export const DownloadDialogTitle = withStyles(styles)(Title);
