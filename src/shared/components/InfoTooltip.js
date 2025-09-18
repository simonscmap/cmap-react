import React from 'react';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../Components/Home/theme';

const useStyles = makeStyles(() => ({
  infoIcon: {
    padding: 4,
    marginLeft: 4,
    color: colors.green.olive,
  },
  tooltip: {
    zIndex: '9901 !important',
  },
}));

const InfoTooltip = ({ title, fontSize = 'small', iconType = 'info' }) => {
  const classes = useStyles();

  const handleClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const IconComponent =
    iconType === 'help' ? HelpOutlineIcon : InfoOutlinedIcon;

  return (
    <Tooltip
      title={title}
      classes={{ tooltip: classes.tooltip }}
      PopperProps={{
        style: { zIndex: 9901 },
      }}
    >
      <IconComponent
        fontSize={fontSize}
        className={classes.infoIcon}
        onClick={handleClick}
      />
    </Tooltip>
  );
};

export default InfoTooltip;
