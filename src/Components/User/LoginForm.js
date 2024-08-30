import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import states from '../../enums/asyncRequestStates';
import { GreenButtonSM } from '../Home/buttons';
import GoogleSignInButton from './GoogleSignInButton';
import styles from './loginStyles';

import {
  // googleLoginRequestSend,
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

  const loginDisabled = !username || !password;

  const handleLogin = () => dispatch(userLoginRequestSend(username, password));

  const handleClose = () => {
    setUsername('');
    setPassword('');
    dispatch (hideLoginDialog())
    dispatch (restoreInterfaceDefaults());
    dispatch (loginDialogWasCleared());
  };
  return (
    <div>
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
      <DialogContent style={{ width: '464px' }}>
        <DialogContentText>
          Please enter your username and password, or{' '}
          <Link
            className={classes.colorCorrectionPrimary}
            onClick={handleClose}
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
            <div className={classes.actionsContainer}>
              <div className={classes.googleIconWrapper}>
                <GoogleSignInButton
                  clickHandlerTarget={loginClickHandlerTarget}
                  text="Sign in with Google"
                />
              </div>

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
        </form>
        {userLoginState === states.failed ? (
          <DialogContentText>
            Login failed. Please try again.
          </DialogContentText>
        ) : (
          ''
        )}
      </DialogContent>
    </div>
  );
}

export default LoginForm;
