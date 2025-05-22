import React from 'react';
import { useMediaQuery } from '@material-ui/core';

const HideAtBreakPoint = React.memo((props) => {
  const { lt, children } = props;
  const matches = useMediaQuery(`(max-width: ${lt}px)`);

  if (matches) {
    return null;
  }

  return <React.Fragment>{children}</React.Fragment>;
});

HideAtBreakPoint.displayName = 'HideAtBreakPoint';

export default HideAtBreakPoint;
