// Reuseable icon that shows help when clicked. Accepts help contents as a prop

import React from 'react';
import { withStyles, IconButton, Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import { Help } from '@material-ui/icons';

import colors from '../../Enums/colors';
import z from '../../Enums/zIndex';

const styles = (theme) => ({
    dialogPaper: {
        backgroundColor: '#1B445C'
    },

    dialogPaperViz: {
        backgroundColor: colors.backgroundGray
    },

    dialogRoot: {
        zIndex: `${z.HELP_DIALOG} !important`,
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

export default withStyles(styles)(HelpButtonAndDialog);