import React from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';

import { clearCharts, clearMaps } from '../Redux/actions/visualization';

const mapStateToProps = (state, ownProps) => ({

})

const mapDispatchToProps = {
    clearCharts,
    clearMaps
}

const styles = (theme) => ({

    buttonPaper: {
        width: '60px',
        height: '60px',
        padding: theme.spacing(0.5),
        position:'fixed',
        left: '10px',
        top: '250px',
        zIndex: 2,
        textDecoration:'none',
        cursor: 'pointer'
    },

    goBackText: {
        marginTop:'0px'
    }
})

const ClearVisualizationsButton = (props) => {
    const { classes } = props;

    const clearVisualizations = () => {
        props.clearCharts();
        props.clearMaps();
    }

    return (
        <div>
            <Paper className={classes.buttonPaper} onClick={clearVisualizations}>
                <img src="https://simonscmap.com/images/catalog/coverage_global.png" alt="Globe" height="36" width="36"/>
                <h6 className={classes.goBackText}>Clear</h6>
            </Paper>
        </div>
    )
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ClearVisualizationsButton));
