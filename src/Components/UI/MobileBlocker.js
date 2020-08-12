import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import colors from '../../Enums/colors';

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