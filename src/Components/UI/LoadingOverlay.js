// spinner

import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import * as Spinner from 'react-spinkit';

import colors from '../../Enums/colors';
import z from '../../Enums/zIndex';


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
        zIndex: z.LOADING_OVERLAY,
    },

    loaderContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItem: 'center',
        justifyContent: 'center',
        zIndex: z.LOADING_OVERLAY + 1,
        opacity: 1
    },

    spinnerText: {
        zIndex: z.LOADING_OVERLAY + 2,
        color: theme.palette.primary.main,
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
                    <Spinner className={classes.spinner} color={colors.primary} name="ball-pulse-rise" fadeIn='quarter'/>
                    <Typography variant='h6' className={classes.spinnerText}>{loadingMessage}</Typography>
                </div>
            </div>
        )
    } else return '';

}

export default withStyles(styles)(LoadingOverlay);