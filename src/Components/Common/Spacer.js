import { withStyles } from '@material-ui/core/styles';
import React from 'react';

// Center children vertically and horizontally within the Spacer

const Spacer = withStyles({
  spacer: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'space-around',
    minHeight: '400px',
    textAlign: 'center',
  },
})(({ classes, children }) => <div className={classes.spacer}>{children}</div>);

export default Spacer;
