import React from 'react';
import { Button, Grid } from '@material-ui/core';
import { downloadButtonText } from './buttonStates';

const DownloadStepWithWarning = ({ onOpenWarning, buttonState, isInvalid }) => (
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
          onClick={onOpenWarning}
          color="primary"
          variant="contained"
        >
          {downloadButtonText[buttonState.status]}
        </Button>
      </Grid>
    </Grid>
  </React.Fragment>
);

export default DownloadStepWithWarning;
