import Dialog from '@material-ui/core/Dialog';
import { ThemeProvider, withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import styles from './loginStyles';
import { homeTheme } from '../Home/theme';
import LoginForm from './LoginForm';

import {
  hideLoginDialog,
  restoreInterfaceDefaults,
  snackbarOpen,
} from '../../Redux/actions/ui';

import {
  googleLoginRequestSend,
  guestTokenRequestSend,
  userLoginRequestSend,
} from '../../Redux/actions/user';


const mapStateToProps = (state, ownProps) => {
  return {
    loginDialogIsOpen: state.loginDialogIsOpen,
    userLoginState: state.userLoginState,
    userLoginError: state.userLoginError,
    user: state.user,
  };
};

const mapDispatchToProps = {
  hideLoginDialog,
  userLoginRequestSend,
  restoreInterfaceDefaults,
  googleLoginRequestSend,
  snackbarOpen,
  guestTokenRequestSend,
};

const loginClickHandlerTarget = 'g-signin';

class LoginDialog extends Component {
  onGoogleSignin = (user) => {
    let token = user.getAuthResponse(true).id_token;
    this.props.googleLoginRequestSend(token);
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (!prevProps.user && this.props.user) {
      // this.handleClose();
    }
  };

  onDialogEnter = () => {
    // clean up listener on unmount
    let _this = this;
    let auth = window.gapi.auth2;
    if (auth) {
      let authInstance = auth.getAuthInstance();
      authInstance.attachClickHandler(
        loginClickHandlerTarget,
        null,
        _this.onGoogleSignin,
        () =>
          _this.props.snackbarOpen(
            'There was a problem accessing your google account',
          ),
      );
    } else {
      setTimeout(_this.onDialogEnter, 20);
    }
  };

  render() {
    const { classes } = this.props;

    return (
      <ThemeProvider theme={homeTheme}>
        <Dialog
          open={this.props.loginDialogIsOpen}
          aria-labelledby="form-dialog-title"
          onEnter={this.onDialogEnter}
          PaperProps={{
            className: classes.dialogWrapper,
          }}
          classes={{
            root: classes.dialogRoot,
          }}
        >
         <LoginForm {...this.props}  />
        </Dialog>
      </ThemeProvider>
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LoginDialog)),
);
