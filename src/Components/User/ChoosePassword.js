// Used with forgot password link from email

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import validate from './validatePassword';

import jwtDecode from 'jwt-decode';

import {
  Paper,
  Button,
  Typography,
  TextField,
  Grid,
  Link,
} from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';

import {
  choosePasswordRequestSend,
  choosePasswordRequestReset,
} from '../../Redux/actions/user';

import states from '../../enums/asyncRequestStates';

const styles = (theme) => ({
  paper: {
    width: '60%',
    margin: '120px auto',
    padding: '24px 12px',
  },

  description: {
    marginBottom: '12px',
  },

  formGrid: {
    height: '270px',
    padding: '0 90px',
  },
});

const mapDispatchToProps = {
  choosePasswordRequestSend,
  choosePasswordRequestReset,
};

const mapStateToProps = (state, ownProps) => ({
  choosePasswordState: state.choosePasswordState,
});

const choosePasswordButtonRef = React.createRef();

class ChoosePassword extends Component {
  constructor(props) {
    super(props);
    let token = props.location.pathname.split('/')[2];
    let decodedToken = jwtDecode(token);
    let expiration = new Date(0);
    expiration.setUTCSeconds(decodedToken.exp);

    let expired = new Date() > expiration;

    this.state = {
      password: '',
      confirmPassword: '',
      expired,
      token,
      email: decodedToken.sub,
    };
  }

  componentDidMount = () => {
    this.props.choosePasswordRequestReset();
  };

  handleChangePassword = (event) => {
    this.setState({ ...this.state, password: event.target.value });
  };

  handleSubmit = () => {
    this.props.choosePasswordRequestSend({
      password: this.state.password,
      token: this.state.token,
    });
  };
  handleChangeConfirmPassword = (event) => {
    this.setState({ ...this.state, confirmPassword: event.target.value });
  };

  handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      choosePasswordButtonRef.current.click();
    }
  };

  render() {
    const { classes, choosePasswordState } = this.props;
    const { password, confirmPassword, expired } = this.state;

    const passwordValid = validate(password);
    const confirmPasswordValid = password === confirmPassword;
    const disabled = Boolean(
      password.length === 0 || !passwordValid || !confirmPasswordValid,
    );

    if (expired) {
      return (
        <Paper className={classes.paper}>
          <Typography className={classes.description}>
            This link has expired. Click here to send a{' '}
            <Link component={RouterLink} to={{ pathname: '/forgotpass' }}>
              new link
            </Link>
            .
          </Typography>
        </Paper>
      );
    }

    if (choosePasswordState === states.succeeded) {
      return (
        <Paper className={classes.paper}>
          <Typography className={classes.description}>
            Success! You can now log in using your new password.
          </Typography>
        </Paper>
      );
    } else if (choosePasswordState === states.failed) {
      return (
        <Paper className={classes.paper}>
          <Typography className={classes.description}>
            We were unable to complete this request. Please try again.
          </Typography>
        </Paper>
      );
    }

    return (
      <Paper className={classes.paper}>
        <Typography className={classes.description}>
          Please choose a password
        </Typography>

        <Grid
          direction="column"
          justify="space-evenly"
          className={classes.formGrid}
          container
        >
          <Grid item>
            <TextField
              fullWidth
              autoFocus
              label="Password"
              margin="normal"
              id="password"
              type="password"
              variant="outlined"
              name="password"
              value={password}
              onChange={this.handleChangePassword}
              error={Boolean(!passwordValid && password.length)}
              helperText="Must be 8 to 32 characters with at least 1 number and at least 1 special character."
              onKeyPress={this.handleKeyPress}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item>
            <TextField
              fullWidth
              label="Confirm Password"
              margin="normal"
              id="confirmPassword"
              type="password"
              variant="outlined"
              name="confirmPassword"
              value={confirmPassword}
              onChange={this.handleChangeConfirmPassword}
              error={!confirmPasswordValid}
              helperText={confirmPasswordValid ? '' : 'Passwords must match'}
              onKeyPress={this.handleKeyPress}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              disabled={disabled}
              onClick={this.handleSubmit}
              ref={choosePasswordButtonRef}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </Paper>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(withStyles(styles)(ChoosePassword)));
