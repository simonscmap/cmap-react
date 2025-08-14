import { Button, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import styles from '../../../features/datasetDownload/styles/downloadDialogStyles';
import { downloadButtonText } from '../../../features/datasetDownload/utils/buttonStates';

const DownloadStep = (props) => {
  let { handlers, buttonState, isInvalid } = props;

  let { handleClose, handleDownload } = handlers;

  let downloadHandler = () => {
    handleDownload(); // state is enclosed in dialog.js
    handleClose();
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
          <Button
            disabled={!buttonState.enabled || isInvalid}
            onClick={downloadHandler}
            color="primary"
            variant="contained"
          >
            {downloadButtonText[buttonState.status]}
          </Button>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default withStyles(styles)(DownloadStep);
