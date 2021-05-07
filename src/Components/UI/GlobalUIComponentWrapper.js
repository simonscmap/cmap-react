// This component is a wrapper and control center for
// UI components that need to be accessible anywhere
// in the application such as login dialog and snackbar.

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import LoginDialog from '../User/LoginDialog';
import SnackbarWrapper from './SnackbarWrapper';
import LoadingOverlay from './LoadingOverlay';
import Cart from './Cart';
import GuestPlotLimitNotification from '../Visualization/GuestPlotLimitNotification';

import { loginDialogWasCleared } from '../../Redux/actions/user';

const mapStateToProps = (state, ownProps) => ({
    clearLoginDialog: state.clearLoginDialog,
    loadingMessage: state.loadingMessage
})

const mapDispatchToProps = {
    loginDialogWasCleared
}

class GlobalUIComponentWrapper extends Component {

    state = {
        // Login dialog
        username: '',
        password: ''
    }
    
    // Controls login dialog text fields to allow reset from logout button
    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value})
    };

    handleLogOut = () => {
        this.clearState();
    }

    clearState = () => {
        this.setState({
            username: '',
            password: ''
        });
        this.props.loginDialogWasCleared();
    }

    componentDidUpdate = (preProps) => {
        if(this.props.clearLoginDialog) {
            this.clearState();
        }
    }

    render(){

        return (
            <React.Fragment>    
                <LoginDialog clearState={this.clearState} username={this.state.username} password={this.state.password} handleChange={this.handleChange}/>
                <SnackbarWrapper/>
                <LoadingOverlay loadingMessage={this.props.loadingMessage}/>
                <Cart/>                
            </React.Fragment>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GlobalUIComponentWrapper);