import React from 'react';

import { Typography, Paper, IconButton } from '@material-ui/core';
import { ChevronLeft, ChevronRight } from "@material-ui/icons";

import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({

    errorStepperPaper: {
        width: '80vw',
        margin: '0 auto 24px auto'
    }

})

const ErrorNavigator = (props) => {
    const { classes, errors, errorIndex } = props;

    return (
        <Paper className={classes.errorStepperPaper}>
            <Typography>
                {errors[errorIndex] && errors[errorIndex].message}
            </Typography>

            <IconButton 
                onClick={props.stepBackward}
                size='small' 
                disabled={Boolean(errorIndex === 0)}
            >
                <ChevronLeft />
            </IconButton>

            <IconButton 
                onClick={props.stepForward} 
                size='small' 
                disabled={Boolean(errorIndex === errors.length - 1)}
            >
                <ChevronRight/>
            </IconButton>

        </Paper>
    )
}

export default withStyles(styles)(ErrorNavigator);