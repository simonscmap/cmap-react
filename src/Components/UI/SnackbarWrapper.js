import React from 'react';
import { connect } from 'react-redux';

import Snackbar from '@material-ui/core/Snackbar';
import { withStyles } from '@material-ui/core/styles';

import { snackbarClose } from '../../Redux/actions/ui';

import z from '../../enums/zIndex';

const mapStateToProps = (state, ownProps) => ({
    snackbarIsOpen: state.snackbarIsOpen,
    snackbarMessage: state.snackbarMessage
})

const mapDispatchToProps = {
    snackbarClose,
}

const styles = (theme) => {
    return ({
        snackbar: {
            zIndex: z.SNACKBAR
        }
    })
}

const SnackbarWrapper = (props) => {
    const { classes } = props;
    return (
        
        <React.Fragment>
            <Snackbar
                autoHideDuration={null} 
                message={props.snackbarMessage}
                onClose={props.snackbarClose}
                open={props.snackbarIsOpen}
                anchorOrigin={{horizontal:'center', vertical:'top'}}
                className={classes.snackbar}
            />
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SnackbarWrapper));