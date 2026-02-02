import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

var useStyles = makeStyles(function (theme) {
  return {
    messageContainer: {
      height: 24,
      display: 'flex',
      alignItems: 'center',
    },
    message: {
      color: theme.palette.text.secondary,
      fontSize: '0.875rem',
    },
  };
});

var SliderStatusMessage = function (props) {
  var message = props.message;
  var classes = useStyles();

  return (
    <div className={classes.messageContainer}>
      {message && (
        <Typography className={classes.message}>
          {message}
        </Typography>
      )}
    </div>
  );
};

SliderStatusMessage.propTypes = {
  message: PropTypes.string,
};

export default SliderStatusMessage;
