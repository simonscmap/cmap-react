import React, { useState } from 'react';
import { connect } from 'react-redux';
import { withStyles, IconButton, Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import { Help } from '@material-ui/icons';

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
                    className: classes.dialogPaper
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