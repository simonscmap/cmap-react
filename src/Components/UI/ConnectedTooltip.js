import React from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Tooltip from '@material-ui/core/Tooltip';

import colors from '../../Enums/colors';

const styles = theme => ({
    tooltip: {
        color: '#00FFFF',
        fontSize: '13px',
        boxShadow: '0px 1px 1px 1px #242424',
        padding: '12px',
        borderRadius: '7px',
        textAlign: 'center'
    }
})

const mapStateToProps = (state, ownProps) => ({
    showHelp: state.showHelp
})

const ConnectedTooltip = (props) => {
    const { classes, showHelp } = props;

    if(!showHelp) {
        return (
            <React.Fragment>
                {props.children}
            </React.Fragment>
        )}
    else {
        return (
            <Tooltip 
                placement={props.placement} 
                open={showHelp} 
                title={props.title} 
                classes={{tooltip: classes.tooltip}}
            >
                {props.children}
            </Tooltip>
        )
    }
}

export default connect(mapStateToProps, null)(withStyles(styles)(ConnectedTooltip));