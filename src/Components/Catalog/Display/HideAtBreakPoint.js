import React, { useState } from 'react';
import {
  makeStyles,
  useMediaQuery,
 } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
  },
}));

const HideAtBreakPoint = React.memo((props) => {
  const { lt, children } = props;
  const cl = useStyles();
  const matches = useMediaQuery(`(max-width: ${lt}px)`);


  const inline = {
    display: matches ? 'none' : 'block',
  };

  if (matches) {
    return null;
  }

  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
});

export default HideAtBreakPoint;
