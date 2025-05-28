import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import states from '../../enums/asyncRequestStates';
import { GreenButtonSM } from '../Common/Buttons';
import styles from './loginStyles';

import {
  googleLoginRequestSend,
  googleLoginRequestFailure,
  userLoginRequestSend,
  loginDialogWasCleared,
} from '../../Redux/actions/user';

import {
  hideLoginDialog,
  restoreInterfaceDefaults,
} from '../../Redux/actions/ui';

const useStyles = makeStyles(styles);

const LoginForm = ({ title = 'Login ' }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const userLoginState = useSelector((state) => state.userLoginState);

  let [username, setUsername] = useState('');
  let [password, setPassword] = useState('');
  let updateUsername = ({ target }) => setUsername(target.value);
  let updatePassword = ({ target }) => setPassword(target.value);

  const loginDisabled = !username || !password;

  const handleLogin = () => dispatch(userLoginRequestSend(username, password));

  const handleGoogleLogin = (response) => {
    dispatch(googleLoginRequestSend(response.credential, 'login form', false));
  };

  const handleGoogleFailure = (args) => {
    console.log('login failure', args);
    dispatch(
      googleLoginRequestFailure(
        'There was a problem using Google to sign in. Ensure any browser extesnions that may interfere with network requests or storing cookies are disabled. If the problem persists please contact ',
      ),
    );
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    dispatch(hideLoginDialog());
    dispatch(restoreInterfaceDefaults());
    dispatch(loginDialogWasCleared());
  };

  let displayUsernameHelperText = false;
  if (username && username.includes('@')) {
    displayUsernameHelperText = true;
  }

  return (
    <div>
      {userLoginState === states.failed ? (
        <DialogContentText>
          <div className={classes.warningWrapper}>
            <WarningRoundedIcon className={classes.warningIcon} />
            <span> Login failed. Please try again.</span>
          </div>
        </DialogContentText>
      ) : (
        ''
      )}
      <div className={classes.titleBar}>
        <DialogTitle id="form-dialog-title">
          <span>{title}</span>
        </DialogTitle>
        <Link className={classes.closeLink} onClick={handleClose}>
          <span>Close</span>
          <CancelOutlinedIcon />
        </Link>
      </div>
      <DialogContent style={{ width: '464px' }}>
        <DialogContentText>
          Login with your username and password:
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
              value={username}
              onChange={updateUsername}
              InputLabelProps={{
                shrink: true,
              }}
              helperText={
                displayUsernameHelperText && (
                  <span style={{ color: 'rgb(206, 209, 98)' }}>
                    Please use your username, not your email address.
                  </span>
                )
              }
            />

            <TextField
              margin="normal"
              id="name"
              label="Password"
              type="password"
              variant="outlined"
              name="password"
              classes={{ root: classes.textInput }}
              value={password}
              onChange={updatePassword}
              InputLabelProps={{
                shrink: true,
              }}
              helperText={
                <Link
                  className={classes.colorCorrectionPrimary}
                  onClick={handleClose}
                  component={RouterLink}
                  to={{ pathname: '/forgotpass' }}
                >
                  Forgot Username or Password
                </Link>
              }
            />
          </div>

          <DialogActions style={{ padding: '0 0 15px 0' }}>
            <div className={classes.actionsContainerRight}>
              <GreenButtonSM
                color="primary"
                type="submit"
                onClick={handleLogin}
                disabled={loginDisabled}
                className={loginDisabled ? '' : classes.colorCorrection}
              >
                Log In
              </GreenButtonSM>
            </div>
          </DialogActions>

          <DialogContentText style={{ marginTop: '1em' }}>
            Or login with your Google Account:
          </DialogContentText>

          <DialogActions
            style={{ padding: '0 0 15px 0', flexDirection: 'column' }}
          >
            <div className={classes.actionsContainerLeft}>
              <div className={classes.googleIconWrapper}>
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={handleGoogleFailure}
                />
              </div>
            </div>
          </DialogActions>
        </form>
      </DialogContent>
      <div className={classes.registerWrapper}>
        <p>
          <Link
            className={classes.colorCorrectionPrimary}
            onClick={handleClose}
            component={RouterLink}
            to={{ pathname: '/register' }}
          >
            Register
          </Link>{' '}
          if you do not have a Simons CMAP account.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
