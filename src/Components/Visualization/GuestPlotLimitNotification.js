import React from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import { Dialog, DialogContent, Link, Typography, withStyles } from '@material-ui/core';

import { guestPlotLimitNotificationSetIsVisible } from '../../Redux/actions/visualization';
import { showLoginDialog } from '../../Redux/actions/ui';

import z from '../../Enums/zIndex';
import colors from '../../Enums/colors';

const styles = (theme) => ({
    dialogWrapper: {
        backgroundColor: colors.backgroundGray
    },

    dialogRoot: {
        zIndex: `${z.NON_HELP_DIALOG + 1} !important`
    },

    link: {
        fontSize: '16px',
        lineHeight: '24px'
    }
});

const mapStateToProps = (state) => ({
    guestPlotLimitNotificationIsVisible: state.guestPlotLimitNotificationIsVisible
});

const mapDispatchToProps = {
    guestPlotLimitNotificationSetIsVisible,
    showLoginDialog
}

const GuestPlotLimitNotification = (props) => {
    const { classes } = props;

    const handleLoginButtonClick = () => {
        props.guestPlotLimitNotificationSetIsVisible(false);
        props.showLoginDialog();
    }

    return (
        <Dialog
            open={props.guestPlotLimitNotificationIsVisible}
            open={true}
            onClose={() => props.guestPlotLimitNotificationSetIsVisible(false)}
            PaperProps={{
                className: classes.dialogWrapper
            }}
            classes={{
                root: classes.dialogRoot
            }}
        >
            <DialogContent>
                <Typography>
                    Guests are limited to 5 plots per day.
                </Typography>

                <Typography>
                    Please <Link component='button' onClick={handleLoginButtonClick} className={classes.link}>log 
                    in </Link> or <Link component={RouterLink} to={'/register'} className={classes.link}> register </Link> to continue.
                </Typography>
            </DialogContent>
        </Dialog>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(GuestPlotLimitNotification));