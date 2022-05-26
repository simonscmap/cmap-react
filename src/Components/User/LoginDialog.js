import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Link from '@material-ui/core/Link';
import { ThemeProvider, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import states from '../../enums/asyncRequestStates';
import colors from '../../enums/colors';
import z from '../../enums/zIndex';
import { homeTheme } from '../Home/theme';
import { WhiteButtonSM, GreenButtonSM } from '../Home/buttons';
import {
  hideLoginDialog,
  restoreInterfaceDefaults,
  showLoginDialog,
  snackbarOpen,
} from '../../Redux/actions/ui';
import {
  googleLoginRequestSend,
  guestTokenRequestSend,
  logOut,
  userLoginRequestSend,
} from '../../Redux/actions/user';
import GoogleSignInButton from './GoogleSignInButton';

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
  showLoginDialog,
  logOut,
  userLoginRequestSend,
  restoreInterfaceDefaults,
  googleLoginRequestSend,
  snackbarOpen,
  guestTokenRequestSend,
};

const styles = (theme) => ({
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'flex-start',
    paddingBottom: '1.5em',
  },
  textInput: {
    width: 'calc(50% - 10px)',
  },
  actionsContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  googleIconWrapper: {
    // marginRight: '100px',
    // marginLeft: '-8px',
  },
  dialogWrapper: {
    // backgroundColor: colors.solidPaper,
  },
  colorCorrectionPrimary: {
    color: theme.palette.primary,
  },
  colorCorrectionWhite: {
    color: 'white',
  },
  dialogRoot: {
    zIndex: `${z.LOGIN_DIALOG + 1} !important`,
  },
});

const loginClickHandlerTarget = 'g-signin';

class LoginDialog extends Component {
  handleLogin = (event) => {
    this.props.userLoginRequestSend(this.props.username, this.props.password);
  };

  handleClose = () => {
    this.props.clearState();
    this.props.hideLoginDialog();
    this.props.restoreInterfaceDefaults();
  };

  onGoogleSignin = (user) => {
    let token = user.getAuthResponse(true).id_token;
    this.props.googleLoginRequestSend(token);
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (!prevProps.user && this.props.user) {
      this.handleClose();
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
    let loginDisabled = !this.props.username || !this.props.password;

    return (
      <ThemeProvider theme={homeTheme}>
        <Dialog
          open={this.props.loginDialogIsOpen}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
          onEnter={this.onDialogEnter}
          PaperProps={{
            className: classes.dialogWrapper,
          }}
          classes={{
            root: classes.dialogRoot,
          }}
        >
          <DialogTitle id="form-dialog-title">Login</DialogTitle>
          <DialogContent style={{ width: '464px' }}>
            <DialogContentText>
              Please enter your username and password, or{' '}
              <Link
                className={classes.colorCorrectionPrimary}
                onClick={this.handleClose}
                component={RouterLink}
                to={{ pathname: '/register' }}
              >
                Register.
              </Link>
            </DialogContentText>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className={classes.inputContainer}>
                <TextField
                  autoFocus
                  margin="normal"
                  id="username"
                  label="Username"
                  type="text"
                  variant="outlined"
                  name="username"
                  classes={{ root: classes.textInput }}
                  value={this.props.username}
                  onChange={this.props.handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                <TextField
                  margin="normal"
                  id="name"
                  label="Password"
                  type="password"
                  variant="outlined"
                  name="password"
                  classes={{ root: classes.textInput }}
                  value={this.props.password}
                  onChange={this.props.handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText={
                    <Link
                      className={classes.colorCorrectionPrimary}
                      onClick={this.handleClose}
                      component={RouterLink}
                      to={{ pathname: '/forgotpass' }}
                    >
                      Forgot Username or Password
                    </Link>
                  }
                />
              </div>

              <DialogActions style={{ padding: '0 0 15px 0' }}>
                <div className={classes.actionsContainer}>
                  <div className={classes.googleIconWrapper}>
                    <GoogleSignInButton
                      clickHandlerTarget={loginClickHandlerTarget}
                      text="Sign in with Google"
                    />
                  </div>

                  <GreenButtonSM onClick={this.handleClose}>
                    <span>Cancel</span>
                  </GreenButtonSM>

                  <GreenButtonSM
                    color="primary"
                    type="submit"
                    onClick={this.handleLogin}
                    disabled={loginDisabled}
                    className={loginDisabled ? '' : classes.colorCorrection}
                  >
                    Log In
                  </GreenButtonSM>
                </div>
              </DialogActions>
            </form>
            {this.props.userLoginState === states.failed ? (
              <DialogContentText>
                Login failed. Please try again.
              </DialogContentText>
            ) : (
              ''
            )}
          </DialogContent>
        </Dialog>
      </ThemeProvider>
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LoginDialog)),
);
