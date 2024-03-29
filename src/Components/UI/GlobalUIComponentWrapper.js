// This component is a wrapper and control center for
// UI components that need to be accessible anywhere
// in the application such as login dialog and snackbar.

import React, { Component } from 'react';
import { connect } from 'react-redux';

import LoginDialog from '../User/LoginDialog';
import SnackbarWrapper from './SnackbarWrapper';
import LoadingOverlay from './LoadingOverlay';
import Cart from './Cart';

import { loginDialogWasCleared } from '../../Redux/actions/user';

const mapStateToProps = (state, ownProps) => ({
  clearLoginDialog: state.clearLoginDialog,
  loadingMessage: state.loadingMessage,
});

const mapDispatchToProps = {
  loginDialogWasCleared,
};

class GlobalUIComponentWrapper extends Component {
  handleLogOut = () => {
    this.clearState();
  };

  clearState = () => {
    this.setState({
      username: '',
      password: '',
    });
    this.props.loginDialogWasCleared();
  };

  componentDidUpdate = (preProps) => {
    if (this.props.clearLoginDialog) {
      this.clearState();
    }
  };

  render() {
    return (
      <React.Fragment>
        <LoginDialog
          clearState={this.clearState}
        />
        <SnackbarWrapper />
        <LoadingOverlay loadingMessage={this.props.loadingMessage} />
        <Cart />
      </React.Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(GlobalUIComponentWrapper);
