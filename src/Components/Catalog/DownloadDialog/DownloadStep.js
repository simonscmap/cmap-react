import { Button, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import styles from './downloadDialogStyles';

const DownloadStep = (props) => {
  let { handlers } = props;

  let { handleClose, handleDownload } = handlers;

  let downloadHandler = () => {
    handleDownload();
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
          <Button onClick={downloadHandler} color="primary" variant="contained">
            Download Dataset
          </Button>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default withStyles(styles)(DownloadStep);
