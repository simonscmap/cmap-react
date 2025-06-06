import React from 'react';
import { Button, Tooltip, withStyles } from '@material-ui/core';
import { chartControlTabButton } from '../chartStyles';

const TabTemplate = (props) => {
  let { tabTitle, onClick, classes, active } = props;

  return (
    <Tooltip placement="top" title={`Visualize by ${tabTitle}`}>
      <Button
        color={active ? 'primary' : 'inherit'}
        onClick={onClick}
        className={classes.tabButton}
      >
        {tabTitle}
      </Button>
    </Tooltip>
  );
};

export default withStyles(chartControlTabButton)(TabTemplate);
