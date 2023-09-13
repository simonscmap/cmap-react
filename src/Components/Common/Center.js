// Like Spacer, which centers vertically, this component centers contents horizontally
import { withStyles } from '@material-ui/core/styles';
import React from 'react';

const Center = withStyles({
  spacer: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-around',
    textAlign: 'center',
  },
})(({ classes, children }) => <div className={classes.spacer}>{children}</div>);

export default Center;
