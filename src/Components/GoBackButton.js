import React from 'react';

import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';

const styles = (theme) => ({
    buttonPaper: {
        width: '60px',
        height: '60px',
        padding: theme.spacing(0.5),
        position:'fixed',
        left: '10px',
        top: '10px',
        zIndex: 2,
        textDecoration:'none'
    },

    goBackText: {
        marginTop:'0px'
    }
})

const GoBackButton = (props) => {
    const { classes } = props;

    return (
        <div>
            <Paper className={classes.buttonPaper} component={Link} to={{pathname: '/'}}>
                <img src="https://simonscmap.com/images/catalog/coverage_global.png" alt="Globe" height="36" width="36"/>
                <h6 className={classes.goBackText}>Go Back</h6>
            </Paper>
        </div>
    )
}

export default withStyles(styles)(GoBackButton);