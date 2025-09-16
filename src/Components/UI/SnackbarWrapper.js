import React from 'react';
import { connect } from 'react-redux';

import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { withStyles } from '@material-ui/core/styles';
import InfoIcon from '@material-ui/icons/Info';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';

import { snackbarClose } from '../../Redux/actions/ui';

import z from '../../enums/zIndex';

const mapStateToProps = (state, ownProps) => ({
  snackbarIsOpen: state.snackbarIsOpen,
  snackbarMessage: state.snackbarMessage,
  snackbarPosition: state.snackbarPosition || 'top', // backwards compatible default
  snackbarSeverity: state.snackbarSeverity || 'info', // backwards compatible default
});

const mapDispatchToProps = {
  snackbarClose,
};

const severityConfig = {
  info: {
    backgroundColor: '#2196f3',
    icon: InfoIcon,
  },
  warning: {
    backgroundColor: '#ff9800',
    icon: WarningIcon,
  },
  error: {
    backgroundColor: '#f44336',
    icon: ErrorIcon,
  },
};

const styles = (theme) => {
  return {
    snackbar: {
      zIndex: z.SNACKBAR,
    },
    snackbarContent: {
      display: 'flex',
      alignItems: 'center',
    },
    icon: {
      marginRight: theme.spacing(1),
    },
  };
};

const SnackbarWrapper = (props) => {
  const { classes, snackbarPosition, snackbarSeverity } = props;
  const config = severityConfig[snackbarSeverity];
  const Icon = config.icon;

  const vertical = snackbarPosition === 'bottom' ? 'bottom' : 'top';

  return (
    <React.Fragment>
      <Snackbar
        autoHideDuration={null}
        onClose={props.snackbarClose}
        open={props.snackbarIsOpen}
        anchorOrigin={{ horizontal: 'center', vertical }}
        className={classes.snackbar}
      >
        <SnackbarContent
          style={{ backgroundColor: config.backgroundColor }}
          message={
            <span className={classes.snackbarContent}>
              <Icon className={classes.icon} />
              {props.snackbarMessage}
            </span>
          }
        />
      </Snackbar>
    </React.Fragment>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(SnackbarWrapper));
