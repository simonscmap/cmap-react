import React, { Component } from 'react';

import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import { googleLoginRequestSend } from '../Redux/actions/user';

import Typography from '@material-ui/core/Typography';

const mapStateToProps = (state, ownProps) => ({
    user : state.user,
})

const mapDispatchToProps = {
    googleLoginRequestSend
}

const styles = theme => ({
    landingWrapper: {
        margin: '15vh auto'
    },

    welcomeMessage: {
        color: '#ffffff',
        maxWidth: '500px',
        margin: `${theme.spacing(2)}px auto`
    }
})

class LandingPage extends Component {

    render(){
        const { classes } = this.props;

        return (
            <div className={classes.landingWrapper}>
                <img 
                    src='/images/large_cmap_logo.png'
                    alt='Simons CMAP Logo'
                    height='290'
                    width='600'
                />
                <Typography variant="body2" component="p" className={classes.welcomeMessage}>
                    Welcome to Simons CMAP. This application is currently under heavy development, and some features may be incomplete.
                </Typography>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LandingPage));