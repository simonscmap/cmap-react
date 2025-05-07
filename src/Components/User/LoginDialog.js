import Dialog from '@material-ui/core/Dialog';
import { ThemeProvider, withStyles } from '@material-ui/core/styles';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styles from './loginStyles';
import { homeTheme } from '../Home/theme';
import LoginForm from './LoginForm';

const mapStateToProps = (state) => {
  return {
    loginDialogIsOpen: state.loginDialogIsOpen,
    userLoginState: state.userLoginState,
    userLoginError: state.userLoginError,
    user: state.user,
  };
};

class LoginDialog extends Component {
  render() {
    const { classes } = this.props;

    return (
      <ThemeProvider theme={homeTheme}>
        <Dialog
          open={this.props.loginDialogIsOpen}
          aria-labelledby="form-dialog-title"
          PaperProps={{
            className: classes.dialogWrapper,
          }}
          classes={{
            root: classes.dialogRoot,
          }}
        >
          <LoginForm {...this.props} />
        </Dialog>
      </ThemeProvider>
    );
  }
}

export default withRouter(
  connect(mapStateToProps)(withStyles(styles)(LoginDialog)),
);
