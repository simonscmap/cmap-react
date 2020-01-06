import React from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Tooltip from '@material-ui/core/Tooltip';

const styles = theme => ({
  tooltip: {
      color: theme.palette.secondary.main,
      opacity: 1
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
                className={classes.tooltip}
                classes={{
                    popper: classes.tooltip
                }}
            >
                {props.children}
            </Tooltip>
        )
    }
}

export default connect(mapStateToProps, null)(withStyles(styles)(ConnectedTooltip));