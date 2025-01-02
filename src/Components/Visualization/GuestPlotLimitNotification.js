// guest login pop-up

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Link,
  Typography,
  withStyles,
} from '@material-ui/core';
import Cookies from 'js-cookie';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import colors from '../../enums/colors';
import z from '../../enums/zIndex';
import { showLoginDialog } from '../../Redux/actions/ui';
import { guestTokenRequestSend } from '../../Redux/actions/user';
import { guestPlotLimitNotificationSetIsVisible } from '../../Redux/actions/visualization';

const styles = (theme) => ({
  dialogWrapper: {
    backgroundColor: colors.backgroundGray,
  },

  dialogRoot: {
    zIndex: `${z.NON_HELP_DIALOG + 1} !important`,
  },

  link: {
    fontSize: '16px',
    whiteSpace: 'pre-wrap',
    display: 'inline-block',
    paddingBottom: '1px',
  },

  dialogActionButton: {
    textTransform: 'none',
  },
});

const mapStateToProps = (state) => ({
  guestPlotLimitNotificationIsVisible: state.guestPlotLimitNotificationIsVisible,
  user: state.user,
  userIsGuest: state.userIsGuest,
});

const mapDispatchToProps = {
  guestPlotLimitNotificationSetIsVisible,
  showLoginDialog,
  guestTokenRequestSend,
};

const GuestPlotLimitNotification = (props) => {
  const { classes } = props;

  const handleLoginButtonClick = () => {
    // props.guestPlotLimitNotificationSetIsVisible(false);
    props.showLoginDialog();
  };

  const handleOnClose = () => {
    if (props.userIsGuest) {
      props.guestPlotLimitNotificationSetIsVisible(false);
    }
  };

  let guestPlotCount = parseInt(Cookies.get('guestPlotCount')) || 0;

  let dialogIsOpen = Boolean(
    props.guestPlotLimitNotificationIsVisible && !props.user,
  );

  return (
    <Dialog
      open={dialogIsOpen}
      onClose={handleOnClose}
      PaperProps={{
        className: classes.dialogWrapper,
      }}
      classes={{
        root: classes.dialogRoot,
      }}
    >
      <DialogContent>
        <Typography style={{ marginBottom: '14px' }}>
          Welcome to the Simons CMAP visualization tools. You can explore the
          visualization features as a guest without registering and create up to
          10 plots per day. Registration provides access to the full suite of
          data submission tools, the data visualization tools, and the Simons
          CMAP API.
        </Typography>

        <Typography style={{ marginBottom: '14px' }}>
          You can{' '}
          <Link
            component="button"
            onClick={props.guestTokenRequestSend}
            className={classes.link}
          >
            Continue as a Guest
          </Link>
          , with {10 - guestPlotCount}/10 plots remaining,
        </Typography>

        <Typography style={{ marginBottom: '14px' }}>
          Or you can
          <Link
            component={RouterLink}
            to={'/register'}
            className={classes.link}
          >
            {' '}
            Register
          </Link>{' '}
          or
          <Link
            component="button"
            onClick={handleLoginButtonClick}
            className={classes.link}
          >
            {' '}
            Log in
          </Link>{' '}
          to your existing account for expanded access to CMAP.
        </Typography>

        <DialogActions>
          <Button
            variant="outlined"
            className={classes.dialogActionButton}
            onClick={handleLoginButtonClick}
          >
            Login
          </Button>

          <Button
            onClick
            variant="outlined"
            onClick={() => props.history.push('/register')}
            className={classes.dialogActionButton}
          >
            Register
          </Button>

          <Button
            variant="outlined"
            className={classes.dialogActionButton}
            onClick={props.guestTokenRequestSend}
          >
            Continue As Guest
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(withRouter(GuestPlotLimitNotification)));
