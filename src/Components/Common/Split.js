import React from 'react';
import { Typography } from '@material-ui/core';
import { colors } from '../Home/theme';
import { withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const styles = {
  splitContainer: {
    padding: '1em',
    display: 'flex',
    flexFlow: 'row wrap',
    gap: '15%',
    '& > div': {
      flexBasis: 'content',
      marginBottom: '2em',
    }
  },

}

const Split = withStyles(styles)(({ classes, items }) => {
  return (
    <div className={classes.splitContainer}>
      {items.map((item, ix) => <div key={`item=${ix}`}>{item}</div>)}
    </div>
  );
});

export default Split;
