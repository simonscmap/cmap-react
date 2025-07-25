import React from 'react';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../Components/Home/theme';

const useStyles = makeStyles(() => ({
  infoIcon: {
    padding: 4,
    marginLeft: 4,
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
        style: { zIndex: 9901 },
      }}
    >
      <InfoOutlinedIcon
        fontSize={fontSize}
        color={colors.green.lime}
        className={classes.infoIcon}
        onClick={handleClick}
      />
    </Tooltip>
  );
};

export default InfoTooltip;
