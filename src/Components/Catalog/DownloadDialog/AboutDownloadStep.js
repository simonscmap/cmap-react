import React from 'react';
import { Typography } from '@material-ui/core';
import colors from '../../../enums/colors';

export const Availability = ({ availabilityStatus }) => {
  let {
    fullDatasetAvailable,
    subsetAvailable,
    subsetDataPointsCount,
  } = availabilityStatus;

  return (
    <React.Fragment>
      <Typography style={{ margin: '10px 0' }}>
        {fullDatasetAvailable
          ? `The full dataset is available for download.`
          : `The full dataset is too large for download.`}
      </Typography>
      <Typography style={{ margin: '10px 0' }}>
        {subsetAvailable
          ? 'The subset described below is available for download.'
          : `The subset described below contains approximately ${subsetDataPointsCount} data points. Maximum download size is 20000000. Please reduce the range of one or more parameters.`}
      </Typography>
    </React.Fragment>
  );
};



const AboutDownloadStep = (props) => {
  let { longName, availabilityStatus } = props;

  let availabilityMessage;

  if (availabilityStatus.fullDatasetAvailable) {
    availabilityMessage = <em style={{ color: colors.primary }}>This dataset is available for download in full.</em>;
  } else {
    availabilityMessage =
      'The full dataset is too large to download. You will be prompted to reduce the range of one or more parameters to define a subset of less that 20,000,000 data points.';
  }

  return (
    <React.Fragment>
      <Typography variant="h5" style={{ margin: '0 0 20px 0' }}>
        How to download data
      </Typography>
      <Typography style={{ margin: '10px 0' }}>
        This dialog will guide you in downloading a data from the{' '}
        <em>{longName}</em> dataset.
      </Typography>

      <Typography>
        You will be prompted to choose whether to include ancillary data,
        metadata, and if the dataset is too large you will be prompted to
        define a subset to download.
      </Typography>

      <Typography style={{ margin: '10px 0' }}>
        {availabilityMessage}
      </Typography>

      <Typography style={{ margin: '10px 0' }}>
        Please click "Next" to proceed.
      </Typography>
    </React.Fragment>
  );
};

export default AboutDownloadStep;
