import React from 'react';
import { connect } from 'react-redux';

import Snackbar from '@material-ui/core/Snackbar';
import { withStyles } from '@material-ui/core/styles';

import { snackbarClose } from '../Redux/actions/ui';

const mapStateToProps = (state, ownProps) => ({
    snackbarIsOpen: state.snackbarIsOpen,
    snackbarMessage: state.snackbarMessage
})

const mapDispatchToProps = {
    snackbarClose,
}

const styles = (theme) => {
    return ({
        centerText: {
            textAlign: 'center'
        }
    })
}

const SnackbarWrapper = (props) => {
    const { classes } = props;
    return (
        
        <React.Fragment>
            <Snackbar 
                className={classes.centerText}
                autoHideDuration={4000} 
                message={props.snackbarMessage}
                onClose={props.snackbarClose}
                open={props.snackbarIsOpen}
                anchorOrigin={{horizontal:'center', vertical:'top'}}
            />
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SnackbarWrapper));