import React from 'react';
import { makeStyles } from '@material-ui/core';

const useHintStyles = makeStyles({
  hint: {
    position: 'absolute',
    right: 0,
    top: 0,
    border: '2px solid white',
    minWidth: '200px',
    borderRadius: '5px',
    zIndex: 9999,
  },
});

export const HintTooltip = ({ open, content, styles, children }) => {
  // to render content as a component, prop needs to be capitalized
  const TooltipContent = content;
  const classes = useHintStyles();
  if (open) {
    return (
      <React.Fragment>
        <div className={classes.hint}>
          <TooltipContent />
        </div>
        {children}
      </React.Fragment>
    );
  } else {
    return <React.Fragment>{children}</React.Fragment>;
  }
};
