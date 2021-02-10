import React, { useState } from 'react';
import { connect } from 'react-redux';
import { withStyles, IconButton, Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import { Help } from '@material-ui/icons';

import colors from '../../Enums/colors';

const mapStateToProps = (state, ownProps) => ({

})

const mapDispatchToProps = {

}

const styles = (theme) => ({
    showHelpButton: {
        marginRight: '-4px'
    },

    dialogPaper: {
        backgroundColor: '#1B445C'
    },

    dialogPaperViz: {
        backgroundColor: colors.backgroundGray
    },

    dialogRoot: {
        zIndex: '31100 !important'
    }
});

const HelpButtonAndDialog = (props) => {
    const { title, content, buttonClass, classes, iconClass } = props;

    const [ open, setOpen ] = React.useState(false);

    return (
        <React.Fragment>
            <IconButton className={buttonClass} onClick={() => setOpen(true)}>
                <Help className={iconClass}/>
            </IconButton>

            <Dialog 
                onClose={() => setOpen(false)} 
                open={open}
                PaperProps={{
                    className: window.location.pathname.includes('/visualization') ? classes.dialogPaperViz : classes.dialogPaper
                }}
                classes={{
                    root: classes.dialogRoot
                }}
            >
                <DialogTitle>{title}</DialogTitle>

                <DialogContent>
                    {content}
                </DialogContent>
            </Dialog>
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(HelpButtonAndDialog));