import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import * as Spinner from 'react-spinkit';

const styles = theme => ({
    loader: {
        backgroundColor: '#000000',
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        opacity: 0.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        zIndex: 9998
    },

    loaderContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItem: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: 1
    },

    spinnerText: {
        zIndex: 10000,
        color: '#FF8000',
        marginTop: '25px',
        opacity: 1
    },

    spinner: {
        opacity: 1
    }
})

const LoadingOverlay = (props) => {
    const { classes, loadingMessage } = props;

    if(loadingMessage && loadingMessage.length){
        return (
            <div className={classes.loader}>
                <div className={classes.loaderContent}>
                    <Spinner className={classes.spinner} color='#FF8000' name="ball-pulse-rise" fadeIn='quarter'/>
                    <Typography variant='h6' className={classes.spinnerText}>{loadingMessage}</Typography>
                </div>
            </div>
        )
    } else return '';

}

export default withStyles(styles)(LoadingOverlay);