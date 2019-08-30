import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography'

const styles = (theme) => ({
    tooltip: {
        width: '180px',
        height: '100px',
        padding: theme.spacing(1.5),
        position:'fixed',
        left: '10px',
        top: '400px',
        zIndex: 2
    }
})

const VizTooltip = (props) => {
    const {classes} = props;

    return (
        <div>
            <Paper className={classes.tooltip}>
                <Typography variant='subtitle1'>Lat: {props.lat}</Typography>
                <Typography variant='subtitle1'>Lon: {props.lon}</Typography>
                <Typography variant='subtitle1'>{props.info}</Typography>
            </Paper>
        </div>
    )
}

export default withStyles(styles)(VizTooltip);