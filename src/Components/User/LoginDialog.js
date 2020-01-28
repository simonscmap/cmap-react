import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Link as RouterLink } from 'react-router-dom';

import Link from '@material-ui/core/Link';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';

import states from '../../Enums/asyncRequestStates';

import { showLoginDialog, hideLoginDialog, restoreInterfaceDefaults, snackbarOpen } from '../../Redux/actions/ui';
import { logOut, userLoginRequestSend, googleLoginRequestSend } from '../../Redux/actions/user';

import GoogleSignInButton from './GoogleSignInButton';

const mapStateToProps = (state, ownProps) => {
    return {
        loginDialogIsOpen: state.loginDialogIsOpen,
        userLoginState: state.userLoginState,
        userLoginError: state.userLoginError
    }
}

const mapDispatchToProps = {
    hideLoginDialog,
    showLoginDialog,
    logOut,
    userLoginRequestSend,
    restoreInterfaceDefaults,
    googleLoginRequestSend,
    snackbarOpen
}

const styles = theme => ({
    wrapper: {
        margin: theme.spacing(1),
        position: 'relative',
    },

    buttonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },

    googleIconWrapper: {
        marginRight: '100px',
        marginLeft: '-8px'
    }
})

const loginClickHandlerTarget = 'g-signin';

class LoginDialog extends Component{
    // Text input state is managed in the TopNavBar component

    handleLogin = (event) => {
        this.props.userLoginRequestSend(this.props.username, this.props.password);
    }

    handleClose = () => {
        this.props.clearState();
        this.props.hideLoginDialog();
        this.props.restoreInterfaceDefaults();
    }

    onGoogleSignin = (user) => {
        let token = user.getAuthResponse(true).id_token;
        this.props.googleLoginRequestSend(token);
    }

    onDialogEnter = () => {
        // clean up listener on unmount
        let _this = this;
        let auth = window.gapi.auth2
        if(auth){
            let authInstance = auth.getAuthInstance();
            authInstance.attachClickHandler(
                loginClickHandlerTarget, 
                null, 
                _this.onGoogleSignin,
                () => _this.props.snackbarOpen('There was a problem accessing your google account')
            );
        } else {
            setTimeout(_this.onDialogEnter, 200);
        }
    }

    render(){
        const { classes } = this.props;
        return (
            <Dialog
                open={this.props.loginDialogIsOpen}
                onClose={this.handleClose}
                aria-labelledby="form-dialog-title"
                onEnter={this.onDialogEnter}
            >
                <DialogTitle id="form-dialog-title">Login</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter your username and password, or <Link onClick={this.handleClose} component={RouterLink} to={{pathname: '/register'}}>Register.</Link>
                    </DialogContentText>
                    <form onSubmit={e => (e.preventDefault())}>
                        <TextField
                            autoFocus
                            margin="normal"
                            id="username"
                            label="Username"
                            type="text"
                            variant='outlined'
                            name='username'
                            value={this.props.username}
                            onChange={this.props.handleChange}
                            InputLabelProps={{
                                shrink: true,
                            }}                            
                        />

                        <TextField
                            margin="normal"
                            id="name"
                            label="Password"
                            type="password"
                            variant='outlined'
                            name='password'
                            value={this.props.password}
                            onChange={this.props.handleChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            helperText={<Link onClick={this.handleClose} component={RouterLink} to={{pathname: '/forgotpass'}}>Forgot Username or Password</Link>}
                        />

                        <DialogActions>
                            <div className={classes.googleIconWrapper}>
                                <GoogleSignInButton clickHandlerTarget={loginClickHandlerTarget} text='Sign in with Google'/>
                            </div>

                            <Button onClick={this.handleClose} color="primary">
                                Cancel
                            </Button>

                            <div className={classes.wrapper}>
                                <Button color="primary" type='submit' onClick={this.handleLogin} disabled={!this.props.username || !this.props.password}>
                                    Log In
                                </Button>
                                {this.props.userLoginState === states.inProgress && <CircularProgress size={24} className= {classes.buttonProgress} />}
                            </div>
                        </DialogActions>
                    </form>
                    {this.props.userLoginState === states.failed ?
                    <DialogContentText>
                        Login failed. Please try again.
                    </DialogContentText>
                    : ''               
                    }
                </DialogContent>
                
            </Dialog>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LoginDialog));