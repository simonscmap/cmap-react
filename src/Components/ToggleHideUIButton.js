import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';

const styles = (theme) => ({
    buttonPaper: {
        width: '60px',
        height: '60px',
        padding: theme.spacing(0.5),
        position:'fixed',
        left: '10px',
        top: '170px',
        zIndex: 2,
        textDecoration:'none',
        cursor: 'pointer'
    },

    goBackText: {
        marginTop:'0px'
    }
})

const GoBackButton = (props) => {
    const { classes, showUI } = props;

    return (
        <div>
            <Paper className={classes.buttonPaper} onClick={props.toggleShowUI}>
                <img src="https://simonscmap.com/images/catalog/coverage_global.png" alt="Globe" height="36" width="36"/>
                <h6 className={classes.goBackText}>{showUI ? 'Hide UI' : 'Show UI'}</h6>
            </Paper>
        </div>
    )
}

export default withStyles(styles)(GoBackButton);