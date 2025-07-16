import React from 'react';
import InfoIcon from '@material-ui/icons/Info';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  infoIcon: {
    padding: 4,
    marginLeft: 4,
    cursor: 'help',
    zIndex: '9900 !important',
    position: 'relative',
  },
}));

const InfoTooltip = ({ title, fontSize = 'small' }) => {
  const classes = useStyles();

  const handleClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <InfoIcon 
      fontSize={fontSize} 
      color="action"
      className={classes.infoIcon}
      onClick={handleClick}
      title={title}
    />
  );
};

export default InfoTooltip;