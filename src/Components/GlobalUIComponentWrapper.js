// This component is a wrapper and control center for
// UI components that need to be accessible anywhere
// in the application such as login dialog and snackbar.

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import LoginDialog from './LoginDialog';
import SnackbarWrapper from './SnackbarWrapper'

import { loginDialogWasCleared } from '../Redux/actions/user';

const styles = theme => ({
    inlineBlock: {
        display: 'inline-block'
    }
})

const mapStateToProps = (state, ownProps) => ({
    clearLoginDialog: state.clearLoginDialog
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

        // const { classes } = this.props;

        return (
            <React.Fragment>    
                <LoginDialog clearState={this.clearState} username={this.state.username} password={this.state.password} handleChange={this.handleChange}/>
                <SnackbarWrapper/>
            </React.Fragment>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(GlobalUIComponentWrapper));