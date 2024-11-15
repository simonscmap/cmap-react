import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import states from '../../enums/asyncRequestStates';
import { GreenButtonSM } from '../Home/buttons';
import GoogleSignInButton from './GoogleSignInButton';
import styles from './loginStyles';

import {
  googleLoginRequestSend,
  // guestTokenRequestSend,
  userLoginRequestSend,
  loginDialogWasCleared
} from '../../Redux/actions/user';

import {
  hideLoginDialog,
  restoreInterfaceDefaults,
} from '../../Redux/actions/ui';

const loginClickHandlerTarget = 'g-signin';

const useStyles = makeStyles(styles);

const LoginForm = ({ title = "Login "}) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const userLoginState = useSelector((state) => state.userLoginState);

  let [username, setUsername] = useState('');
  let [password, setPassword] = useState('');
  let updateUsername = ({ target }) => setUsername(target.value);
  let updatePassword = ({ target }) => setPassword(target.value);

  const handleClear = () => {
    setUsername('');
    setPassword('');
  }

  const loginDisabled = !username || !password;

  const handleLogin = () => dispatch(userLoginRequestSend(username, password));

  const handleClose = () => {
    setUsername('');
    setPassword('');
    dispatch (hideLoginDialog())
    dispatch (restoreInterfaceDefaults());
    dispatch (loginDialogWasCleared());
  };

  const handleGoogleSignin = (user) => {
    let token = user.getAuthResponse(true).id_token;
    dispatch (googleLoginRequestSend (token, 'login form'))
  };

  const handleDialogEnter = () => {
    let auth = window.gapi && window.gapi.auth2;
    if (auth) {
      let authInstance = auth.getAuthInstance();
      authInstance.attachClickHandler(
        loginClickHandlerTarget,
        null,
        handleGoogleSignin,
        () => console.log ('failed to log in')
      );
    } else {
      setTimeout(handleDialogEnter, 20);
    }
  };

  useEffect (() => {
    handleDialogEnter();
  }, [])

  const disableGoogleButton = (username + password).trim().length > 0;

  return (
    <div>
      {userLoginState === states.failed ? (
        <DialogContentText>
          <div className={classes.warningWrapper}>
            <WarningRoundedIcon className={classes.warningIcon}/>
            <span> Login failed. Please try again.</span>
          </div>
          </DialogContentText>
        ) : (
          ''
        )}
      <DialogTitle id="form-dialog-title">
        <span>{title}
       </span></DialogTitle>
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
              <GreenButtonSM onClick={handleClose}>
                <span>Cancel</span>
              </GreenButtonSM>

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

          <DialogActions style={{ padding: '0 0 15px 0', flexDirection: 'column' }}>
            <div className={classes.actionsContainerLeft}>
              <div className={classes.googleIconWrapper}>
                <GoogleSignInButton
                  clickHandlerTarget={loginClickHandlerTarget}
                  text="Sign in with Google"
                />
              </div>
            </div>
          </DialogActions>

        </form>

      </DialogContent>
      <div className={classes.registerWrapper}>
         <p><Link
            className={classes.colorCorrectionPrimary}
            onClick={handleClose}
            component={RouterLink}
            to={{ pathname: '/register' }}
          >Register</Link>{' '}if you do not have a Simons CMAP account.</p>
      </div>
    </div>
  );
}

export default LoginForm;
