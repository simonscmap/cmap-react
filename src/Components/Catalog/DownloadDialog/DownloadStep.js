import React from 'react';
import { Button, Typography, Grid, GridItem } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import styles from './downloadDialogStyles';

const AvailabilityNote = ({ availabilityStatus }) => {
  let {
    fullDatasetAvailable,
    subsetAvailable,
    // subsetDataPointsCount,
  } = availabilityStatus;

  let message;

  if (!fullDatasetAvailable) {
    if (!subsetAvailable) {
      message =
        'The full dataset is too large to download, but the subset you have defined is ready.';
    } else {
      message =
        'The full dataset is too large, and the subset currently defined is also too large. Please go back and use the range controls to constrain the subset.';
    }
  }

  return (
    <React.Fragment>
      {message && (
        <Typography style={{ margin: '10px 0' }}>{message}</Typography>
      )}
    </React.Fragment>
  );
};
const DownloadStep = (props) => {
  let {
    availabilities,
    includeMetadata,
    includeAncillaryData,
    handleSubsetDownload,
    handleFullDatasetDownload,
    handleSubsetWithAncillaryDataDownload,
    downloadMetadata,
  } = props;

  let {
    subsetAvailable,
    fullDatasetAvailable,
    datasetHasAncillaryData,
  } = availabilities;

  return (
    <React.Fragment>
      <Grid
        container
        spacing={2}
        direction="column"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Grid item>
          <Button
            disabled={!subsetAvailable}
            onClick={handleSubsetDownload}
            color="primary"
            variant="contained"
          >
            Download Subset
          </Button>
        </Grid>

        {fullDatasetAvailable && (
          <Grid item>
            <Button
              disabled={!fullDatasetAvailable}
              onClick={handleFullDatasetDownload}
              color="primary"
              variant="contained"
            >
              Download Full Dataset
            </Button>
          </Grid>
        )}

        {includeMetadata && (
          <Grid item>
            <Button
              onClick={downloadMetadata}
              color="primary"
              variant="contained"
            >
              Download Metadata
            </Button>
          </Grid>
        )}
        {includeAncillaryData && datasetHasAncillaryData && (
          <Grid item>
            <Button
              onClick={handleSubsetWithAncillaryDataDownload}
              color="primary"
              variant="contained"
            >
              Download Subset With Ancillary Data
            </Button>
          </Grid>
        )}
      </Grid>
    </React.Fragment>
  );
};

export default withStyles(styles)(DownloadStep);
