import { DialogTitle, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import HelpButtonAndDialog from '../../Help/HelpButtonAndDialog';
import styles from './downloadDialogStyles';
import DownloadingDataHelpContents from './DownloadingDataHelpContents';

const Title = (props) => {
  let { longName, classes } = props;
  return (
    <DialogTitle>
      Downloading {longName}
      <HelpButtonAndDialog
        title="Downloading Data"
        content={<DownloadingDataHelpContents />}
        buttonClass={classes.helpButton}
      />
    </DialogTitle>
  );
};

export const DownloadDialogTitle = withStyles(styles)(Title);

export const Availability = ({ availabilityStatus }) => {
  let {
    fullDatasetAvailable,
    subsetAvailable,
    subsetDataPointsCount,
  } = availabilityStatus;

  return (
    <React.Fragment>
      <Typography>
        {fullDatasetAvailable
          ? `The full dataset is available for download.`
          : `The full dataset is too large for download.`}
      </Typography>
      <Typography>
        {subsetAvailable
          ? 'The subset described below is available for download.'
          : `The subset described below contains approximately ${subsetDataPointsCount} data points. Maximum download size is 20000000. Please reduce the range of one or more parameters.`}
      </Typography>
    </React.Fragment>
  );
};
