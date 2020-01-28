import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Paper, Button, Typography } from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';

import RegistrationStepper from './RegistrationStepper';
import GoogleSignInButton from './GoogleSignInButton';

import { snackbarOpen } from '../../Redux/actions/ui';

const styles = (theme) => ({
    paper: {
        width: '60%',
        margin: '5% auto',
        padding: '24px'
        // height: '40vh'
    },

    emailSignUpButton: {
        textTransform: 'none',
        height: '46px',
        color: 'white'
    },

    googleWrapper: {
        margin: '50px auto 0 0',
        display: 'inline-block'
    },

    description: {
        paddingTop: '50px'
    },

    emailSignUpWrapper: {
        marginTop: '40px'
    }
})

const mapDispatchToProps = {
    snackbarOpen
}

const registerClickHandlerTarget = 'g-signup';

class Register extends Component {
    state = {
        showStepper: false
    }

    onGoogleSignup = (user) => {
        let token = user.getAuthResponse(true).id_token;
        this.props.googleLoginRequestSend(token);
    }

    componentDidMount = () => {
        // clean up listener on unmount
        let _this = this;
        let auth = window.gapi.auth2
        if(auth){
            let authInstance = auth.getAuthInstance();
            authInstance.attachClickHandler(
                registerClickHandlerTarget, 
                null, 
                _this.onGoogleSignin,
                () => _this.props.snackbarOpen('There was a problem accessing your google account')
            );
        } else {
            setTimeout(_this.onDialogEnter, 200);
            console.log("didn't find auth");
        }
    }

    handleShowStepper = () => {
        this.setState({showStepper: true})
    }

    handleHideStepper = () => {
        this.setState({showStepper: false});
    }

    render(){
        const { classes } = this.props;

        return (
            <React.Fragment>
                {!this.state.showStepper &&
                    <Paper className={classes.paper}>
                        <Typography className={classes.description}>
                            Create an account to visualize data, and access the Simons CMAP API.
                        </Typography>

                        <div className={classes.googleWrapper}>
                            <GoogleSignInButton clickHandlerTarget={registerClickHandlerTarget} text='Sign up with Google'/>
                        </div>

                        <div className={classes.emailSignUpWrapper}>
                            <Button variant='contained' color='primary' className={classes.emailSignUpButton} onClick={this.handleShowStepper}>
                                Sign up with an Email Address
                            </Button>
                        </div>
                    </Paper>                
                }
                {this.state.showStepper && <RegistrationStepper handleHideStepper={this.handleHideStepper}/>}
            </React.Fragment>
        )
    }
}

export default connect(null, mapDispatchToProps)(withStyles(styles)(Register));