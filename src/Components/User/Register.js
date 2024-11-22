import { Button, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { snackbarOpen } from '../../Redux/actions/ui';
import { googleLoginRequestSend } from '../../Redux/actions/user';
import Page from '../Common/Page';
import Section from '../Common/Section';
import GoogleSignInButton from './GoogleSignInButton';
import { GreenButtonSM } from '../Home/buttons';
import RegistrationStepper from './RegistrationStepper';

const styles = (theme) => ({
  registerContainer: {
    margin: '100px auto 0 auto',
  },

  emailSignUpButton: {
    textTransform: 'none',
    height: '46px',
    color: 'white',
  },

  googleWrapper: {
    margin: '50px auto 0 0',
    display: 'inline-block',
  },

  emailSignUpWrapper: {
    marginTop: '40px',
  },
});

const mapDispatchToProps = {
  snackbarOpen,
  googleLoginRequestSend,
};


class Register extends Component {
  state = {
    showStepper: false,
  };

  handleShowStepper = () => {
    this.setState({ showStepper: true });
  };

  handleHideStepper = () => {
    this.setState({ showStepper: false });
  };

  render() {
    const { classes } = this.props;

    return (
      <Section>
        <div className={classes.registerContainer}>
          <Typography variant="h1">Register</Typography>
          {!this.state.showStepper && (
            <React.Fragment>
              <Typography variant="subtitle1" >
                Create an account to access your favorites list between sessions
                and devices, or submit data to CMAP.
              </Typography>

              <div className={classes.googleWrapper}>
                <GoogleSignInButton
                  text="Sign up with Google"
                  register={true}
                />
              </div>

              <div className={classes.emailSignUpWrapper}>
                <GreenButtonSM
                  variant="contained"
                  color="primary"
                  className={classes.emailSignUpButton}
                  onClick={this.handleShowStepper}
                >
                  Sign up with an Email Address
                </GreenButtonSM>
              </div>
            </React.Fragment>
          )}
          {this.state.showStepper && (
            <RegistrationStepper handleHideStepper={this.handleHideStepper} />
          )}
        </div>
      </Section>
    );
  }
}

const RegisterContent = connect(
  null,
  mapDispatchToProps,
)(withStyles(styles)(Register));

export default function () {
  return <Page heroContent={<RegisterContent />}></Page>;
}
