import { Button, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import styles from './downloadDialogStyles';

const DownloadStep = (props) => {
  let { handlers, options } = props;

  let {
    handleSubsetDownload,
    handleSubsetWithAncillaryDataDownload,
    downloadMetadata,
  } = handlers;

  let { includeAncillaryData } = options;

  let downloadHandler = () => {
    console.log('download handler');
    if (includeAncillaryData) {
      handleSubsetWithAncillaryDataDownload();
    } else {
      handleSubsetDownload();
    }
  };

  return (
    <React.Fragment>
      <Grid
        container
        spacing={2}
        direction="row"
        justifyContent="flex-end"
        alignItems="flex-start"
      >
        <Grid item>
          <Button onClick={downloadHandler} color="primary" variant="contained">
            Download Dataset
          </Button>
        </Grid>

        <Grid item>
          <Button
            onClick={downloadMetadata}
            color="primary"
            variant="contained"
          >
            Download Metadata
          </Button>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default withStyles(styles)(DownloadStep);
