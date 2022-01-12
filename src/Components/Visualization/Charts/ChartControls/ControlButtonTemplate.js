import React from 'react';
import { IconButton, Tooltip, withStyles } from '@material-ui/core';
import { chartControlIconButton } from '../chartStyles';

const ControlButtonTemplate = (props) => {
  let {
    tooltipContent,
    onClick,
    icon,
    classes,
    active,
  } = props;

  let Icon = icon; // variable must be capitalized to render as component

  return (
    <Tooltip placement="top" title={tooltipContent}>
      <IconButton
        color={ active ? "primary" : "inherit"}
        onClick={onClick}
        className={classes.iconButton}
      >
        <Icon />
      </IconButton>
    </Tooltip>
  );
};

export default withStyles(chartControlIconButton)(ControlButtonTemplate);
