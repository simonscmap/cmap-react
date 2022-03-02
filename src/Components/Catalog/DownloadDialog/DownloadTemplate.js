// Template for rendering a button and a text explanation of the button action
// Uses MUI Grid for layout
import React from 'react';
import { Button, Grid } from '@material-ui/core';

const Template = (props) => {
  let { dlAction, explanation } = props;
  let { handler, disabled, buttonText } = dlAction;

  return (
    <div style={{ padding: '.7em 0' }}>
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Grid item xs={4}>
          <Button
            onClick={handler}
            color="primary"
            variant="contained"
            disabled={disabled}
          >
            {buttonText}
          </Button>
        </Grid>
        <Grid item xs={8}>
          {explanation}
        </Grid>
      </Grid>
    </div>
  );
};

export default Template;
