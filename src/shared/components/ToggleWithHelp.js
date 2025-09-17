// Template for rendering a toggle switch for a download option
// Uses Grid to lay out a control and an explanation, side by side
import React from 'react';
import { FormControlLabel, Switch } from '@material-ui/core';
import InfoTooltip from './InfoTooltip';

import { withStyles } from '@material-ui/core/styles';

const styles = () => ({});

const Template = (props) => {
  let { downloadOption, description, classes } = props;
  let { handler, switchState, name, label, disabled } = downloadOption;

  return (
    <div style={{ padding: '.7em 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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
        <InfoTooltip title={description} iconType="help" fontSize="small" />
      </div>
    </div>
  );
};

export default withStyles(styles)(Template);
