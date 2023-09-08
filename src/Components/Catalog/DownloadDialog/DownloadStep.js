import { Button, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import styles from './downloadDialogStyles';
import { downloadButtonText } from './buttonStates';


const DownloadStep = (props) => {
  let { handlers, buttonState } = props;

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
          disabled={!buttonState.enabled}
          onClick={downloadHandler}
          color="primary"
          variant="contained">
            {downloadButtonText[buttonState.status]}
          </Button>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default withStyles(styles)(DownloadStep);
