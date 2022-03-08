// Template for rendering a toggle switch for a download option
// Uses Grid to lay out a control and an explanation, side by side
import React from 'react';
import { FormControlLabel, Switch, Grid } from '@material-ui/core';

const Template = (props) => {
  let { downloadOption, description } = props;
  let { handler, switchState, name, label, disabled } = downloadOption;

  return (
    <div style={{ padding: '.7em 0' }}>
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Grid item xs={4}>
          <FormControlLabel
            control={
              <Switch
                checked={switchState}
                onChange={handler}
                name={name}
                color="primary"
                disabled={disabled}
              />
            }
            label={label}
          />
        </Grid>
        <Grid item xs={8}>
          {description}
        </Grid>
      </Grid>
    </div>
  );
};

export default Template;
