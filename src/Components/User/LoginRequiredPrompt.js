import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import { Link, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { showLoginDialog } from '../../Redux/actions/ui';

const mapDispatchToProps = {
    showLoginDialog
}

const styles = {
    loginRequiredMessage: {
        marginTop: '60px',
        color: 'white'
    }
}

const LoginRequiredPrompt = (props) => {
    const { classes, showLoginDialog } = props;

    useEffect(() => {
        showLoginDialog();
    })
    
    return (
        <Typography className={classes.loginRequiredMessage}>
            This feature requires a user account. Please <Link component={RouterLink} to={{pathname: window.location.pathname}} onClick={() => props.showLoginDialog()}> log in
            </Link> or <Link component={RouterLink} to={{pathname: '/register'}}> register
            </Link>.
        </Typography>
    )
}

export default connect(null, mapDispatchToProps)(withStyles(styles)(LoginRequiredPrompt));