import React from 'react';
import InfoIcon from '@material-ui/icons/Info';
import { Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  infoIcon: {
    padding: 4,
    marginLeft: 4,
    cursor: 'help',
  },
  tooltip: {
    zIndex: '9901 !important',
  },
}));

const InfoTooltip = ({ title, fontSize = 'small' }) => {
  const classes = useStyles();

  const handleClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <Tooltip
      title={title}
      classes={{ tooltip: classes.tooltip }}
      PopperProps={{
        style: { zIndex: 9901 }
      }}
    >
      <InfoIcon
        fontSize={fontSize}
        color="action"
        className={classes.infoIcon}
        onClick={handleClick}
      />
    </Tooltip>
  );
};

export default InfoTooltip;
