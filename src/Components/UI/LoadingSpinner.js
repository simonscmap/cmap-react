import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
    centered: {
        position: 'fixed',
        top: '300px'
    }
})

const LoadingSpinner = (props) => {
    const { classes } = props;

    return (
    <CircularProgress size={props.size} className={classes[props.customVariant]}/>
)}

export default withStyles(styles)(LoadingSpinner);