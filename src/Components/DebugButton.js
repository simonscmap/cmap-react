import React from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';

const mapStateToProps = (state, ownProps) => ({
    ...state
})

const mapDispatchToProps = {

}

const styles = (theme) => ({

    buttonPaper: {
        width: '60px',
        height: '60px',
        padding: theme.spacing(0.5),
        position:'fixed',
        left: '10px',
        bottom: '10px',
        zIndex: 2,
        textDecoration:'none',
        cursor: 'pointer'
    },

    goBackText: {
        marginTop:'0px'
    }
})

const DebugButton = (props) => {
    const { classes } = props;

    const logState = () => {
        props.statePieces.forEach(statePiece => {
            console.log(statePiece);
            console.log(props[statePiece]);
        })
    }

    return (
        <div>
            <Paper className={classes.buttonPaper} onClick={logState}>
                <img src="https://simonscmap.com/images/catalog/coverage_global.png" alt="Globe" height="36" width="36"/>
                <h6 className={classes.goBackText}>Debug</h6>
            </Paper>
        </div>
    )
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DebugButton));
