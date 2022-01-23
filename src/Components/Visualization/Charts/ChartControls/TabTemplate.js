import React from 'react';
import { Button, Tooltip, withStyles } from '@material-ui/core';
import { chartControlTabButton } from '../chartStyles';

const TabTemplate = (props) => {
  let { tabTitle, onClick, classes, active, key } = props;

  return (
    <Tooltip placement="top" title={`Visualize by ${tabTitle}`}>
      <Button
        color={active ? 'primary' : 'inherit'}
        onClick={onClick}
        className={classes.iconButton}
      >
        {tabTitle}
      </Button>
    </Tooltip>
  );
};

export default withStyles(chartControlTabButton)(TabTemplate);
