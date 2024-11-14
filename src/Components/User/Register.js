import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';

import {
  googleLoginRequestSend,
  googleLoginRequestFailure,
} from '../../Redux/actions/user';

import Page from '../Common/Page2';
import Section from '../Common/Section';
import { GreenButtonSM } from '../Home/buttons';
import RegistrationStepper from './RegistrationStepper';

const useStyles = makeStyles (() => ({
  registerContainer: {
    padding: '0 0 200px 0',
    '& h2': {
      margin: '0 0 20px 0'
    }
  },
  emailSignUpButton: {
    textTransform: 'none',
    height: '46px',
    color: 'white',
  },
  buttons: {
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'none',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '2em',
  }
}));

const Register = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [showStepper, setStepper] = useState(false);


  const handleShowStepper = () => {
    setStepper(true);
  };

  const handleHideStepper = () => {
    setStepper(false)
  };

  const handleGoogleRegister = (response) => {
    dispatch (googleLoginRequestSend (
      response.credential,
      'register',
      true, // indicate user should be registered
    ));
  }

  const msg = 'There was a problem using Google to register. Consider disabling any browser extesnions that may block communication with Google. You can always sign up with a username and password.';
  const handleGoogleFailure = () => {
    dispatch (googleLoginRequestFailure (msg));
  }

  return (
    <Page bgVariant="slate2">
      <Section>
        <div className={classes.registerContainer}>
          <Typography variant="h2">Register</Typography>
          {!showStepper && (
            <React.Fragment>
              <Typography variant="subtitle1" >
                Create an account to access your favorites list between sessions
                and devices, or submit data to CMAP.
              </Typography>
              <Typography>
                You may sign up using your Google account, or you can create a username and password.
              </Typography>

              <div className={classes.buttons}>
                <GoogleLogin
                  size="large"
                  text="signup_with"
                  shape="circle"
                  onSuccess={handleGoogleRegister}
                  onError={handleGoogleFailure}
                />
                <span>OR</span>
                <GreenButtonSM
                  variant="contained"
                  color="primary"
                  className={classes.emailSignUpButton}
                  onClick={handleShowStepper}
                >
                  Sign up with an Email Address
                </GreenButtonSM>
              </div>
            </React.Fragment>
          )}

          {showStepper && (
            <RegistrationStepper handleHideStepper={handleHideStepper} />
          )}

        </div>
      </Section>
    </Page>
  );
}

export default Register;
