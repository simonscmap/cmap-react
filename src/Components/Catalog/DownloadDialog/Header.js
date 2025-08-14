import { DialogTitle, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import styles from '../../../features/datasetDownload/styles/downloadDialogStyles';

const Title = (props) => {
  let { longName, classes } = props;
  return (
    <DialogTitle className={classes.dialogTitle}>
      <div className={classes.dialogMainTitle}>Download Dataset</div>
      <Typography variant="body1">{longName}</Typography>
    </DialogTitle>
  );
};

export const DownloadDialogTitle = withStyles(styles)(Title);
